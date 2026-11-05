# Codex Project Notes

## Project

Build a group chat web app (the original request said “group cheating”; interpreted as group chatting).

## Status

- Version 1 is text-only. The working app includes signup/login/logout, first and last names plus unique usernames at signup, group creation, join/leave, admin member removal and approval, named member lists and chat messages, persisted notifications for join requests and new messages, FastAPI, and PostgreSQL.
- Migration `0005_user_names` adds profile fields. Existing accounts receive blank first/last names and generated `user_<id>` usernames, which can be used to sign in as before.
- Migration `0006_group_invite_code` adds a unique 8-character invite code to every group, including existing groups. Show the code beneath each group name; use the code, not the internal numeric database ID, to join.
- Current navigation layout: sidebar contains create group and join by 8-character invite code actions plus the account/profile area. The group list lives in the main dashboard; opening a group shows chat, with a “My groups” button to return to the dashboard.
- Header settings uses a notification-style anchored dropdown rendered in a document portal so the app layout cannot clip it. Its first page lists Theme; selecting Theme opens Light and Dark choices. The selected theme is saved in browser local storage.
- Notification dropdown is also rendered into a document portal and positioned below the header so the app layout cannot clip its content or join-request actions.
- Group join request notifications have Accept and Decline actions. Decisions are persisted in the notifications table and synchronized across admins; the existing member panel approve/remove actions resolve those notices too.
- Image and video sharing are intentionally deferred to Version 2. Do not add media upload controls or endpoints to Version 1 unless the user changes this scope.
- Frontend currently polls message history every five seconds. WebSocket live chat, email verification, and production deployment setup remain outstanding.
- The user wants to build in VS Code with Codex working in the terminal.
- Keep this file current when implementation decisions or meaningful progress change.

## Agreed architecture

- Frontend: React, deployed on Vercel.
- Backend: FastAPI, packaged and run as a Docker container on a container host (for example Render, Fly.io, or Railway).
- Database: PostgreSQL, preferably managed for production; use Docker Compose for local development.
- Live chat: WebSockets from the browser to FastAPI.
- Version 2 media storage: use object storage (for example S3-compatible storage); PostgreSQL should store media metadata/object keys, not image/video binaries.
- Vercel hosts the frontend. The Dockerized backend runs separately and is reached through HTTPS/WSS. Do not assume Vercel will run the backend's Docker container.

## Product requirements

- Sign up and sign in.
- Only one account per email address. Normalize email and enforce uniqueness with a PostgreSQL unique constraint.
- A user can create and join multiple groups.
- Each group has an admin/owner and a join policy:
  - `open`: eligible users can join directly.
  - `approval`: join requests stay pending until an admin approves them.
- Version 1 group content is text messages only.
- Planned Version 2 group content includes text, images, and videos.
- Backend authorization must verify group membership for group data and admin role for approval/settings actions.

## Repository layout

```text
group-chat/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── groups/
│   │   ├── chat/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/                 # Configuration, security, dependencies
│   │   ├── db/                   # SQLAlchemy session and base
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/              # auth, groups, members, messages
│   │   └── services/
│   ├── migrations/               # Alembic migrations
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
├── compose.yaml                  # Local PostgreSQL and backend
├── .gitignore
└── README.md
```

## Proposed core data model

- `User`: id, normalized email (unique), password hash, verification status, created timestamp.
- `Group`: id, name, owner user id, join policy (`open` or `approval`), created timestamp.
- `Membership`: group id, user id, role (`admin` or `member`), status (`active`, `pending`, `rejected`); unique `(group_id, user_id)`.
- `Message`: id, group id, sender user id, text body, created timestamp. Version 2 can add media type and object-key fields by migration.

## Proposed API surface

```text
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/me
POST   /api/groups
GET    /api/groups
GET    /api/groups/{group_id}
PATCH  /api/groups/{group_id}                    # Admin settings
POST   /api/groups/{group_id}/join
DELETE /api/groups/{group_id}/leave
GET    /api/groups/{group_id}/members
POST   /api/groups/{group_id}/members/{user_id}/approve
DELETE /api/groups/{group_id}/members/{user_id} # Admin removes a member
GET    /api/groups/{group_id}/messages
POST   /api/groups/{group_id}/messages            # Text message
GET    /api/notifications
PATCH  /api/notifications/{notification_id}/read
PATCH  /api/notifications/read-all
WS     /api/groups/{group_id}/live
```

## Security and configuration notes

- Hash passwords with a modern password hashing scheme; never store plaintext passwords.
- Keep secrets out of source control. Use local `.env` files (ignored by Git), `.env.example` placeholders, and host-managed production environment variables.
- Configure CORS for the deployed frontend origin.
- Do not trust frontend-only role or membership checks.

## Suggested implementation order

1. Scaffold the frontend, FastAPI backend, and local Docker Compose PostgreSQL setup.
2. Add database models and Alembic migrations.
3. Implement signup/login and account uniqueness.
4. Implement group creation, open joining, and approval-based joining.
5. Implement membership-checked text messages and message history.
6. Add WebSocket live updates and reconnection/history behavior.
7. Configure production environment variables, CORS, and separate Vercel/backend deployments.
8. For Version 2, add image/video uploads using object storage and database migrations.

## Agent handoff instructions

- Read this file and the project README before making changes.
- This document records the initial plan, not completed implementation. Inspect the repository and update the status section as work is actually completed.
- Keep this file aligned with the code if choices change. Record significant implementation decisions, commands needed to run locally, and current blockers here.
- Do not put credentials, tokens, or other secrets in this file.
