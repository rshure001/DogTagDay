# Everything Hub free crawler

A separate, low-rate GitHub Actions crawler prototype for building a broader multi-topic index.

- Starts from a curated set of public sources spanning reference, science, government, health, culture, maps, education, and software.
- Stays on the explicitly allowlisted source hosts and checks robots.txt before fetching.
- Stores discovered URLs in a persistent frontier so later runs continue discovering pages instead of restarting from the homepages.
- Deduplicates canonical URLs and writes records to `everythinghub-index/pages.json`.
- Regenerates `everythinghub-index/sitemap.xml` after each run.
- Runs every six hours, with a maximum of 50 successful pages per run and a delay between requests.
- Uses GitHub Actions and public websites; no paid crawler subscription, API key, or AppDeploy deployment is required.

## Important limits

This is an initial, bounded crawler—not Google's index and not a whole-web crawler. It only discovers pages on the configured source hosts, and respects each site's robots.txt. The generated records are not yet connected to Everything Hub's live search API. That integration is a separate step, after we verify the first crawl run and inspect the generated data.

To add subject coverage, add suitable public source hosts to `SEEDS` in `crawl.mjs`. Respect site terms and robots policies.
