# Dog Tag Day Mailer

Server-side outbound email module for Dog Tag Day Foundation. It is intentionally separate from the public GitHub Pages site so SMTP credentials never reach browser code.

## What it does
- Sends one recipient per message.
- Normalizes and validates recipient addresses.
- Uses an idempotency hash so the same message is not sent twice to the same address.
- Records every attempt in `ledger.json`.
- Records SMTP acceptance/rejection and provider message ID.
- Keeps transport credentials in environment variables only.

## Required environment variables
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
Optional: `MAIL_REPLY_TO`.

## Run
```bash
npm install
SMTP_HOST=... SMTP_PORT=587 SMTP_USER=... SMTP_PASS=... MAIL_FROM='Dog Tag Day <sender@example.org>' \
node mailer.mjs recipient@example.org 'Dog Tag Day — April 18, 2027' 'The upcoming Dog Tag Day observance is April 18, 2027. Our current outreach is building awareness and partnerships.'
```

A provider credential is still required to actually transmit mail. The code does not bypass provider authorization or anti-spam controls.

## Outreach date and reuse
- For the upcoming observance, every new outreach subject and body must explicitly say `April 18, 2027`.
- Current outreach builds awareness and partnerships for that observance. Do not imply an October event without confirmed event details.
- Reuse `campaign.txt`, the top-level defaults in `messages.json`, or copy in `outreach/ready/first-wave-veterans-organizations.json`. In `messages.json`, only unsent `ready` or failed-before-submission records are candidates for future copy updates; retain their existing status and attempt history.
- Preserve sent/submitted message records and `ledger.json`. The completed `outreach/queue/2026-09-09-wave-verified-001.json` is sent history, not a template; leave its contents and status unchanged.
- Editing copy does not authorize sending a batch, retrying a failed message, or requeuing completed outreach.
