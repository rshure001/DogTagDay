# Operator Dashboard

## Purpose
One screen for Ronnie to operate Dog Tag Day without needing platform engineering knowledge.

## Top-level status cards
- Facebook: HEALTHY / RECONNECT REQUIRED / RATE LIMITED / FAILED / PAUSED
- Instagram: same states
- TikTok: same states
- YouTube: same states

## Campaign panel
- Current commercial
- Next scheduled slot
- Rotation cadence
- Pause / Resume
- Run approved slot now
- Skip next slot

## Action panel
When a platform needs authorization, show **Reconnect**. When a job fails, show the plain-English reason and **Retry** when safe. Never expose tokens or technical credentials.

## Queue panel
Show QUEUED, PUBLISHING, CONFIRMED, AMBIGUOUS, FAILED, NEEDS_OPERATOR.

## Activity panel
Show latest publication, verification, failure, retry, and connection events with provider links when available.

## Design principle
The operator should be able to run the campaign from this dashboard without understanding OAuth, APIs, worker processes, databases, or deployment infrastructure.
