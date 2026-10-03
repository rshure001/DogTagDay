# Dog Tag Day Super House

Cloudflare-first broadcast control plane.

## Rules

1. A commercial is never deleted by the broadcast system.
2. A failed publishing engine is replaced by the next engine; it is not patched in place.
3. Every job is queued before publication.
4. Publication must be independently verified.
5. Primary, backup, and emergency publisher engines remain isolated.
6. Credentials are stored as Cloudflare secrets, never in Git.

## Free-plan foundation

- Workers
- Queues
- Workers Logs
- D1/KV only where their free limits fit the workload

Cloudflare Workers Free currently includes 100,000 requests/day. Cloudflare Queues Free currently includes 10,000 operations/day.

## Deployment

Connect this repository to the existing Cloudflare account and deploy with Wrangler. Configure these secrets/variables in Cloudflare:

- PUBLISHER_A_URL
- PUBLISHER_B_URL
- PUBLISHER_EMERGENCY_URL

The publishing engines themselves remain replaceable modules.

## Important

This repository does not contain Meta, TikTok, YouTube, or other private credentials. Those must be supplied through the existing authorized platform connections.
