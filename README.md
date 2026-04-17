# gub-review

Public magic-link review UI for the GCP Universal Backend (GUB).

## Purpose

Reviewer-facing flows that land in someone's email inbox. The URL token is
the sole credential — the recipient doesn't need to sign in to anything.

Currently hosts:
- **Drive proposal reviews** at `/drive-review/[token]` — approve/reject
  LLM-extracted Account/Campaign changes.

## Why a separate repo

`gub-admin` is behind Cloud IAP (high-security CMS). We can't carve out
IAP-exempt paths on that service without weakening the boundary. This
repo is the other side of that decision: **intentionally public, no IAP,
no admin surface ever**. A deploy here can only expose reviewer flows.

## Architecture

```
Reviewer email ──▶ https://gub-review-...run.app/drive-review/<token>
                          │
                          │ server-side fetch
                          ▼
                   GUB backend /integrations/google-drive/review/:token
                          │
                          ▼
                       DB (via GUB)
```

All data access goes through GUB over HTTP. This app has no DB client
and no direct connection to Cloud SQL — smaller attack surface, simpler
deploy.

## Env

| Var | Purpose |
|-----|---------|
| `GUB_BACKEND_URL` | Server-side URL for GUB (used by proxy routes) |
| `NEXT_PUBLIC_GUB_URL` | Fallback for `GUB_BACKEND_URL` if not set |

## Local dev

```bash
npm install
npm run dev   # starts on :3002
```

Point it at a running GUB backend via `.env.local`:

```
GUB_BACKEND_URL=http://localhost:3000
```

## Deploy

Push to `main` → Cloud Build → Cloud Run (`gub-review-dev`). No IAP on
the service; `--allow-unauthenticated` is set intentionally.
