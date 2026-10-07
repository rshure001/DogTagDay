# Distribution Queue Specification

## Job lifecycle
QUEUED → READY → PUBLISHING → CONFIRMED

Recoverable: RETRY_WAIT → READY

Terminal: CONFIRMED, CONTENT_REJECTED, CANCELLED

## Rules
- Only HEALTHY platform connections may receive READY jobs.
- Each job has a unique idempotency key: commercial + platform + campaign slot.
- Before retrying an ambiguous result, verify the provider for an existing post using the idempotency key or equivalent provider evidence.
- A provider timeout is never treated as success.
- One platform's failure is isolated from all other platform jobs.
- Every attempt records start time, end time, provider response class, and final state.

## Scheduling
The scheduler creates platform-specific jobs from a campaign rotation. It does not publish directly. Workers perform publication and verification.
