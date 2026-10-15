# Dog Tag Day Distribution Engine

Engineering foundation for Dog Tag Day's owned media-distribution system.

## Operating model
- Ronnie is the campaign operator.
- The engine owns scheduling, queueing, verification, retries, and audit logging.
- Platform credentials are OAuth secrets only; never store passwords.
- Each platform is isolated behind an adapter so one failure cannot stop the others.

## Initial platforms
Facebook, Instagram, TikTok, YouTube.

## Required states
CONNECTED → HEALTHY → QUEUED → PUBLISHING → CONFIRMED

Failure states: AUTH_REQUIRED, RATE_LIMITED, PLATFORM_ERROR, CONTENT_REJECTED, UNKNOWN.

No item is marked published without platform confirmation.