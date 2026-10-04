# Retry and Failure Handling

## Failure classes
- AUTH_REQUIRED: stop that platform, request reconnect, do not loop.
- RATE_LIMITED: defer according to provider retry-after or configured backoff.
- TRANSIENT_PROVIDER_ERROR: exponential backoff, maximum 3 automatic attempts.
- NETWORK_TIMEOUT: verify provider state before retrying because publication may have succeeded.
- CONTENT_REJECTED: terminal for that job; surface the reason to the operator.
- UNKNOWN: quarantine the job and require verification before another attempt.

## Isolation
Each platform has its own worker and retry state. A TikTok failure cannot pause Facebook, Instagram, or YouTube.

## Recovery
Successful provider verification moves the job to CONFIRMED. Exhausted retries move it to NEEDS_OPERATOR. The dashboard must show the commercial, platform, error class, last attempt, and recommended action.

## No false success
A retry attempt is never equivalent to publication. Confirmation is required before the job is green.
