# Publication Verification

A job is CONFIRMED only after platform evidence is captured.

## Verification evidence priority
1. Provider-returned published post ID and URL.
2. Provider API/read-back showing the post exists with matching media/campaign metadata.
3. Authorized browser verification showing the public post and its URL.

## Required checks
- Correct platform/account
- Correct commercial/media identifier
- Public visibility appropriate to campaign
- Provider post ID/URL recorded
- Timestamp recorded
- Caption/metadata check when available

## Ambiguous results
If publication may have occurred but confirmation is missing, status remains AMBIGUOUS. The system must not retry until it performs a duplicate check.

## Dashboard
Show CONFIRMED, AMBIGUOUS, FAILED, or NOT PUBLISHED. Never display a green success indicator for an attempted-but-unverified post.
