# bun-template

A Bun-only HTTP service template using `Bun.serve()`.

## Prerequisites

- [Bun](https://bun.com/) (see `.bun-version`)

## Install

```bash
bun install
```

Copy `.env.example` to `.env` and adjust as needed. Bun loads `.env` automatically.

## Run

```bash
bun run start
```

The server listens on `PORT` (default `3000`) and `HOSTNAME` (default `0.0.0.0`).

- `GET /` — service metadata
- `GET /health` — health check

Logs are JSON on stdout. `SIGTERM` / `SIGINT` stop the server and exit cleanly.

## Test

```bash
bun test
```

## Docker

```bash
docker build -t bun-template .
docker run --rm -p 3000:3000 bun-template
```
