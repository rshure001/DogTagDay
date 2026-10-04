# Dog Tag Day Lane Cutover Order

This is the production cutover order for the unified shell.

## Rule
No lane is marked owned until the readiness gate has verified health, publishing proof, logging proof, and rollback proof.

## Order
1. Browser control — outer execution layer
2. Broadcast control — queue and cadence
3. TikTok — first platform publishing lane
4. YouTube — second platform publishing lane
5. Facebook + Instagram — Meta lane
6. Email — outreach lane
7. Website health — independent monitoring

## Current state
- Browser control: integration layer built; legacy fallback retained.
- Broadcast control: unified adapter built; legacy fallback retained.
- TikTok: migration pending; no production cutover claimed.
- YouTube: connector pending; no production cutover claimed.
- Meta: connector pending; no production cutover claimed.
- Email: hardening pending.
- Website: legacy live.

## Cutover discipline
A code merge is not a production cutover.
A healthy API is not publishing proof.
A publishing proof is not permission to remove the fallback.

The control plane remains the single operator doorway while legacy components continue underneath until each lane is independently proven.
