import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const LEDGER = new URL('./ledger.json', import.meta.url);

async function readLedger() {
  try { return JSON.parse(await fs.readFile(LEDGER, 'utf8')); }
  catch { return { sent: {}, attempts: [] }; }
}
async function writeLedger(data) {
  await fs.writeFile(LEDGER, JSON.stringify(data, null, 2));
}
function normalizeEmail(v='') { return v.trim().toLowerCase(); }
function keyFor(email, subject, body) {
  return crypto.createHash('sha256').update(`${normalizeEmail(email)}\n${subject}\n${body}`).digest('hex');
}

const required = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','MAIL_FROM'];
for (const name of required) if (!process.env[name]) throw new Error(`Missing ${name}`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
});

export async function sendOne({ to, subject, text, replyTo }) {
  const email = normalizeEmail(to);
  if (!email || !email.includes('@')) throw new Error('Invalid recipient');
  const ledger = await readLedger();
  const idem = keyFor(email, subject, text);
  if (ledger.sent[idem]) return { skipped: true, reason: 'already-sent', ...ledger.sent[idem] };

  const attempt = { email, at: new Date().toISOString(), status: 'attempting' };
  ledger.attempts.push(attempt);
  await writeLedger(ledger);

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
      subject,
      text,
    });
    const result = {
      skipped: false,
      status: 'sent',
      messageId: info.messageId,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
      response: info.response || null,
      at: new Date().toISOString(),
    };
    ledger.sent[idem] = result;
    attempt.status = 'sent';
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
  if (!to || !subject || !text) {
    console.error('Usage: node mailer.mjs recipient@example.org "Subject" "Body"');
    process.exit(2);
  }
  const result = await sendOne({ to, subject, text });
  console.log(JSON.stringify(result, null, 2));
}
