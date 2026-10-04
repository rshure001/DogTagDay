# Duplicate Protection

## Idempotency key
Every publication job receives a deterministic key:

campaignId + platformId + commercialId + scheduledSlot

The key is unique within the campaign. A job cannot be created twice with the same key unless the prior job is explicitly resolved as failed/cancelled.

## Before publication
1. Check local publication ledger.
2. If CONFIRMED, do not publish.
3. If PUBLISHING/AMBIGUOUS, verify the provider before retrying.
4. If provider already contains the matching post, reconcile the ledger as CONFIRMED.
5. Only an unresolved FAILED job may enter the retry queue.

## Provider evidence
A successful API response alone is not sufficient when the provider reports an ambiguous result. Verification should use provider post ID/URL or equivalent platform evidence.

## Operator override
An override requires an explicit reason and creates an audit entry. The system must warn before an override can create a potential duplicate.
