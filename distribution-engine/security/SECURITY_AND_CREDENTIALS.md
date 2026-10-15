# Security and Credential Protection

## Rules
- Platform passwords are never stored by the distribution engine.
- OAuth access and refresh tokens are stored only in a managed secret store, never in source code, logs, browser local storage, or public configuration.
- The UI receives status and short-lived action results, never raw credentials.
- Each platform uses its own credential namespace and least-privilege scopes.
- Secrets are encrypted at rest and protected in transit.
- Production secrets are separated from development/test credentials.
- Reconnection rotates/replaces credentials when the provider supports it.
- Revocation immediately changes the platform state to REVOKED and disables publishing for that platform.

## Access control
Operator actions require authenticated access. Destructive actions such as revoke, cancel campaign, or credential rotation require explicit confirmation.

## Logging
Never log Authorization headers, cookies, OAuth codes, tokens, passwords, secret values, or complete provider payloads containing credentials.

## Incident response
If a secret is suspected exposed: disable the affected connection, rotate/revoke the credential, record an incident event, verify the platform connection, and only then return the platform to the queue.

## Backups
Backups may contain operational records but must exclude live credentials unless they are stored through the provider's encrypted secret-management mechanism.