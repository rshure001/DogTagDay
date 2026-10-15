# Campaign Scheduler

Default approved rotation for Dog Tag Day:
- cadence: every 3 hours
- even slots: Commercial #1
- odd slots: Commercial #2
- platforms: Facebook, Instagram, TikTok, YouTube

## Scheduler contract
The scheduler creates one independent queue job per platform for each slot. It never assumes publication succeeded. Workers must return provider confirmation before a job is marked CONFIRMED.

## Operator controls
- Pause/resume campaign
- Change cadence
- Change approved commercial rotation
- Skip a slot
- Cancel queued slot
- Run an immediate approved slot

## Safety
Changing a schedule does not modify already-confirmed posts. Paused campaigns retain queued history. Every schedule change is audited with timestamp, previous value, new value, and operator identity.
