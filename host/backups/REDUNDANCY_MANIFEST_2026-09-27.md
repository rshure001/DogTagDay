# Dog Tag Day Redundancy Manifest
Date: 2026-09-27

## Purpose
Integrity and recovery manifest for critical Dog Tag Day media and operational cloud assets.

## Protected media — Library primary + Library redundant copy
Each item below exists in the protected master area and has also been copied into:
`/Dog Tag Day/Redundant Cloud Backup/Protected Masters/`

| File | Size (bytes) | SHA-256 |
|---|---:|---|
| Dog_Tag_Day_17.2_Million_Johnny_Barely_Audible_APPROVED_MASTER.mp4 | 3013882 | ee7802da90c7cf67687172bc58c07a377b865c41e331f68d817b05773aff95a6 |
| Dog_Tag_Day_Current_Website_Walkout_CINEMATIC_CLEAN_PROTECTED.mp4 | 1022446 | 1c3395cda3c50f516adfb1ec28c2d303453e360a3034ff00350c58005afe23e9 |
| Dog_Tag_Day_ORIGINAL_Banner_Soldiers_Walkout_PROTECTED.mp4 | 4902493 | 4abf66f53fae5bf953ebd3c5c8313010981eb47dc085645eadd6b20ee522566c |
| Dog_Tag_Day_Soldiers_Walkout_CLEAN_WORKING_COPY.mp4 | 2097223 | 2ca6373b68e248186a956b4b5ff7c97d43ff466181d1e6bbe03061d663918c62 |
| Dog_Tag_Day_Walkout_20s_REAL_BAND_PLATFORM_MASTER.mp4 | 4134502 | 232906b99884d869d878dd22d2689d9a8093cbcc623249af18c05a63296b0c21 |

## Important discovery
The approved Johnny master is present in protected storage under:
`Dog_Tag_Day_17.2_Million_Johnny_Barely_Audible_APPROVED_MASTER.mp4`

Do not publish it from the Library path directly. It still needs a durable provider-accessible copy before enabling it in the owned broadcast queue.

## Operating records — redundant Library copy
The following records were copied into:
`/Dog Tag Day/Redundant Cloud Backup/Operating Records/`

- Dog_Tag_Day_Commercial_Package_LOCKED_2026-09-27.md
- Dog_Tag_Day_Media_Commercial_Control_Register_2026-09-27.md
- Dog-Tag-Day-Commercial-Publication-Log.md

## Supabase protection
- dogtag-operational-backup: active, every 6 hours
- dogtag-owned-broadcast-hourly: active
- operational snapshots retained for 30 days
- security audit logging enabled

## Broadcast state
- Commercial #1: READY
- Commercial #2: READY
- Commercial #3 — Soldiers Step Out: READY
- Johnny: protected master recovered; HOLD in broadcast queue until a durable platform-accessible copy is created

## Recovery rule
Never replace a protected original. Use working copies for edits, verify SHA-256 before restoration, and never enable a broadcast item without a confirmed media location.
