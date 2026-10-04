# End-to-End Test Plan

## Test suites
1. Connection lifecycle: disconnected → authorization → connected → health verification.
2. Queue lifecycle: scheduled → ready → publishing → confirmed.
3. Duplicate safety: identical campaign/platform/commercial/slot cannot create a second job.
4. Ambiguous result: timeout never becomes success; provider verification runs before retry.
5. Retry: transient failures back off and stop after the configured maximum.
6. Isolation: failure on one platform does not stop other platform jobs.
7. Authentication failure: platform enters AUTH_REQUIRED and dashboard exposes Reconnect.
8. Rate limit: platform job defers without blocking other platforms.
9. Content rejection: job becomes terminal and surfaces the provider reason.
10. Audit: every material state transition creates an event without secrets.
11. Security: tokens/passwords/cookies are absent from UI and logs.
12. Recovery: after repair, health check plus controlled test is required before normal rotation.

## Production gate
A platform is not marked production-ready until its real provider authorization, health check, controlled publication, and read-back verification have passed. Documentation/specification alone cannot mark the platform green.
