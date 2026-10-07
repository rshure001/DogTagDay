# Platform Connection Manager

The connection manager is designed around provider-neutral connection states and explicit operator actions.

## State machine
- DISCONNECTED: no usable authorization.
- CONNECTING: authorization flow started.
- CONNECTED: credentials stored securely.
- HEALTHY: connection verified by a provider health check.
- AUTH_REQUIRED: provider requires reauthorization.
- DEGRADED: provider responds but publishing capability is unavailable.
- REVOKED: authorization was explicitly revoked.

## Contract
1. Never store platform passwords.
2. Never expose OAuth access/refresh tokens to the browser UI.
3. Reconnect must be provider-specific and least-privilege.
4. A connection becomes HEALTHY only after a live provider verification succeeds.
5. Publishing workers consume only HEALTHY connections.
6. A failed platform connection must not stop other platform workers.

## Operator UX
The dashboard exposes: platform status, last verified time, failure reason, and one Reconnect action when AUTH_REQUIRED/REVOKED. Technical token details are never shown.

## Adapter interface
Each provider adapter must implement:
- getConnectionStatus()
- beginAuthorization()
- verifyConnection()
- revokeConnection()
- publish(media, metadata)

The adapter returns normalized statuses so the queue can remain provider-independent.
