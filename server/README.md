# IdeaXchange Backend

Express + Mongoose + Firebase Admin + Socket.io backend for the IdeaXchange contribution/reputation platform.

## Architecture

- **Contributions** are stored as a hash-linked chain per project (`ContributionBlock`) — each block hashes its own content plus the previous block's hash, so the chain can be verified for tampering via `GET /api/contributions/:projectId/verify`.
- **Reputation** is an append-only ledger (`ReputationLog`) — every change is a new log entry, never edited. `User.reputationScore` is a cached running total kept in sync via atomic `$inc` updates.
- **Approvals** move through a small state machine (`pending → approved` / `pending → rejected`), and resolving one automatically writes a reputation log entry for the contributor.
- **Real-time**: clients join a `project:<id>` Socket.io room and receive `contribution:new`, `approval:statusChanged`, and `reputation:changed` events.

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI, FIREBASE_SERVICE_ACCOUNT_BASE64, PDF_SIGNING_SECRET, SERVER_PORT
npm start
```

`FIREBASE_SERVICE_ACCOUNT_BASE64` is your Firebase service account JSON, base64-encoded (e.g. `base64 -w0 serviceAccount.json`).

## API

All routes below (except `/api/health`) require `Authorization: Bearer <firebaseIdToken>`.

- `GET /api/health`
- `GET /api/users/me`, `PATCH /api/users/me`, `GET /api/users/:id`
- `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`
- `POST /api/contributions/:projectId`, `GET /api/contributions/:projectId`, `GET /api/contributions/:projectId/verify`
- `POST /api/approvals`, `GET /api/approvals/pending` (reviewer/admin), `PATCH /api/approvals/:id` (reviewer/admin)
- `GET /api/reputation/:userId/log`, `GET /api/reputation/:userId/score`
