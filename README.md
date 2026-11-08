# Group Chat

React/Vite frontend, FastAPI backend, PostgreSQL database.

## Local development

1. Copy `.env.example` to `.env`. Change `POSTGRES_PASSWORD`, use a long random `JWT_SECRET_KEY`, and configure `SMTP_HOST`, `SMTP_FROM`, and any required SMTP credentials to enable password recovery.
2. Run `docker compose up --build` for PostgreSQL and FastAPI.
3. In another terminal: `cd frontend`, `npm install`, then `npm run dev`.
4. Open <http://localhost:5173>. API docs: <http://localhost:8000/docs>.

Deploy `frontend/` to Vercel, and deploy `backend/` as a Docker service on a container host. Use managed PostgreSQL and object storage for production.

Version 1 is text-only. Signup requires first name, last name, a unique username, email, and password. Each group has a unique 8-character invite code, shown under its name and used for joining. The backend is FastAPI with SQLAlchemy and PostgreSQL. The container runs Alembic migrations before starting Uvicorn. It provides signup/sign-in/logout, group creation/settings, joining and leaving groups, admin member removal and approval, text messages, message history, and unread notifications for join requests and messages. Group admins can accept or decline join requests directly from their notification. The frontend refreshes messages and notifications every five seconds; WebSocket updates are not implemented yet. Migrations `0005_user_names`, `0006_group_invite_code`, and `0007_join_request_resolution` add account names, group invite codes, and persisted join-request decisions.

Image and video sharing are planned for Version 2. They are intentionally not enabled in Version 1.

Set `FRONTEND_ORIGINS` to a comma-separated list of allowed frontend origins. Never use the development JWT secret in production. In Vercel, set `VITE_API_URL` to the public HTTPS URL for the separately deployed FastAPI container.
