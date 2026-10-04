# Unified Integration Contract

## Purpose
Dog Tag Day operates one control plane around the existing publishing and browser infrastructure. The migration is an absorption process, not a second-stack deployment.

## Runtime layers
1. Control Plane — single operator doorway, health, routing, cutover state and recovery.
2. Browser Control — outer execution layer for browser-driven workflows.
3. Publishing Engine — platform API publishing core.
4. Broadcast Control — commercial queue, rotation and cadence.
5. Platform Lanes — TikTok, YouTube, Facebook, Instagram and future channels.
6. Legacy Providers — temporary execution fallbacks only.

## Routing rule
All operator actions enter through the Control Plane. The Control Plane selects the healthy owned lane first and the legacy fallback only when the owned lane is unavailable or not yet cut over.

## Migration rule
A lane changes from migration_pending to owned only after:
- health check passes;
- authentication state is available without exposing credentials;
- test publish succeeds where platform policy permits;
- logs record the action and result;
- rollback path is confirmed.

## Failure isolation
A failed platform lane must not block other lanes. Queue state and media references remain independent from platform credentials.

## Cutover rule
Never remove the legacy implementation solely because the owned implementation exists. Remove it only after a successful production verification window and an explicit rollback checkpoint.

## Credential rule
OAuth tokens, passwords, runtime tokens and private API credentials never enter GitHub. The control plane stores only references and health state.

## Current first lane
Browser/control integration is the outermost migration layer. It wraps the existing browser connector first; its internals can then be replaced without changing the operator-facing control surface.
