# Dog Tag Day Browser

Dog Tag Day Browser is a Chromium-based browser owned by Dog Tag Day. Chromium supplies the rendering engine and browser core; Dog Tag Day adds branding, shared-control plumbing, runtime health/recovery, and the ChatGPT/iPhone handoff model.

## Architecture

1. **Chromium source** — checked out with Chromium's official `depot_tools` workflow.
2. **Dog Tag Day branding layer** — product name, strings, icons, default settings, and future custom UI patches.
3. **Runtime worker** — a small Playwright/CDP worker that connects the running browser to the existing Dog Tag Day Browser Connector.
4. **Connector** — queues `open`, `click`, `type`, `read`, `screenshot`, `back`, `forward`, and `status` actions and manages user/assistant handoff.

## Build target

The first target is Linux x64 because Chromium's official Linux build workflow is the simplest place to get a reproducible build running. The same patch set can later be adapted for macOS/Windows builds.

## First build

On an Ubuntu 22.04+ x64 machine with ample disk/RAM:

```bash
cd browser
bash scripts/bootstrap_chromium.sh
```

Then build Chromium:

```bash
cd .work/chromium/src
gn gen out/DogTagDay --args="$(cat ../../../build/args.gn)"
autoninja -C out/DogTagDay chrome
```

The build output will be under `.work/chromium/src/out/DogTagDay/`.

## Runtime worker

The worker in `runtime-worker/` is designed to attach to a Chromium/Chrome DevTools Protocol endpoint and poll the Dog Tag Day Browser Connector for commands. It can be used first with stock Chromium, then pointed at the Dog Tag Day Browser binary after the custom build is compiled.

## Security model

- Never stores account passwords.
- Never bypasses login, 2FA, CAPTCHA, or account-owner approvals.
- When a website requires owner action, control is handed to the user.
- Connector health/recovery remains independent of the browser process so a crashed browser can be detected and restarted.
