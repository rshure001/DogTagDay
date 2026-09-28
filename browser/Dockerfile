FROM node:22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     chromium \
     ca-certificates \
     fonts-liberation \
     fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/dogtag-browser

COPY browser/runtime-worker/package.json browser/runtime-worker/package-lock.json* ./runtime-worker/
RUN cd runtime-worker && npm install

COPY browser/runtime-worker ./runtime-worker
RUN cd runtime-worker && npm run build

COPY browser/runtime/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV DOGTAG_CDP_URL=http://127.0.0.1:9222 \
    DOGTAG_PROFILE_DIR=/data/profile \
    DOGTAG_POLL_MS=1200

VOLUME ["/data/profile"]
ENTRYPOINT ["/opt/dogtag-browser/entrypoint.sh"]
