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

# Wire the secret-scan pre-commit hook (required — refuses commit on
# detected API keys, tokens, JSON keys, etc.)
brew install gitleaks        # or see https://github.com/gitleaks/gitleaks#installation
git config core.hooksPath .githooks

# Local config — points at a running GUB backend
cp .env.example .env.local
# (edit .env.local if you want to hit a non-localhost backend)

npm run dev   # starts on :3003
```

## Deploy

Push to `main` → Cloud Build → Cloud Run (`gub-review-dev`). No IAP on
the service; `--allow-unauthenticated` is set intentionally.

## Secrets & rotation

Documents secrets/credentials this service uses and how to rotate them.
For company-wide incident response (escalation, post-mortem, comms), see
IT's canonical incident-response doc.

This service is **stateless and credential-free by design.** It holds
no DB connection, no API keys, and no signing material. The only way it
authenticates a reviewer is via the URL token, which lives in the link
the reviewer received by email — and which is issued and validated by
GUB, not here.

### Inventory

| Credential | Where it lives | Issued by | Used for |
|---|---|---|---|
| `GUB_BACKEND_URL` | Cloud Run env (set in `cloudbuild/dev.yaml`) | N/A — configuration | Server-side proxy routes to the GUB backend |
| `NEXT_PUBLIC_GUB_URL` | Cloud Run env (fallback for `GUB_BACKEND_URL`) | N/A — configuration | Client-side fallback for SDK usage |

Neither is a secret. There are no secret-typed values in
`cloudbuild/dev.yaml` (no `--set-secrets`).

### Rotation procedures

#### Review tokens

Review tokens live in the URLs that reviewers receive in email. They
are issued, scoped, and validated entirely by **gcp-universal-backend**.
This service only proxies the validation request.

**To rotate a token** (e.g., a reviewer reported the link was leaked):
1. In gub-admin, navigate to the Drive proposal that generated the token.
2. Issue a new review link via the existing "Resend" or equivalent
   action (the old token is invalidated when a new one is issued).
3. Email the new link to the reviewer through your normal channel.

This service has no rotation procedure of its own. There is nothing
here to rotate.

### Cut a reviewer off

Reviewers don't have accounts here — there's nothing to revoke at this
layer. To invalidate an outstanding review link:

1. In gub-admin or via the GUB API, mark the corresponding proposal as
   reviewed (or otherwise "consumed" so the token is rejected on next
   use).
2. If the proposal must remain reviewable but by a different person,
   issue a new token to the new reviewer (per "Review tokens" above).
