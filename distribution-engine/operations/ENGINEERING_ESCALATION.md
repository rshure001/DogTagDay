# Engineering Escalation

## Purpose
Keep day-to-day operation simple while ensuring technical failures have a defined engineering path.

## Escalation levels
1. **Automatic recovery** — retry, backoff, verification, or safe reconnect.
2. **Operator action** — dashboard presents one clear action such as Reconnect, Retry, Review, or Pause.
3. **Engineering escalation** — unresolved integration, code, deployment, schema, security, or provider-contract problem is captured with diagnostics and surfaced for engineering repair.

## Diagnostic bundle
An escalation should include:
- platform
- campaign/job ID
- current state
- normalized error class
- timestamps
- last successful verification
- retry count
- provider reference when available
- relevant application/deployment version

Never include secrets, access tokens, cookies, or passwords.

## Recovery rule
After an engineering repair, run a health check and a controlled test job before returning the affected platform to normal rotation.

## Operator experience
Ronnie should never be asked to interpret stack traces or edit source code to resolve a routine campaign problem.