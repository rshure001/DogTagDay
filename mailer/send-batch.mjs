import fs from 'node:fs/promises';
import { sendOne } from './mailer.mjs';

const SUBJECT = process.env.MAIL_SUBJECT || 'Dog Tag Day — April 18 Veteran Visibility Initiative';
const recipientsText = await fs.readFile(new URL('./recipients.csv', import.meta.url), 'utf8');
const body = await fs.readFile(new URL('./campaign.txt', import.meta.url), 'utf8');

const recipients = [...new Set(recipientsText.split(/\r?\n/).slice(1).map(v => v.trim()).filter(Boolean).map(v => v.toLowerCase()))];

let sent = 0, skipped = 0, failed = 0;
for (const to of recipients) {
  try {
    const result = await sendOne({ to, subject: SUBJECT, text: body });
    if (result.skipped) skipped += 1;
    else sent += 1;
    console.log(JSON.stringify({ to, ok: true, ...result }));
  } catch (error) {
    failed += 1;
    console.error(JSON.stringify({ to, ok: false, error: String(error?.message || error) }));
  }
}
console.log(JSON.stringify({ total: recipients.length, sent, skipped, failed }));
