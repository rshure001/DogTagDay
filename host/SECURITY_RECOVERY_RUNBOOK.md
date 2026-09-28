# Dog Tag Day Security Perimeter & Recovery Runbook

## Scope
This runbook covers the Dog Tag Day owned control-plane infrastructure. It does not change the public DogTagDay.org website.

## Security perimeter
1. Source code: GitHub is the version-controlled source of truth.
2. Operational backend: Dog Tag Day Supabase project.
3. Secrets: Supabase Vault only. Never place provider secrets, OAuth tokens, passwords, or recovery codes in GitHub, logs, screenshots, or chat.
4. Control writes: protected control-token route only; anonymous database access is blocked with RLS.
5. Audit trail: important broadcast queue, platform-status, and secret-reference metadata changes are written to security_audit_log. Secret values are never logged.
6. Operational backups: broadcast queue, platform status, and the latest 100 run records are snapshotted every six hours into operational_backups with checksums and 30-day retention.
7. Publishing truth: PUBLISHED requires provider confirmation. Other states remain SUBMITTED, FAILED, RETRY, or SKIPPED.
8. Media: preserve approved masters untouched. Edits use working copies.

## Daily checks
- Confirm dogtag-owned-broadcast-hourly is active.
- Confirm dogtag-operational-backup is active.
- Confirm Commercial #1, #2, and #3 remain enabled with valid master locations.
- Confirm Johnny remains HOLD until its exact approved master is recovered.
- Review recent FAILED/RETRY broadcast results.
- Review security_audit_log for unexpected changes.

## Incident response
### If a platform token is compromised
1. Revoke the provider token at the provider.
2. Rotate the corresponding developer secret if needed.
3. Replace the secret in Supabase Vault.
4. Re-authorize the platform.
5. Verify broadcast_platform_status.
6. Record the incident and resolution in the audit log.

### If the host is unavailable
1. Verify the Supabase project health.
2. Confirm the dogtag-control Edge Function is ACTIVE.
3. Inspect edge-function logs for errors.
4. Confirm scheduler jobs remain active.
5. Do not create duplicate broadcast runs while recovering.

### If the database is damaged or data is accidentally changed
1. Stop automated publishing before restoration.
2. Identify the latest known-good operational_backups snapshot.
3. Verify its checksum.
4. Restore broadcast_queue and broadcast_platform_status from that snapshot.
5. Restore recent run records only when needed for deduplication/history.
6. Re-enable publishing after verification.

### If a master media file is lost
1. Do not substitute another commercial.
2. Mark the commercial HOLD / MASTER NEEDED.
3. Recover from protected master storage or prior approved provider copies.
4. Preserve the recovered original untouched.
5. Copy a confirmed master into Dog Tag Day controlled storage.
6. Update broadcast_queue only after verification.

## Recovery priorities
1. Protect secrets and stop unauthorized writes.
2. Prevent duplicate public posts.
3. Preserve approved master media.
4. Restore queue and platform state.
5. Restore publishing only after verification.

## Change rule
Every infrastructure change should be reversible, auditable, and should avoid touching the public website unless explicitly requested.
