import fs from 'node:fs/promises';
import { sendOne } from './mailer.mjs';

const recipientsText = await fs.readFile(new URL('./recipients.csv', import.meta.url), 'utf8');
const message = JSON.parse(await fs.readFile(new URL('./messages.json', import.meta.url), 'utf8'));
const recipients = [...new Set(recipientsText.split(/\r?\n/).slice(1).map(v => v.trim()).filter(Boolean).map(v => v.toLowerCase()))];

let submitted = 0, skipped = 0, failed = 0;
for (const to of recipients) {
  try {
    const result = await sendOne({ to, subject: message.subject, text: message.body, replyTo: message.replyTo });
    if (result.skipped) skipped += 1;
    else submitted += 1;
    console.log(JSON.stringify({ to, ok: true, ...result }));
  } catch (error) {
    failed += 1;
    console.error(JSON.stringify({ to, ok: false, status: 'failed', error: String(error?.message || error) }));
  }
}
console.log(JSON.stringify({ total: recipients.length, submitted, skipped, failed }));
