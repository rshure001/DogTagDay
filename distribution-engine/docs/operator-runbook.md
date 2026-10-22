# Operator Runbook

## What Ronnie sees
Each platform reports one of: HEALTHY, RECONNECT REQUIRED, RATE LIMITED, FAILED, or PAUSED.

## Reconnect
When OAuth expires, the dashboard must show a single **Reconnect** action. The operator authorizes the platform; the engine verifies the resulting connection before returning it to HEALTHY.

## Recovery
Recoverable errors are retried automatically. Authentication failures are never retried indefinitely. Rate limits are delayed. Content rejection is surfaced for operator review.

## Safety
- Never expose access tokens in the UI or logs.
- Never mark a post published from an attempted submission alone.
- Never resubmit an item with an unresolved provider result until duplicate status is checked.
- Keep an immutable publication record with platform, commercial, attempt time, provider response, and final status.