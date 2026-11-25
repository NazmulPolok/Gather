# Project Agent Instructions

## Mandate: Expert Full-Stack Web Developer & Senior Software Engineer Persona

- **Operating Persona:** The AI assistant MUST always act strictly as an **Expert Senior Full-Stack Web Developer and Software Engineer**.
- **No AI-Generated Look or Feel:** Any code, component, endpoint, database migration, or UI delivered must look and perform as if it was authored by a seasoned senior engineer at a tier-1 technology company (e.g., Stripe, Meta, GitHub, Discord, Linear). No naive prototypes, no sloppy hacks, and no generic AI boilerplate.
- **Strict Iconography Standard (NO STICKER-STYLE ICONS):**
  - **Forbidden:** Never use sticker-style graphics, cartoonish illustrations, childish clipart, or raw emojis as primary UI icons.
  - **Required:** Use clean, professional, minimalist SVG vector icons (outline/stroke style, 1.5px to 2px stroke width, rounded caps/joins, benchmarked against Lucide Icons, Heroicons, or Feather Icons).
  - When colored accents are needed, place the monochrome SVG icon inside a subtly tinted background container (e.g., squircle or rounded circle with `#eff6ff` background and `#2563eb` icon stroke) rather than using multi-colored sticker graphics.
  - All icons must be crisp, resolution-independent, properly aligned, and paired with responsive typography.

## Project

Build a group chat web app (the original request said “group cheating”; interpreted as group chatting).

## Status

- This repository is no longer limited to the original text-only chat surface. It also contains a news feed, post reactions/comments/media, shop UI, profile UI, and video/watch UI. Video and shop features must be verified against the actual current code because earlier project notes described them as deferred.
- Current branch: `main`. Working tree has uncommitted changes to `frontend/src/styles.css` and `frontend/src/videos/WatchView.tsx`; do not overwrite or commit them unless the user explicitly approves the task scope.
- Recent main-branch work includes video/watch support and video post support. Verify each feature against the running app and backend before reporting it complete.
- Version 1 is text-only. The working app includes signup/login/logout, first and last names plus unique usernames at signup, group creation, join/leave, admin member removal and approval, named member lists and chat messages, persisted notifications for join requests and new messages, FastAPI, and PostgreSQL.
- Migration `0005_user_names` adds profile fields. Existing accounts receive blank first/last names and generated `user_<id>` usernames, which can be used to sign in as before.
- Migration `0006_group_invite_code` adds a unique 8-character invite code to every group, including existing groups. Show the code beneath each group name; use the code, not the internal numeric database ID, to join.
- Current navigation layout: sidebar contains create group and join by 8-character invite code actions plus the account/profile area. The group list lives in the main dashboard; opening a group shows chat, with a “My groups” button to return to the dashboard.
- Header settings uses a notification-style anchored dropdown rendered in a document portal so the app layout cannot clip it. Its first page lists Theme; selecting Theme opens Light and Dark choices. The selected theme is saved in browser local storage.
- Notification dropdown is also rendered into a document portal and positioned below the header so the app layout cannot clip its content or join-request actions.
- Group join request notifications have Accept and Decline actions. Decisions are persisted in the notifications table and synchronized across admins; the existing member panel approve/remove actions resolve those notices too.
- Group admins can change the name of the group at any time after creation, either directly via the inline rename button (✎) beside the group title in the chat header or through the Group Settings section in the Members panel. Non-admins are restricted from editing group names.
- Password recovery: Added an email-delivered OTP "Forgot password?" flow. Codes are stored as keyed digests, expire after 10 minutes, are limited to five verification attempts, and can be requested once per minute per account. Configure SMTP settings to enable recovery.
- Image and video sharing are intentionally deferred to Version 2. Do not add media upload controls or endpoints to Version 1 unless the user changes this scope.
- Frontend currently polls message history every five seconds. WebSocket live chat, email verification, and production deployment setup remain outstanding.
- The user wants to build and maintain this project with Antigravity agents or other project-aware coding assistants.
- Keep this file current when implementation decisions or meaningful progress change.

## Agreed architecture

- Frontend: React, deployed on Vercel.
- Backend: FastAPI, packaged and run as a Docker container on a container host (for example Render, Fly.io, or Railway).
- Database: PostgreSQL, preferably managed for production; use Docker Compose for local development.
- Live chat: WebSockets from the browser to FastAPI.
- Version 2 media storage: use object storage (for example S3-compatible storage); PostgreSQL should store media metadata/object keys, not image/video binaries.
- Vercel hosts the frontend. The Dockerized backend runs separately and is reached through HTTPS/WSS. Do not assume Vercel will run the backend's Docker container.

## Professional & Realistic Design Standards (Engineering & UX Guidelines)

Any feature, component, modal, or UI update implemented in this repository must follow strict professional standards and must never look like an unpolished, naive, or generic AI-generated prototype. All interfaces must feel as if they were designed and crafted by a Senior Product Designer and Senior Frontend Engineer at a tier-1 technology company (benchmarked against Meta/Facebook, Reddit, Discord, YouTube, Twitter/X, Stripe, and GitHub).

### Core Design Rules for Every Feature

1. **Real-Life UX Patterns & Non-AI Code Standard:**
   - Always study and reference real-world tier-1 platforms for user interaction flows (e.g., Reddit, Meta/Facebook, Discord, YouTube, Twitter/X, Stripe, Linear).
   - Code must be production-grade, maintainable, fully typed, resilient, and architecturally clean. Never produce generic AI boilerplate or half-baked prototype code.
   - Never use raw/unformatted inputs, disconnected floating badges, misaligned prefixes, or browser-default unstyled fallback elements.

2. **Professional Iconography Standard (Strictly No Sticker-Type or Cartoonish Icons):**
   - **No Sticker Graphics or Emojis:** Never use cartoonish sticker-type graphics, flat clip-art illustrations, or raw emojis as primary UI icons or scaffolding.
   - **Precision SVG Vectors:** Always use sleek, minimalist, scalable SVG vector icons (outline/stroke style, 1.5px to 2px stroke width, rounded caps and joins, benchmarked against Lucide, Feather, or Heroicons).
   - **Modern Enclosures:** When colored emphasis is needed, enclose the monochromatic SVG vector inside a subtly tinted squircle or circle container (e.g., soft background like `#eff6ff` or `#ede9fe` with brand icon stroke like `#2563eb` or `#6d28d9`), rather than using multi-colored sticker art.
   - **Accessibility & Alignment:** Ensure icons are crisp, resolution-independent, vertically aligned with flexbox/inline-flex, and accompanied by accessible text labels or aria-labels.

3. **Form Controls & Input Groups:**
   - **Unified Input Groups:** Web addresses, handles, or slugs must use single-container input groups with an integrated prefix addon (e.g., `[ https://gather.app/p/ | photography ]`) rather than floating disconnected badges or mismatched boxes.
   - **Custom Styled Selects:** Never leave raw browser `<select>` controls unstyled. Wrap with custom SVG carets, border-radius, clean hover and focus rings.
   - **Character Counters & Hints:** Provide clear character indicators (e.g., `12/60`), subtle validation rules, and context helper text.
   - **Focus & Hover States:** Subtle, smooth transitions with brand focus rings (`box-shadow: 0 0 0 3px rgba(37,99,235,0.15)`), never harsh browser default outlines.

4. **Interactive Selection Cards:**
   - Multi-option selectors (e.g., Public vs Private spaces, membership policies) must be designed as cohesive option cards with:
     - Clear title, 1-line sub-tagline, and concise value proposition.
     - Subtle tinted vector icon box.
     - Radio or checkmark indicator showing active state.
     - Smooth hover elevation and brand accent border on selection.

5. **Action Buttons & Feedback:**
   - **High-contrast, intentional buttons:** Never use faded, washed-out, or disabled-looking pastel colors for active action buttons.
   - Clear visual hierarchy: Solid brand primary button (`#2563eb` with active/hover transitions and subtle shadow) vs clean ghost/outline secondary button.
   - Interactive loading states with animated spinners (`Creating…`) and proper disabled state styling when invalid.

6. **Live Previews & Real-time Context:**
   - When users configure a space, page, profile, or post, provide an inline or live preview card displaying how the final item will appear to other users.

7. **Modals & Overlays:**
   - Modern modal styling: `backdrop-filter: blur(8px)`, generous rounded corners (16–20px), multi-layer depth shadows (`box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)`).
   - Structured layout: Header with title, context subtitle, and accessible `✕` close button; scrollable body; and sticky/anchored footer with actions.
   - Full dark mode (`:root[data-theme="dark"]`) compatibility for all borders, backgrounds, text contrasts, and states.

---

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

- This file is for project-aware agents, including Antigravity and future coding assistants.
- Follow project requirements, architecture, Git safety, and task-recording rules here regardless of the IDE or agent interface used.
- Read this file and the project README before making changes.
- Inspect the repository and verify status against code; this document is a handoff record, not proof that a feature works.
- Keep this file aligned with the code if choices change. Record significant implementation decisions, commands needed to run locally, and current blockers here.
- Do not put credentials, passwords, JWT values, tokens, OTPs, or other secrets in this file.

## Mandatory task-recording workflow

Every AI assistant or coding agent working on this repository must update this file before finishing **every task**, whether the task was coding, debugging, research, branch/Git work, or explanation-only. The update must preserve prior entries; append a new dated entry rather than replacing earlier history.

For each completed task, add:

1. Date/time and task name.
2. The user's original request, summarized accurately.
3. What was actually implemented or answered.
4. What was not completed or remains blocked.
5. Files added or changed, including documentation-only changes.
6. Commands/tests used and their result.
7. Git/branch state if the task changed or inspected repository state.
8. Any assumptions, important decisions, or follow-up work.

At the end of an implementation task, also update the relevant `Status`, `Known gaps`, architecture, or implementation section above. Do not mark an item complete unless code and verification confirm it.

Before starting work, read this file and `README.md`. Before switching branches, merging, cherry-picking, reverting, deleting branches, committing, pushing, or changing credentials/configuration, obtain explicit user approval for that exact Git or security operation unless the user already gave it. Never perform a destructive Git operation without explicit approval.

Do not silently reverse prior user decisions. In particular:

- Follow the active branch and working-tree state reported here.
- Preserve unrelated uncommitted changes.
- Do not add media or shop backend behavior to a task unless the user explicitly requests it.
- Do not add secrets to source control or to this file.
- Do not claim that polling, browser storage, in-memory WebSocket state, or optimistic UI updates are durable server-side solutions unless they are actually implemented and tested.
- Explain limitations found during verification, especially approximate delivery/read status, before presenting them as complete.

## Historical task record

These entries summarize prior work and requests gathered before this maintenance workflow existed. They are a continuity aid; verify the current code and Git state before relying on them.

### 2026-11-12: Message delivery and API communication review

- Request: Explain message sent/delivery behavior, message status, read status, and the frontend `client.ts` API layer without generating new code.
- Outcome: Identified HTTP API storage plus WebSocket live delivery, `Sending/Sent/Delivered/Seen` UI states, notification-based read status, and the role of `client.ts`.
- Important limitation: Delivered status is based on group presence/last-seen information rather than confirmed per-recipient delivery receipts.
- Relevant areas: `frontend/src/chat/ChatHome.tsx`, `frontend/src/api/client.ts`, `backend/app/routers/messages.py`, `backend/app/core/ws_manager.py`, `backend/app/models/notification.py`.

### 2026-11-14: JWT/authentication review and branch experiments

- Request: Explain JWT creation and authentication files, environment configuration, secret storage, login/signup, frontend/backend connection, and requested branch operations.
- Outcome: Identified `backend/app/core/security.py`, `backend/app/core/dependencies.py`, `backend/app/routers/auth.py`, `backend/app/schemas/auth.py`, and frontend token/request handling.
- Outcome: Documented HS256/JWT behavior and the use of environment variables or `.env` files.
- Outcome: The user later requested creation of `alternative-way`, switching to `main`, detached HEAD review, and keeping future commits on `main`.
- Git safety decision: Future branch switches, merges, commits, cherry-picks, and pushes require explicit task approval. Do not assume a branch request means pushing or merging.
- Security decision: Never record actual secret-key values in project notes or responses.

### 2026-11-15: Branch merge review and feature explanations

- Request: Determine whether multiple side branches could be merged into `main`, merge requested branches, and explain profile/newsfeed behavior.
- Outcome: Reviewed `alternative-way`, `newsfeed-feature`, and `alter-way-of-indicator-and-active` merge relationships.
- Outcome: Created or updated alternative branch history when explicitly requested; no unapproved implementation should be inferred from review-only turns.
- Current known Git entries from prior work include `main`, `alternative-way`, `newsfeed-feature`, and `alter-way-of-indicator-and-active`; verify live branches before acting.

### 2026-11-18: Run project and explain post reactions

- Request: Run the project locally and explain how post reacts/upvotes work and where the implementation lives.
- Outcome: Identified optimistic frontend updates, authenticated API calls, backend reaction toggling, unique post/user reaction constraints, and profile-page reuse.
- Relevant areas: `frontend/src/feed/NewsFeed.tsx`, `frontend/src/profile/ProfileView.tsx`, `frontend/src/api/client.ts`, `backend/app/routers/feed.py`, `backend/app/models/post.py`.

### 2026-11-19: Repository endpoint and infrastructure review

- Request: List endpoint files and explain feed endpoints, shop backend status, caching, and CORS.
- Outcome: Identified community/post/comment/reaction/feed/media endpoints in `backend/app/routers/feed.py`.
- Outcome: Confirmed the shop is currently frontend/localStorage-based, with no shop product/order backend models or endpoints.
- Outcome: Confirmed there is no server-side caching or cache middleware. Browser `localStorage` is persistence, not server/API caching.
- Outcome: Confirmed FastAPI CORS middleware configuration in `backend/app/main.py`.

### 2026-11-23: Codex and project-agent-file setup

- Request: Install/run Codex CLI and determine whether the project has agent instruction files.
- Outcome: `CODEX.md` was found at the repository root.
- Outcome: No `AGENTS.md`, `agent.md`, `CLAUDE.md`, or `.github/copilot-instructions.md` was found.
- Follow-up requested: Maintain every future task and prior decisions in `CODEX.md`, with no repetition of known mistakes.

### 2026-11-23: Initial complete project instruction update

- Request: Review all previous task history and update `CODEX.md` so future AI tasks do not repeat prior mistakes and the file is updated after every task.
- Outcome: Added current status, mandatory task-recording workflow, explicit Git safety rules, secret handling, verification requirements, and summarized historical tasks.
- Files changed: `CODEX.md`.
- Verification: Reviewed `README.md`, `CODEX.md`, current Git branch/status/log, repository file layout, and prior local session history.
- Known remaining work: Update this entry after future changes; verify the actual implementation status of all newsfeed, shop, video, WebSocket, caching, delivery, and deployment features before marking them complete.

### 2026-11-23: Made project instructions IDE-agnostic

- Request: Keep instructions intended for Antigravity work in `CODEX.md`, and do not include VS Code-specific instructions.
- Outcome: Changed the document title to IDE-neutral project instructions.
- Outcome: Removed the VS Code/Codex-terminal requirement from the status and Codex setup history.
- Outcome: Added a clear rule that project-aware agents, including Antigravity and future coding assistants, must follow this file.
- Files changed: `CODEX.md`.

### 2026-11-23: Professional & Realistic UI Standards and Create Modal Redesign

- Request: Redesign the "Create Page or Community" modal so it looks realistic, polished, and built by a senior professional developer rather than an AI generator, benchmarking top social platforms (Reddit, Facebook, Discord, Twitter). Add explicit permanent engineering guidelines in `CODEX.md` so all future additions/updates adhere to realistic, professional standards.
- Outcome:
  - Documented permanent "Professional & Realistic Design Standards (Engineering & UX Guidelines)" in `CODEX.md`.
  - Redesigned the "Create Space" modal in `frontend/src/feed/NewsFeed.tsx` with modern SVG icons, clean segmented option cards, integrated URL input group (`gather.app/p/slug`), custom styled selects, character counters, live preview card, and crisp action buttons.
  - Added modern, high-contrast, production-ready styles in `frontend/src/styles.css` with full light/dark mode support.
- Files changed: `CODEX.md`, `frontend/src/feed/NewsFeed.tsx`, `frontend/src/styles.css`.
- Verification: Built frontend with `npm run build` (0 TypeScript / Vite errors) and tested live HMR.

### 2026-11-23: Safe Garbage Code Audit and Cleanup

- Request: Audit project for any dead, unused, or garbage code and safely remove it without breaking or deleting any necessary code.
- Outcome:
  - Scanned full frontend codebase (0 unused variables, 0 unused imports, 0 commented-out blocks, 0 leftover debugging logs).
  - Removed 41 lines of orphaned, superseded dark mode CSS rules (`.create-type-card`, `.join-rule-selection-card`, `.join-rule-option`) in `frontend/src/styles.css`.
  - Removed unused imports in `backend/app/core/cache.py` (`Callable`, `wraps`) and `backend/app/core/ws_manager.py` (`json`).
  - Preserved all active application code, models, schemas, and routes intact.
- Files changed: `frontend/src/styles.css`, `backend/app/core/cache.py`, `backend/app/core/ws_manager.py`, `CODEX.md`.
- Verification: Backend container recompiled and restarted with 200 OK responses; Frontend compiled with `npm run build` (0 errors).

### 2026-11-25: YouTube Watch vs Newsfeed Cross-Posting and Isolation Rule

- Request: When a user uploads a video from a YouTube channel/page in Watch, it must automatically appear on that page's Newsfeed. However, when users create a post from the Newsfeed page, it must NOT appear on the YouTube/Watch page.
- Outcome:
  - Added `source VARCHAR(32) NOT NULL DEFAULT 'feed'` column to PostgreSQL `posts` table and SQLAlchemy `Post` model.
  - Updated `PostCreate` and `PostResponse` schemas with `source: str = "feed"`.
  - Updated `create_post` and `get_news_feed` endpoints: supports filtering by `source="watch"`. Newsfeed without `source` parameter naturally receives all posts (both feed and watch uploads).
  - Updated `WatchView.tsx`: passes `source: 'watch'` on video uploads and queries `/api/feed?source=watch`, filtering strictly to `p.source === 'watch'`.
  - Updated `NewsFeed.tsx`: posts created in Newsfeed are explicitly marked `source: 'feed'`, so they will never appear in YouTube/Watch.
- Files changed: `backend/app/models/post.py`, `backend/app/schemas/feed.py`, `backend/app/routers/feed.py`, `frontend/src/api/client.ts`, `frontend/src/videos/WatchView.tsx`, `frontend/src/feed/NewsFeed.tsx`, `CODEX.md`.
- Verification: Executed backend isolation tests in container verifying that watch videos appear in Newsfeed while Newsfeed posts are excluded from Watch; Frontend built cleanly with `npm run build` (0 errors).

### 2026-11-25: Enterprise NewsFeed UI & Professional Design System Overhaul

- Request: Make the entire Newsfeed look and feel like it was crafted by an expert developer at a top-tier tech company (Reddit/Meta/Discord standard), and upgrade the "Create Page or Community" modal, composer, cards, and sidebar to eliminate any generic or AI-generated appearance.
- Outcome:
  - **Create Modal Architecture (`.pro-space-modal`):** Upgraded the space creation dialog with a dual-card type selector (Public Page vs Private Community) featuring custom vector icons, radio badges, clean access policy cards (`Instant Access` vs `Admin Approval Required`), character counter badges, custom select dropdown with SVG caret, live interactive preview card (`.pro-live-preview-box`), and high-contrast submit button.
  - **Unified Input Groups:** Integrated URL slug input group (`gather.app/p/` or `gather.app/c/`) with seamless domain addon prefix and validation helper hints.
  - **Three-Column Social Layout (`.feed-layout-container`):** Clean 260px left sidebar, 680px central feed, and 300px right sidebar with sticky positioning, smooth scrollbars, and responsive tablet/mobile fallbacks.
  - **Hero Space Banner (`.pro-community-banner`):** Custom banner backdrop gradients, squircle avatar badge, category pill, access policy tag, member stats, admin pending request actions, and clean join/joined toggles.
  - **Segmented Filter Bar (`.pro-filter-bar`):** Tabbed sorting for Recent (`new`), Top Voted (`top`), and Media Only (`media`) with real-time post count indicator.
  - **Pro Post Composer (`.pro-composer-card`):** User avatar, active space dropdown selector, title input with character indicator, auto-resizable textarea, photo & video drop previews with instant dismiss, and gradient publish button.
  - **Post Cards & Interaction Suite (`.pro-post-card`):** Space chips, author avatar & profile handles, OP badge, timestamp, Watch video cross-post badge (`🎬 Watch Video`), edit & delete controls, zoom overlay on media, video player container, and reaction pills (upvote, comments count, views indicator).
  - **Threaded Comments Drawer (`.pro-comments-drawer`):** Avatar squircle, styled comment bubbles with author metadata, and rounded comment composer.
  - **Right Sidebar Widgets:** Space details card, Discover Spaces list with quick-join pill buttons, and Community Guidelines checklist.
  - **Shimmer Skeletons (`.pro-skeleton-card`):** Replaced harsh loading spinners with smooth gradient shimmer animation (`@keyframes proShimmer`) for zero layout shifts.
  - **Full Theme Fidelity:** Complete dark mode (`:root[data-theme="dark"]`) implementation across all cards, modals, borders, and controls.
- Files changed: `frontend/src/feed/NewsFeed.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: Built frontend bundle with `npm run build` (0 TypeScript / Vite errors, 1.06s build); HMR running live on `http://127.0.0.1:5173/`.
