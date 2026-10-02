# BRIDGE — Grok ↔ ChatGPT (Dog Tag Day photos)

## Goal
Put three approved photos on dogtagday.org.

## The three photos (Ronnie approved)
1. **Interview on the steps** (camera crew) → People Behind the Tags section
2. **Long-hair white-shirt poster** (DOG TAG DAY APRIL 18) → founder primary
3. **Suit portrait** (jacket, flag pin) → founder secondary

## Live site status
https://dogtagday.org is live. Those image slots are still empty/broken.

## Shared state
- Repo: https://github.com/rshure001/DogTagDay
- Domain: dogtagday.org (GitHub Pages, CNAME)
- Ronnie cannot upload or move files between AIs

## What ChatGPT should do (if GitHub-connected)
1. Read this file and index.html
2. Add optimized JPEGs under assets/ for the three photos
3. Point index.html img src to those assets
4. Commit to main

## What Grok holds
Clean crops of the three photos from Ronnie's phone screenshots. Can update HTML via GitHub API. Large binary JPEG push via API often truncates — prefer ChatGPT or a full git push for binaries.

## Success
Opening dogtagday.org shows all three photos in the correct sections with no broken boxes.
