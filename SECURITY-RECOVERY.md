# Dog Tag Day Security Recovery Record

Created: 2026-09-08

This branch is an independent recovery snapshot of the Dog Tag Day website source from `main`.

## Recovery priority
1. Preserve domain control for dogtagday.org.
2. Preserve GitHub repository ownership and this recovery branch.
3. Preserve authorized email accounts and prevent impersonation.
4. Preserve authorized donation/payment routing; never replace payment destinations without Founder authorization.
5. Preserve Dog Tag Day Foundation identity and branding assets.

## Incident rule
If production is corrupted or maliciously modified, do not delete the repository or recovery branches. Compare production/main with this known recovery snapshot before restoring.

## Critical integrity checks
- CNAME must remain dogtagday.org unless an authorized migration is intentionally performed.
- Donation/payment destinations must be verified before deployment.
- Never commit passwords, API tokens, recovery codes, bank information, or private keys to this public repository.
- Unexpected changes to domain routing, payment destinations, forms, or contact addresses should be treated as a security incident.
