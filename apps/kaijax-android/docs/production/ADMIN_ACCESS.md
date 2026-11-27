# Administrative access (vault imports & character reconstruction)

Applies to `apps/kaijax-android/server.ts` and `server/`. Status: **implemented and tested; production routes stay disabled until you configure a strong secret.**

## What is protected
`POST /api/canon-drive/import`, `PATCH|DELETE /api/canon-drive/asset/:id`, `POST /api/canon-drive/clear`,
`POST /api/character-pipeline/import-glb`, `POST /api/character-pipeline/meshy/reconstruct`.
Read-only routes (`status`, Drive browsing/preview) are rate limited but public to the page; they carry no local write capability.

## Modes (`GET /api/admin/status` → `mode`)
| Mode | When | Behaviour |
|---|---|---|
| `dev-loopback` | `NODE_ENV!=production`, no `KAIJAX_ADMIN_TOKEN` | Only direct loopback requests (no `X-Forwarded-For`) may use admin routes. `npm run dev` works unchanged. |
| `token` | `KAIJAX_ADMIN_TOKEN` set (≥ 24 chars in production) | Sign-in required. |
| `disabled` | production without a strong token | Admin routes return 503; login unavailable. This is the default for any hosted deployment. |

## Sign-in flow (token mode)
1. Operator opens the app (web/dev server) and starts an import/reconstruction; the app shows **Administrator sign-in**.
2. The secret is typed at runtime and sent once to `POST /api/admin/login` (rate limited: 5 failed attempts / 15 min / client; 250 ms penalty per failure; same-origin only).
3. Server creates an in-memory session: random 256-bit id in an `HttpOnly; SameSite=Strict; Path=/api` cookie (`Secure` in production), idle timeout 15 min, absolute 2 h, max 5 sessions.
4. Mutations must also send `X-Kaijax-Csrf` (returned at login, kept only in page memory) and a same-origin `Origin`.
5. `POST /api/admin/logout` (CSRF-protected) ends the session. CLI automation may instead send `X-Kaijax-Admin-Token`.
6. Every allow/deny/login event is appended (no secrets, coarse client address) to `data/admin-audit.log` (`KAIJAX_ADMIN_AUDIT_LOG` to relocate; file mode 0600).

## The secret is never shipped
- Not referenced in `src/`, `vite.config.ts` or `capacitor.config.ts` (tested), not in `dist/` or Android assets when present (tested), never echoed or logged.
- The Android/iOS app is a static bundle with no admin server; its Canon Drive / hub entry shows an explanatory toast instead of opening admin tools.

## Operating it
```
KAIJAX_ADMIN_TOKEN="$(openssl rand -base64 36)" NODE_ENV=production HOST=0.0.0.0 npm start   # behind TLS only
```
Terminate TLS in front of the server (the cookie is `Secure` in production). Rotate by changing the variable and restarting (sessions are in memory).

## Verification
`npm run test:server` (60 tests: path/ID hardening, rate limits, concurrency, 24 admin-auth tests) and `npm run test:admin-ui`
(real Chromium: dialog, wrong secret, retry, HttpOnly/SameSite cookie, CSRF, no secret in storage or client code).
Evidence: `docs/production/captures/wave8-admin/`.

## Not covered / open
- Single-node in-memory sessions (no cluster sharing); acceptable for a local asset tool.
- No MFA or per-operator identities: one shared secret. Use real identity (e.g. SSO proxy) before exposing this to more than one operator.
