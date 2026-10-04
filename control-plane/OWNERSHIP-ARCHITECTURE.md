# Dog Tag Day Owned Control Plane

## Ownership target
Dog Tag Day owns the source code, configuration, orchestration, media references, publishing logic, browser-control logic, logs, and cutover policy.

## Architecture
- Master source: `rshure001/DogTagDay`
- Browser Control: outer execution/control layer
- Publishing Engine: platform publishing core
- Broadcast Control: commercial queue and rotation
- Control Plane: health, cutover, rollback, and ownership state
- AppDeploy: replaceable deployment/runtime provider, not the source of truth

## Cutover rule
Legacy services remain live until the Dog Tag Day replacement has passed health and publishing tests. No destructive cutover is permitted merely because a replacement exists.

## Platform lanes
TikTok, YouTube, Facebook, Instagram, email, website health, logs, and secret-health each operate independently so one platform failure does not take down the others.

## Security
No API secrets, OAuth tokens, runtime tokens, or private credentials belong in this repository. They must remain in a secure secret store.

## Recovery
Every migration must preserve a working fallback and a rollback path before production cutover.
