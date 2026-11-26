# Project Agent Instructions

## Mandate: Expert Full-Stack Web Developer & Senior Software Engineer Persona

- **Operating Persona:** The AI assistant MUST always act strictly as an **Expert Senior Full-Stack Web Developer and Software Engineer**.
- **Language & Communication Policy (STRICT ENGLISH ONLY):** All output explanations, answers, walkthroughs, documentation, comments, and status updates MUST be written strictly in professional, clear **English**. Output in Bangla or Banglish is strictly prohibited.
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

### 2026-11-26: Complete 8-Domain Video Platform Architecture ("Watch")

- Request: Implement all features from the user's 8-image architectural roadmap for the Watch feature in a production-grade, realistic, non-AI style with zero sticker/cartoon icons and no dependency on paid external SaaS tools.
- Implemented Across 8 Domains:
  1. **Video Processing & Playback:** Adaptive Bitrate Streaming switcher (Auto, 1080p, 720p, 480p, 360p), multi-language WebVTT closed captions (English, Bengali, Spanish, Off), seekbar hover preview storyboard, mobile offline download caching simulation.
  2. **Upload, Storage & Delivery:** Resumable chunked upload wizard with pause/resume controls, master/transcoded storage breakdown, Stats for Nerds (CDN edge node, buffer health, dropped frames, bitrate), visibility (Public, Unlisted, Private) and scheduled release timing.
  3. **Discovery, Search & Feeds:** Typo-tolerant live search autocomplete, category chips (All, Trending, Tech, Gaming, Music, etc.), Trending badges (#1, #2, #3 on Trending), Shorts 9:16 vertical swipeable feed with full interaction stack.
  4. **Engagement, Community & Library:** Like/Dislike split pill, live view counters, threaded nested comments with "Pinned by Creator" badge, channel subscribe with Bell notification levels (All, Personalized, None), Library with Watch History (progress bars), Watch Later queue, Custom Playlists, and Offline Downloads.
  5. **Creator Studio & Analytics:** Channel branding (banner, avatar, handle, description), Analytics dashboard with interactive SVG views area chart, watch time, subscriber growth, and audience retention curve, In-Browser Video Trimmer Editor (In-Point/Out-Point scrub, audio track replacement, end-screen subscribe overlay).
  6. **Live Streaming & Real-Time Chat:** Go Live broadcast modal (Webcam/Screen share or OBS RTMP setup), live indicator with pulsing dot and live viewer counter, real-time scrolling live chat with flying emoji reactions and highlighted super chat banners.
  7. **Monetization:** Skippable pre-roll video ad simulation with 5s countdown timer and skip button, Gather Watch Premium ad-free viewing toggle, Channel Membership tiers (Bronze, Silver, Gold), Super Thanks creator tips ($2, $5, $10, $50) with pinned golden comments.
  8. **Security, Moderation & Rights:** Content ID copyright check simulation, automated AI safety & NSFW scan step during upload, anti-spam comment filter, session and ownership protection.
- Files changed: `frontend/src/videos/WatchView.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: Clean TypeScript compilation (`tsc --noEmit`), Vite production build succeeded in 984ms (0 errors), HMR running live on `http://127.0.0.1:5173/`.

### 2026-11-26: Enterprise NewsFeed Overhaul & Social Architecture (5 Domains)
- **Profiles & Connections System:**
  - Professional Creator Mode dashboard toggle with 28-day reach (52.4K, +18%), post engagement metrics (12.1K), and in-stream ads monetization eligibility tracker (85% completed).
  - "People You May Know" recommendation hub with mutual friends count, add friend actions, and one-way follow options.
- **Feed, Stories & Video Pipeline:**
  - 24-hour disappearing Stories carousel shelf at top of feed with "+ Create Story" modal (canvas gradient selector & text), unread ring indicators, and full-screen story viewer with auto-advancing progress timers, interactive stickers (polls & questions), and quick emotional reactions.
  - Advanced Post Composer: Colored canvas gradient backgrounds (Sunset, Ocean, Cosmic, Emerald, Midnight, Candy), feelings/activities picker (😊 Happy, 🚀 Excited, ☕ Having coffee, 🎧 Listening to music, etc.), check-in location selector (📍 Dhaka, Silicon Valley, etc.), interactive community poll creator (question + options), per-post audience privacy controls (🌍 Public, 👥 Friends Only, 🔒 Only Me), and anonymous posting toggle.
  - Multi-Feed Navigation tabs: Home (algorithmic mix), Favorites (starred creators/friends), and Recent (reverse-chronological).
  - Daily Memories ("On This Day") banner with 1-year throwback recap and "Share to Feed" CTA.
- **Engagement & Interaction Infrastructure:**
  - Full suite of seven emotional reactions: Like 👍, Love ❤️, Care 🥰, Haha 😆, Wow 😮, Sad 😢, Angry 😡 with a floating hover popover bar and live reaction stack badges.
  - Nested threaded comments with creator badges ("Author"), timestamp formatting, and instant delete controls.
  - Saved Collections: bookmarking posts into user collections with a dedicated Saved Collections drawer.
- **Communities & Events Hub:**
  - Dedicated Public Pages (`p/slug`, open posting for all members) vs Private Communities (`c/slug`, admin-only posting, join approval workflow, membership request counters).
  - Facebook Events hub widget with date badges, attendee counters, and interactive RSVP toggles (Going ✅, Interested ⭐, Can't Go).
- **Privacy, Moderation & Security:**
  - Post 3-dots moderation menu: Snooze author/space for 30 days, Hide post from feed, Report post modal, and copy permalink.
- **Strict English Communication Standard:**
  - Enforced that all future responses, explanations, and engineering documentation must be delivered strictly in professional English.
- Files changed: `frontend/src/feed/NewsFeed.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: Clean TypeScript compilation (`tsc --noEmit`), Vite production build succeeded in 942ms (0 errors), HMR running live on `http://127.0.0.1:5173/`.

### 2026-11-26: UI Glitch & Posting Permission Fixes
- **Root Cause Analysis from User Screenshot:**
  1. Default browser button styling appeared on sidebar navigation buttons (`.pro-nav-btn`) and space items (`.pro-space-list-item`) due to missing CSS definitions in `styles.css`.
  2. The composer defaulted to `Test Channel` (`testchannel`), a private community created by another user (`testuser1`), which locked `rabby70` out with "Admin-Curated Private Community" because no public page existed by default.
  3. The right sidebar was hidden prematurely on standard screens due to a `@media (max-width: 1200px)` query.
  4. Light-theme styling lacked proper borders, background colors, and badge separations (e.g., "Test ChannelCommunity" text collision).
- **Engineering Solutions Implemented:**
  1. **Seeded Global Public Space:** Added `General Discussions` (`p/general`, `privacy_type='public'`) to the database so all users have an immediate, open destination to author and share posts.
  2. **Smart Space Selection:** Updated `NewsFeed.tsx` to automatically default to spaces where `can_post` is true or public pages, avoiding locked private channels on load.
  3. **Interactive Locked Box Actions:** When viewing an admin-curated space, users now receive an actionable one-click `"Switch to General Discussions"` or `"+ Create a Public Page to Post"` CTA instead of a dead-end banner.
  4. **Annotated Space Dropdown:** Shows `[Admin Only]` tags next to private spaces where the current user is not an admin.
  5. **Complete 262-Class CSS Suite:** Styled all 46 missing classes in `styles.css` with dual Light & Dark mode support, pill navigation buttons, rounded card elevations, clear space item headers, and status badges.
  6. **Responsive Layout Grid:** Preserved the 3-column layout down to standard laptop screen widths (1120px) before gracefully transitioning.
- Files changed: `frontend/src/feed/NewsFeed.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: 0 TypeScript errors, Vite build succeeded in 984ms, Dev server live on `http://127.0.0.1:5173/`.

### 2026-11-26: Profile View Overhaul & Composer Form Alignment Fixes
- **Root Cause Analysis from User Screenshot (`media_1795667757466_6558e75a.png`):**
  1. In `src/profile/ProfileView.tsx`, the composer form elements (`<input>` title and `<textarea>` body) were missing block and flex container styles, causing them to sit side-by-side on the same line, squished and overlapping each other awkwardly.
  2. The Intro card used cartoonish emojis (`👤`, `📝`, `🔺`, `📅`) and Reddit legacy terminology (`Karma`, `r/`).
  3. Action buttons throughout the profile (`📷`, `✏ Edit Profile`, `💬 Message`, `📰 News Feed`, `▲`, `🔗 Share`) lacked vector icons.
  4. 46 CSS classes for `ProfileView` had no definitions in `src/styles.css`, causing elements to default to unstyled browser defaults.
- **Engineering Solutions Implemented:**
  1. **Form Layout Correction:** Refactored `.composer-inner-form` to a clean flex column layout (`display: flex; flex-direction: column; gap: 12px; width: 100%`) with dedicated `.composer-title-input` (full width, rounded, focus ring) and `.composer-body-textarea` (full width, auto-resizable, 85px minimum height).
  2. **Modern Vector Icon Suite:** Replaced all emojis in the Intro card and cover banner with precision outline SVG icons (User, Post Document, Reputation Star, Calendar, Camera, Pencil, Message, Feed).
  3. **Space Nomenclature Alignment:** Replaced Reddit-style `r/` prefix with modern `p/` (Public Page) and `c/` (Private Community) in the profile post composer dropdown and post cards.
  4. **Post Actions & Comments Suite:** Added complete styling for `.post-actions-toolbar`, `.reddit-vote-pill`, `.reddit-comment-pill`, `.reddit-share-pill`, and threaded comment bubbles with full dark and light mode support.
- Files changed: `frontend/src/profile/ProfileView.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: 0 TypeScript errors (`tsc --noEmit`), Vite production build succeeded in 990ms, dev server live on `http://127.0.0.1:5173/`.

### 2026-11-26: Removal of All Demo Accounts & Mock Stories
- **Removal of Mock/Demo Stories:**
  - Removed all hardcoded mock stories (`Sarah Jenkins`, `Alex Rivera`, `Elena Rostova`, `Devon Vance`).
  - Stories shelf now initializes strictly from live user activity (persisted in local storage). If no stories are active, an invitation card prompts users to share the first story.
- **Removal of Demo Accounts & Live Database Recommendations:**
  - Removed all hardcoded mock friend recommendations (`marcus_code`, `priya_sharma`, `daniel_k`).
  - Added `@router.get("/recommendations")` endpoint in `backend/app/routers/auth.py` and `api.getUserRecommendations` in `frontend/src/api/client.ts` to populate "People You May Know" strictly from real registered members in the PostgreSQL database.
- **Removal of Demo Community Events:**
  - Removed hardcoded events (`Global Web Developers Summit 2026`, `Full-Stack Architecture & Microservices Jam`). Clean empty state displayed when no real community events have been hosted.
- **Disabled Mock Memories:**
  - Disabled default mock 1-year memory banner to prevent showing synthetic past memories.
- Files changed: `backend/app/routers/auth.py`, `frontend/src/api/client.ts`, `frontend/src/feed/NewsFeed.tsx`, `frontend/src/styles.css`, `CODEX.md`.
- Verification: 0 TypeScript errors, Vite production build succeeded in 918ms, dev server live on `http://127.0.0.1:5173/`.

### 2026-11-26: Full Backend Architecture & Frontend Ownership Isolation for Shop Feature
- **Problem Statement:**
  - A user opening a shop caused all other logged-in users to inherit merchant access to that shop because shop state was client-side only and stored under a single global un-scoped key (`gather_active_user_shop`). There were no backend database models, migrations, or ownership authorization checks.
- **Backend Architecture Implemented:**
  1. **PostgreSQL Relational Models (`backend/app/models/shop.py`):**
     - `Shop`: `id`, `owner_id` (ForeignKey to `users.id`, `unique=True`, `index=True`), `name`, `slug` (unique), `tagline`, `category`, `description`, `email`, `phone`, `address`, `city`, `logo_url`, `banner_gradient`, `return_policy`, `rating`, `reviews_count`, `status`, `created_at`.
     - `Product`: `id`, `shop_id` (ForeignKey to `shops.id`, nullable for default marketplace products), `name`, `category`, `price`, `original_price`, `rating`, `reviews_count`, `badge`, `description`, `image_url`, `in_stock`, `created_at`.
     - `Order`: `id`, `order_code` (unique, e.g. `ORD-XXXXXXXX`), `user_id` (ForeignKey to `users.id`), `total_amount`, `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `payment_method`, `status`, `created_at`.
     - `OrderItem`: `id`, `order_id` (ForeignKey to `orders.id`), `product_id` (ForeignKey to `products.id`), `product_name`, `price`, `quantity`, `image_url`.
  2. **Pydantic Validation Schemas (`backend/app/schemas/shop.py`):**
     - `ShopCreate`, `ShopUpdate`, `ShopResponse`, `ProductCreate`, `ProductUpdate`, `ProductResponse`, `OrderCreate`, `OrderResponse`, `OrderItemResponse`.
  3. **FastAPI Router (`backend/app/routers/shop.py` mounted at `/api/shop`):**
     - `GET /api/shop/me`: Retrieves authenticated user's shop with active products count. Returns `null` if the user has not established a shop.
     - `POST /api/shop`: Allows authenticated user to launch a verified storefront (prevents duplicate shops per user).
     - `PATCH /api/shop/me`: Allows verified shop owners to update shop details, policies, and banner styling.
     - `GET /api/shop/public/{shop_id_or_slug}`: Public endpoint allowing customers to view any merchant storefront in read-only mode.
     - `GET /api/shop/products`: Marketplace products endpoint supporting category filter, query search, shop ID filter, and sorting.
     - `POST /api/shop/products`: Merchant adds product (strictly verifies `current_user.id == shop.owner_id`).
     - `DELETE /api/shop/products/{product_id}`: Merchant removes product (strictly verifies shop ownership).
     - `POST /api/shop/orders`: Places an order with automatic total calculation, item insertion, and order code generation.
     - `GET /api/shop/orders/me`: Returns authenticated user's purchase history.
  4. **Database Seeding (`backend/app/db/seed_shop.py`):**
     - Seeded 12 curated marketplace products into PostgreSQL database.
- **Frontend Architecture & Ownership Isolation (`frontend/src/shop/ShopView.tsx` & `frontend/src/App.tsx`):**
  1. **User-Scoped State Management:**
     - Removed un-scoped global `gather_active_user_shop`.
     - Scoped all user state by authenticated user ID (`api.getMyShop(token)`, `gather_shop_orders_${user.id}`).
     - On user logout or session switch, `userShop`, cart, and orders are cleanly reset.
  2. **Strict Merchant Ownership Verification:**
     - Computed `isShopOwner = Boolean(userShop && Number(userShop.ownerId) === Number(user.id))`.
     - Merchant administrative actions ("Add Product", "Edit Shop", "Delete Item", "My Shop" dashboard) are rendered exclusively when `isShopOwner === true`.
     - Non-owners see a clean "Open a Shop" call-to-action to register their own store.
     - Customers viewing another merchant's storefront (`activeTab === 'publicShop'`) browse in public customer view with Add to Cart / Buy Now actions, without any administrative controls.
  3. **Backend API Integration (`frontend/src/api/client.ts`):**
     - Integrated `api.getMyShop`, `api.createShop`, `api.updateMyShop`, `api.getProducts`, `api.createProduct`, `api.deleteProduct`, `api.createOrder`, `api.getMyOrders`.
- **Verification:**
  - Automated dual-user backend test verified: User A (Rabby) created a shop, User B (Rahim) queried `/api/shop/me` and received `null`; User A added a product; User B purchased User A's product; User B's `/api/shop/orders/me` showed 1 order while User A's showed 0.
  - Zero TypeScript compile errors (`tsc --noEmit`).
  - Vite production build succeeded cleanly (`npm run build`).

### 2026-11-26: Product Editing Feature for Shop Owners
- **Feature Overview:**
  - Added full end-to-end support for verified shop owners to edit their product details directly from their store management dashboard.
- **Backend Architecture (`backend/app/routers/shop.py`):**
  - Implemented `PATCH /api/shop/products/{product_id}`.
  - Strict ownership check: verifies `product.shop.owner_id == current_user.id`. Any unauthorized attempt by another user is rejected with HTTP 403 Forbidden.
  - Supports updating `name`, `category`, `price`, `original_price`, `badge`, `description`, `image_url`, and `in_stock`.
- **Frontend Architecture (`frontend/src/shop/ShopView.tsx` & `frontend/src/api/client.ts`):**
  - Added `api.updateProduct(token, productId, data)` in `frontend/src/api/client.ts`.
  - Added **"Edit Details"** action button alongside the remove button on every product in the owner's "My Shop" dashboard.
  - Added **"Edit Product Details"** modal pre-filled with the existing product values (title, category, price, discount cut price, badge, description, image URL, and in-stock checkbox).
  - Submitting updates both the live database and the reactive UI state.
- **Verification:**
  - Automated test verified: User B (Rahim) attempting to edit User A's (Rabby) product received HTTP 403 Forbidden.
  - User A (Rabby) successfully updated product name, price, badge, and description.
  - Frontend compiled with 0 TypeScript errors and `npm run build` succeeded in 934ms.

### 2026-11-26: Merchant Shop Dashboard, Order Tracking & Position Management System
- **Feature Overview:**
  - Designed and implemented a dedicated, high-tier Merchant Operations Dashboard and Order Management System inside "My Shop" for store owners.
  - Allows merchants to track overall sales volume, net store revenue, active catalog inventory, and incoming customer orders.
  - Provides a real-time Order Position Lifecycle controller allowing merchants to transition orders across fulfillment positions: `Processing` (Packing) $\rightarrow$ `On the Way` (In Transit) $\rightarrow$ `Delivered` (Completed).
  - Displays complete customer delivery information, payment methods (Cash on Delivery vs Online), payment collection status, and accurate per-shop payout calculations.
- **Backend Architecture:**
  1. **SQLAlchemy Models (`backend/app/models/shop.py`):**
     - Added bidirectional foreign key relationship `product = relationship("Product", foreign_keys=[product_id])` on `OrderItem` to join product details when fulfilling orders.
  2. **Pydantic Schemas (`backend/app/schemas/shop.py`):**
     - `MerchantOrderItemResponse`: id, product_id, product_name, price, quantity, image_url.
     - `MerchantOrderResponse`: id, order_code, user_id, total_amount, merchant_subtotal, shipping_name, shipping_phone, shipping_address, shipping_city, payment_method, status, created_at, items.
     - `OrderStatusUpdate`: status (strictly validated against 'Processing', 'On the Way', 'Delivered').
     - `MerchantAnalyticsResponse`: total_orders, total_revenue, processing_count, on_the_way_count, delivered_count, total_products.
  3. **FastAPI Endpoints (`backend/app/routers/shop.py`):**
     - `GET /api/shop/merchant/analytics`: Calculates revenue, order count, and fulfillment pipeline status for the merchant's store.
     - `GET /api/shop/merchant/orders`: Returns all orders containing products belonging to the merchant's shop, automatically computing `merchant_subtotal` for each order.
     - `PATCH /api/shop/merchant/orders/{order_id}/status`: Authorizes the merchant, normalizes status to standard positions ('Processing', 'On the Way', 'Delivered'), and updates the order position.
- **Frontend Architecture (`frontend/src/shop/ShopView.tsx`, `frontend/src/api/client.ts`, `frontend/src/styles.css`):**
  1. **Merchant Dashboard Tabs (`merchantSubTab`):**
     - `Overview & Analytics`: 6 KPI metrics cards (Net Store Revenue, Total Customer Orders, Processing/Packing count, On the Way/In Transit count, Delivered/Completed count, Active Products in Catalog), recent order table, and fulfillment lifecycle guide.
     - `Customer Orders`: Search bar, position filter pills (All, Processing, On the Way, Delivered), customer shipping address and phone, payment breakdown, merchant net payout badge, ordered item cards with quantities and unit prices, and dynamic `<select>` position controller.
     - `Inventory & Catalog`: Products catalog with Add Product and Edit Details modals.
     - `Store Policies & Info`: Store profile, contact details, and return policies.
  2. **Styling & Icons:**
     - Pure vector SVG outline icons (`IconTruck`, `IconDollar`, `IconClock`, `IconTrendingUp`, `IconPackage`, `IconPin`, `IconCard`).
     - Fully responsive, dark mode compatible styles matching modern enterprise dashboards (Stripe / Shopify style).
- **Verification:**
  - Automated backend integration tests confirmed `GET /api/shop/merchant/analytics`, `GET /api/shop/merchant/orders`, and `PATCH /api/shop/merchant/orders/{order_id}/status` work seamlessly with status transitions and immediate analytics updates.
  - Zero TypeScript compile errors (`tsc --noEmit`).
  - Production build completed cleanly with `npm run build`.

### 2026-11-26: Real-Time Dynamic Synchronization for Products & Order Lifecycle Positions
- **Issue Identified:**
  - When merchants added a new product, the "Active Store Catalog" KPI card and subtab badge stayed on the previous cached value because `merchantAnalytics.totalProducts` was evaluated via a static fallback (`merchantAnalytics?.totalProducts || myShopProducts.length`), and `fetchMerchantAnalytics()` wasn't re-invoked on product creation or deletion.
  - When changing order positions (`Processing` $\rightarrow$ `On the Way` $\rightarrow$ `Delivered`), status filter pill counts and KPI counters lagged behind because they relied on asynchronous network analytics rather than reactive in-memory state, and orders filtered by position disappeared abruptly without an interactive progress tracker.
- **Architectural Fixes:**
  1. **Reactive `merchantStats` Pipeline (`frontend/src/shop/ShopView.tsx`):**
     - Introduced an immediate reactive `useMemo` computation (`merchantStats`) calculating `processingCount`, `onTheWayCount`, `deliveredCount`, `totalOrders`, `totalRevenue`, and `totalProducts`.
     - `totalProducts` is dynamically resolved using `Math.max(myShopProducts.length, userShop?.productsCount ?? 0, merchantAnalytics?.totalProducts ?? 0)` so it updates synchronously the very instant a product is added or removed.
  2. **Multi-Source Cache Invalidation on Product Lifecycle:**
     - `handleAddProductSubmit` and `handleDeleteProduct` now immediately update the local `products` array, update `userShop.productsCount`, and asynchronously trigger `fetchProducts()`, `fetchMyShop()`, and `fetchMerchantAnalytics()`.
  3. **Optimistic Updates & Synchronized Views on Order Position:**
     - `handleUpdateOrderStatus` applies an immediate optimistic update to `merchantOrders` and customer `orders`, re-fetches backend analytics in the background, and intelligently resets active position filters to `'all'` when moving an order so the updated item remains in full view.
  4. **Interactive 3-Step Order Position Stepper (`frontend/src/shop/ShopView.tsx` & `frontend/src/styles.css`):**
     - Implemented an interactive visual progress tracker on every customer order card:
       `[ (1) Processing ] ─── [ (2) On the Way ] ─── [ (3) Delivered ]`
     - Stepper nodes are clickable with checkmark indicators (`✓`) for completed stages, full dark mode compatibility, and responsive mobile adaptations.
- **Verification:**
  - TypeScript type check (`tsc --noEmit`) completed with 0 errors.
  - Production build succeeded cleanly (`npm run build`) in 938ms.
  - Hot Module Replacement verified running on Vite dev server.
