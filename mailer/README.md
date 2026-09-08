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
node mailer.mjs recipient@example.org 'Dog Tag Day — April 18' 'Message text here'
```

A provider credential is still required to actually transmit mail. The code does not bypass provider authorization or anti-spam controls.
