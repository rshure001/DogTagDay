# Cloudflare Reach

A small read-only diagnostic tool for connecting to the Cloudflare account and inspecting Pages projects/deployments. It does not modify DNS, Workers, Pages projects, or deployments.

## Required token

Create a Cloudflare API token with the minimum permission:

- Account
- Cloudflare Pages
- Read

Restrict the token to the one Cloudflare account that hosts EverythingHub. Do not grant DNS, Workers, Zone, or account-administration write permissions.

Set these environment variables in a trusted terminal:

- `CLOUDFLARE_API_TOKEN` — the token value
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID

Never commit the token, paste it into source files, or expose it in browser JavaScript.

## Run

Requires Node.js 18 or newer (native `fetch`).

```sh
node scripts/cloudflare-reach.mjs whoami
node scripts/cloudflare-reach.mjs projects
node scripts/cloudflare-reach.mjs deployments <pages-project-name>
```

## Safety boundary

This first version is intentionally read-only. It verifies the token and lists Pages projects/deployments so the target can be confirmed before any deployment capability is added. It does not touch DogTagDay.org or any production resource.
