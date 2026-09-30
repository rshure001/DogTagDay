# Dog Tag Day Control Plane V1

Purpose-built operations hub for Dog Tag Day.

## Rules
- Existing AppDeploy, Vercel, GitHub Pages, email senders, and social bridges stay online until a replacement lane is proven.
- One platform failure must not take down another.
- API secrets are never committed to GitHub.
- Every lane reports its own health, last action, last error, and cutover state.

## V1 lanes
1. TikTok OAuth + publishing
2. YouTube publishing
3. Facebook / Instagram publishing
4. Email outreach queue + suppression + delivery evidence
5. Website health
6. Logs / rollback
7. Secret-health status

## First cutover target
TikTok, because the existing AppDeploy bridge is currently blocked by free-credit limits.
