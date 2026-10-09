# CineWeb — Frontend

Full-stack university project (DSW course): a movie/series platform where viewers upload,
watch, rate and report audiovisual content, and administrators moderate reports and appeals.
Team of 3. This repo is the frontend only.

@README.md

## How to work with me

- Code, identifiers, comments and commit messages in English.
- User-facing UI text in English (the app is in English now).
- I own the frontend. The backend lives in a separate repo owned by Eduardo
  (see README). Do not assume an endpoint exists: if something needs an endpoint
  that is not listed in "API contract" below, say so instead of inventing it.
- Prefer small, focused changes. The course grades each member's git history,
  so suggest small commits with descriptive messages.
- If a domain decision is listed as "open" below, ask before picking one.

## Stack and commands

- React + TypeScript, Vite 5, Tailwind CSS, DaisyUI, React Router.
- Package manager: pnpm only (never npm or yarn).
- `pnpm install` / `pnpm dev` (http://localhost:5173) / `pnpm build`.
  Check `package.json` for any other scripts before suggesting one.
- Backend runs at http://localhost:3000. The base URL comes from `VITE_API_URL`
  in `.env` (fallback to localhost:3000). Never hardcode URLs in components.

## Project structure

- `src/pages/` — one component per route.
- `src/components/` — reusable UI (includes `ProtectedRoute.tsx`).
- `src/services/` — all HTTP calls (`authService.ts`, one service per entity).
- `src/context/` — app-wide state (`AuthContext.ts` defines the context, `AuthProvider.tsx` provides it).
- `src/hooks/` — custom hooks (`useAuth.ts`, `useCatalog.ts`).
- `src/utils/` — pure functions with no React and no HTTP (`catalog.ts`).
- `src/types/index.ts` — all domain models and request/response DTOs.

Some of these files may not exist yet. Before creating a new file, check whether
an equivalent one already exists and extend it instead of creating a parallel version.

## Code conventions

- Strict TypeScript, no `any`. Use `import type` for type-only imports.
- Functional components and hooks only. Type every component's props.
- Output props (callbacks) are named `onSomething`.
- Components never call `fetch` directly: they go through `src/services`.
- Every async operation handles three states: loading, error and empty.
  Error messages shown to the user must be friendly and in English.
- PascalCase for components and types, `useX` for hooks, camelCase elsewhere.
- Follow the Airbnb JavaScript style guide.
- Security: the password only exists in request DTOs (`LoginRequest`,
  `RegisterRequest`), never in `User` or in state. Never log tokens.

## Styling

- Mobile-first: unprefixed Tailwind classes target mobile; add `sm:`, `md:`, `lg:`
  for larger screens. Every page must look right at SM, MD and LG.
- Use DaisyUI components (`btn`, `card`, `input`, `navbar`, `modal`...) before
  writing custom CSS. No inline styles.

## Course requirements (the code must satisfy these)

Regularity:
- Handle user events (click, input...), handle errors in a user-friendly way,
  react to state changes, and use input props and output props.
- At least one service.
- Model API data with interfaces/types.
- Apply an OOP design pattern where it makes sense.
- Dependencies correctly registered in `package.json`.

Approval:
- At least one component unit test and one end-to-end test.
- Login, with frontend access protected by the backend's user levels
  (`administrator` / `viewer`) via `ProtectedRoute`.
- Environments defined with `.env`.

## Domain model

The source of truth is the draw.io diagram "DdD - CineWeb EN", stored in this repo:

- `docs/dnd_cineweb.drawio`: plain-text XML, the only place to
  take names from. Pages: "1 - Users & platform", "2 - Content", "3 - Moderation",
  "4 - Engagement".
- `docs/dnd_cineweb.png`: a PNG export, only for seeing the relationships
  at a glance. Never take names from it.

Before creating or modifying types, services or screens that depend on an entity,
read the `.drawio` and use the exact class and field names it defines.
If these files are not in the repo, ask me to add them instead of assuming a model.

Maintenance: when the diagram changes, update the `.drawio` and the PNG in the same commit.

Rules (the diagram does not say these):
- The password only exists in the authentication requests (`LoginRequest`,
  `RegisterRequest`), never in `User` or any other model.
- Counters such as `reportsCount` and `reportsReceivedCount` are computed by the
  backend, not stored.
- Arrays in the diagram (`seasons: Season[]`, `appeals: Appeal[]`...) represent
  relationships, not fields of the entity.
- Inheritance (e.g. `Administrator` and `Viewer` extend `User`) is modeled with
  interfaces plus a discriminator field (e.g. `role`), not with classes.

Open decisions (ask before assuming):
- Values of `Report.status`.
- Whether `Appeal.reviewed` becomes a `status` enum (pending / accepted / rejected,
  as the admin sketches show).
- Whether a report has one reason or several.
- What "similar videos" means for reviews.

## Known diagram errors

The diagram is still wrong or unfinished in these places. Do not implement them
literally: if a task touches any of them, ask me before picking an interpretation.

- `Series` has no title, category or description.
- `Season` uses `audiovisualId` to point to its series, and `Series` uses
  `idSerie` instead of `id`.
- `Episode` and `Movie` lost fields that the sketches use.
- The cardinalities of `Content` are read from the child side.
- The `ReportReason`—`Audiovisual` line no longer makes sense.
- `ReportReason` still has `count` and `otherReasonDescription`.
- `Appeal.reviewed` is still a boolean.

## API contract

What the backend actually does (checked in its code, commit `9d30d59`).
`docs/MANUAL.md` section 1.3 has the full endpoint list.

- Naming: the backend uses snake_case for users and content (`id_user`,
  `id_serie`) and camelCase for reports and appeals (`targetType`). The
  frontend keeps camelCase types: each service converts the backend's DTOs
  (e.g. `toUser`, `toSeries`), so pages never see snake_case.
- `POST /api/users/login` — body `{ login, password }` (`login` is the email or
  the username) → `{ token, token_type, expires_in, user }`.
- `POST /api/users/register` — body `{ user_name, first_name, last_name, email,
  password }` → `{ data: user }`, no token, so the frontend logs in right after.
  Public registration creates viewers only. Password: 8+ characters.
- `POST /api/users/logout` revokes the token; `GET /api/users/me` → `{ data: user }`
  or 401 when the token is no longer valid.
- Session: an opaque token (not a JWT) that expires after 7 days, stored in
  localStorage (`cineweb_token`, `cineweb_user`). Authenticated requests send
  `Authorization: Bearer <token>` via `authHeader()`.
- Uploads: the goal is that the backend takes the uploader from the token and
  the form never sends it. Today the content routes do not read the token yet,
  so the frontend still sends `id_author` (see the manual's known issues).

## Screens (from the sketches "Bosquejos TP DSW")

Current routes are defined in `src/App.tsx` (viewer-only ones are wrapped in `ProtectedRoute`).

Viewer:
1. Landing page.
2. Search, filtering by category, type (movie/series) and director.
3. Watch video (details, add to "Watch later").
4. Series: seasons and episodes.
5. Report a video: fixed reasons plus "Other" with free text.
6. Review: like / dislike, can be withdrawn.
7. See a received report and appeal it.
8. Upload video and "My videos" (edit, logical delete).

Administrator:
- A. Admin landing page.
- B. Pending appeals (accept / reject).
- C. Appeal history (filter, change a verdict).

Auth: login (email or username, password) and register (first name, last name, email,
username, password).

Current priority: the user system (login, register, `AuthContext`, protected routes).

## Code manual

`docs/MANUAL.md` explains how the code works so any team member can understand any part.
- Simple, direct English. File, function and variable names exactly as in the code.
- Never invent: every claim about the code comes from reading it and cites `path:line`.
  If something cannot be verified, say so.
- Keep "implemented" apart from "planned / pending" with the manual's status labels.
- Describe the backend only through its API contract, never its implementation.
- Do not name team members.
- When a feature is added or changed, update `docs/MANUAL.md` (walkthrough, known issues
  and compliance table) in the same commit.
