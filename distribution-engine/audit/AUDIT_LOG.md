# Activity and Audit Log

## Purpose
Maintain a durable operational record for every campaign, schedule, connection, publication attempt, verification, retry, failure, and operator action.

## Minimum event fields
- eventId
- timestamp (UTC)
- eventType
- campaignId
- platformId (when applicable)
- commercialId (when applicable)
- jobId (when applicable)
- previousState
- newState
- result
- providerReference (post ID/URL when available)
- errorClass (when applicable)
- operatorAction (when applicable)

## Security
- Never record passwords, access tokens, refresh tokens, cookies, or secret values.
- Logs are append-only from the operator UI.
- Sensitive provider responses are normalized before storage.

## Operational views
The dashboard should provide: latest activity, failed jobs, pending reconnects, publication history, schedule changes, and platform health history.

## Audit rule
Every state transition that affects whether content can publish must produce an audit event.