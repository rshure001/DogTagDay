import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const LEDGER = new URL('./ledger.json', import.meta.url);

async function readLedger() {
  try { return JSON.parse(await fs.readFile(LEDGER, 'utf8')); }
  catch { return { sent: {}, attempts: [] }; }
}
async function writeLedger(data) { await fs.writeFile(LEDGER, JSON.stringify(data, null, 2)); }
function normalizeEmail(v='') { return v.trim().toLowerCase(); }
function keyFor(email, subject, body) {
  return crypto.createHash('sha256').update(`${normalizeEmail(email)}\n${subject}\n${body}`).digest('hex');
}

function smtpTransport() {
  for (const name of ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','MAIL_FROM']) {
    if (!process.env[name]) throw new Error(`Missing ${name}`);
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    pool: true,
    maxConnections: Number(process.env.MAIL_MAX_CONNECTIONS || 2),
    maxMessages: Number(process.env.MAIL_MAX_MESSAGES || 50),
  });
}

async function apiTransport({ to, subject, text, replyTo, idempotencyKey }) {
  for (const name of ['MAIL_API_URL','MAIL_API_TOKEN','MAIL_FROM']) {
    if (!process.env[name]) throw new Error(`Missing ${name}`);
  }
  const response = await fetch(process.env.MAIL_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.MAIL_API_TOKEN}`,
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text, reply_to: replyTo }),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Mail API ${response.status}: ${raw.slice(0,500)}`);
  let data = {};
  try { data = JSON.parse(raw); } catch { data = { response: raw }; }
  return { messageId: data.id || data.message_id || null, accepted: [to], rejected: [], response: raw };
}

async function submit({ to, subject, text, replyTo, idempotencyKey }) {
  const mode = (process.env.MAIL_TRANSPORT || 'smtp').toLowerCase();
  if (mode === 'api') return apiTransport({ to, subject, text, replyTo, idempotencyKey });
  const info = await smtpTransport().sendMail({ from: process.env.MAIL_FROM, to, replyTo, subject, text });
  return { messageId: info.messageId, accepted: info.accepted || [], rejected: info.rejected || [], response: info.response || null };
}

export async function sendOne({ to, subject, text, replyTo }) {
  const email = normalizeEmail(to);
  if (!email || !email.includes('@')) throw new Error('Invalid recipient');
  const ledger = await readLedger();
  const idem = keyFor(email, subject, text);
  if (ledger.sent[idem]) return { skipped: true, reason: 'already-sent', ...ledger.sent[idem] };

  const attempt = { email, at: new Date().toISOString(), status: 'attempting', transport: process.env.MAIL_TRANSPORT || 'smtp' };
  ledger.attempts.push(attempt);
  await writeLedger(ledger);

  try {
    const info = await submit({
      to: email,
      subject,
      text,
      replyTo: replyTo || process.env.MAIL_REPLY_TO || 'rshure001@yahoo.com',
      idempotencyKey: idem,
    });
    if (!info.accepted?.includes(email) && info.rejected?.includes(email)) throw new Error('Recipient rejected by transport');
    const result = { skipped: false, status: 'submitted', messageId: info.messageId, accepted: info.accepted || [], rejected: info.rejected || [], response: info.response || null, at: new Date().toISOString() };
    ledger.sent[idem] = result;
    attempt.status = 'submitted';
    attempt.messageId = info.messageId;
    await writeLedger(ledger);
    return result;
  } catch (error) {
    attempt.status = 'failed';
    attempt.error = String(error?.message || error);
    await writeLedger(ledger);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , to, subject, ...bodyParts] = process.argv;
  const text = bodyParts.join(' ');
  if (!to || !subject || !text) { console.error('Usage: node mailer.mjs recipient@example.org "Subject" "Body"'); process.exit(2); }
  console.log(JSON.stringify(await sendOne({ to, subject, text }), null, 2));
}
