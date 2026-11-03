# Everything Hub free crawler

A separate, low-rate GitHub Actions crawler prototype. It starts from a small allowlist of public information sites, stays on those seed hosts, checks robots.txt, fetches HTML only, deduplicates canonical URLs, and stores records in everythinghub-index/pages.json with a generated sitemap.xml.

- Schedule: every six hours; manual runs are available in GitHub Actions.
- Limit: 50 pages per run, with a pause between successful requests.
- No paid crawling service, API key, or AppDeploy deployment is required.
- This prototype does not crawl the whole web and does not yet feed the live Everything Hub search API. Integration is required before these records appear in public search results.

Respect each site's terms and robots policy.