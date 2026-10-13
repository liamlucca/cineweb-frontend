# CineWeb Frontend — Code Manual

A guide to how the CineWeb frontend works, written so that anyone can explain any part of it,
including the parts they did not write.

## How to read this manual

Status labels used everywhere in this document:

| Label | Meaning |
|---|---|
| ✅ Implemented | Works in the code today. |
| 🧪 Mock | Works, but with fake or hardcoded data instead of the real backend. |
| ⏳ Pending | Planned, not built yet. |
| ⚠️ Known issue | Built, but has a bug or a gap you should know about. |

Every statement about the code points to a file, usually as `path:line` or as a function name.
Sections 1.3–1.4, 2, 3.2–3.11, 4.8–4.9 and 5 were checked against the working tree on 2026-10-13
(base commit `5c62b23`). Line numbers in 3.1 come from an earlier check and may have drifted: if a
line number does not match, search for the function name instead.

When something could not be verified by reading the code, it says so explicitly.

---

## 1. Overview

### 1.1 What the application does

CineWeb is a movie and series platform. Viewers can upload videos, watch them, rate them and
report them. Administrators moderate reports and the appeals that viewers send against them.

Planned screens, taken from the project sketches ("Bosquejos TP DSW"). Section 3 of this manual
explains which of them exist today.

| Viewer | Administrator |
|---|---|
| 1. Landing page | A. Admin landing page |
| 2. Search, filtering by category, type (movie/series) and director | B. Pending appeals (accept / reject) |
| 3. Watch video (details, add to "Watch later") | C. Appeal history (filter, change a verdict) |
| 4. Series: seasons and episodes | |
| 5. Report a video: fixed reasons plus "Other" with free text | |
| 6. Review: like / dislike, can be withdrawn | |
| 7. See a received report and appeal it | |
| 8. Upload video and "My videos" (edit, logical delete) | |

Plus login (email or username, password) and sign-up (first name, last name, email, username,
password).

### 1.2 Frontend vs backend responsibilities

| Frontend (this repo) | Backend (separate repo, separate team) |
|---|---|
| Shows the screens and handles user interaction. | Stores data in a MySQL database. |
| Keeps the session (token + user) in the browser. | Checks passwords and issues tokens. |
| Hides screens the current role should not see. | **Enforces** permissions on every request. |
| Calls the backend through HTTP (`fetch`). | Exposes the HTTP API and serves the video files. |

Important: hiding a screen in the frontend is only a convenience. Anyone can change the code that
runs in their own browser, so real security must be enforced by the backend (see 4.8).

This manual only describes the backend **from the frontend's point of view** (its API).
Its internal implementation belongs to the backend team and is not covered here.

### 1.3 The API contract (frontend's point of view)

The base URL comes from `VITE_API_URL` in `.env` (`src/services/api.ts:3`, which falls back to
`http://localhost:3000`). Every HTTP call goes through `src/services`, so all of them use that
fallback.

The endpoints below are the ones the frontend calls, read from the service files on 2026-10-13.
Whether each one exists comes from the backend's README and the contract agreed in `CLAUDE.md`.
They were **not** re-checked against a running backend on that date: the older live checks are
mentioned in 3.1 and in the notes of each walkthrough.

**Users and session** (`authService.ts`, `HttpAuthService`)

| Endpoint | Frontend function |
|---|---|
| `POST /api/users/login` with `{ login, password }` → `{ token, token_type, expires_in, user }` | `login` |
| `POST /api/users/register` with `{ user_name, first_name, last_name, email, password }` → `{ data: user }` (no token, so the service logs in right after) | `register` |
| `POST /api/users/logout` (with the token) → 204 | `logout` |
| `GET /api/users/me` (with the token) → `{ data: user }`, or 401 when the token is no longer valid | `getCurrentUser` |
| `PATCH /api/users/me` with the changed fields in snake_case → `{ data: user }` | `updateProfile` |

**Movies** (`movieService.ts`)

| Endpoint | Frontend function |
|---|---|
| `GET /api/movie` → array of movies | `getMovies` (used by `useCatalog` and `MyVideosPage`) |
| `GET /api/movie/:id` → `{ movie }` | `getMovie` (used by `WatchPage` and `ReportPage`) |
| `POST /api/movie` (multipart: `data` + `file` + optional `thumbnail`) | `uploadMovie` (used by `UploadPage`) |
| `PATCH /api/movie/:id` with `{ title, category, description }` | `updateMovie` |
| `DELETE /api/movie/:id` (logical delete) | `deleteMovie` |
| Static files under `/movies` and `/thumbnails` | `videoUrl` (`movieService.ts`) and `mediaUrl` (`api.ts`) |

**Series, seasons and episodes** (`seriesService.ts`)

| Endpoint | Frontend function |
|---|---|
| `GET /api/series`, `GET /api/series/:id` → `{ serie }` | `getAllSeries`, `getSeries` |
| `POST /api/series` (JSON, or multipart `data` + `thumbnail` when there is a cover) | `createSeries` |
| `PATCH /api/series/:id`, `DELETE /api/series/:id` (logical, hides its seasons and episodes) | `updateSeries`, `deleteSeries` |
| `GET /api/seasons/serie/:serieId`, `GET /api/seasons/:id` → `{ season }` | `getSeasons`, `getSeason` |
| `POST /api/seasons`, `PATCH /api/seasons/:id`, `DELETE /api/seasons/:id` (logical) | `createSeason`, `updateSeason`, `deleteSeason` |
| `GET /api/episodes/season/:seasonId`, `GET /api/episodes/:id` → `{ episode }` | `getEpisodes`, `getEpisode` |
| `POST /api/episodes` (multipart: `data` + `archivo` + optional `thumbnail`) | `uploadEpisode` |
| `PATCH /api/episodes/:id`, `DELETE /api/episodes/:id` (logical) | `updateEpisode`, `deleteEpisode` |

**Reviews** (`reviewService.ts`)

| Endpoint | Frontend function |
|---|---|
| `GET /api/reviews/audiovisual/:type/:id` → `{ data: Review[] }` | `getReviews` |
| `POST /api/reviews` with `{ rating, audiovisualId, audiovisualType }` (the backend takes `viewerId` from the token) | `createReview` |
| `PATCH /api/reviews/:id` with `{ rating }`, `DELETE /api/reviews/:id` | `changeReview`, `deleteReview` |

**Watch later** (`watchLaterService.ts`, viewers only)

| Endpoint | Frontend function |
|---|---|
| `GET /api/watch-later` → `{ data: items }` | `getWatchLater` |
| `POST /api/watch-later` with `{ audiovisualType, audiovisualId }` → `{ data: { id } }` | `addToWatchLater` |
| `DELETE /api/watch-later/:id` | `removeFromWatchLater` |

**Reports, report types and appeals**

| Endpoint | Frontend function |
|---|---|
| `GET /api/report-types` (public) → `{ data: ReportType[] }` | `getReportTypes` (`reportTypeService.ts`) |
| `POST`, `PATCH /:id`, `DELETE /:id` on `/api/report-types` (administrators; 409 for a repeated name or a type in use) | `createReportType`, `updateReportType`, `deleteReportType` |
| `POST /api/reports` with `{ targetType, targetId, reportTypeId, details? }` (viewers) | `reportContent` (`reportService.ts`) |
| `GET /api/reports` with optional `id`, `status`, `reportTypeId` (administrators) → `{ data: cases }` | `getModerationCases` (`adminService.ts`) |
| `GET /api/reports/:id` (administrators) → `{ data: case, reportCount, reports }` | `getModerationCase` (`adminService.ts`) |
| `GET /api/viewers/me` → `{ data: viewer }` with `reportsReceivedCount`, `appeals`, `uploadedAudiovisuals`, `reviews` | `getViewerProfile` (`viewerService.ts`) |
| `GET /api/viewers/me/reports` → `{ data: cases }` (cases about the viewer's own content) | `getMyReports` (`viewerService.ts`) |
| `POST /api/appeals` with `{ reportId, description }` (viewers, owner of the content) | `createAppeal` (`appealService.ts`) |
| `DELETE /api/appeals/:id` (withdraw an appeal not reviewed yet; 409 once reviewed) | `withdrawAppeal` (`appealService.ts`) |
| `GET /api/administrators/appeals` → `{ data: Appeal[] }` (pending only) | `getPendingAppeals` (`adminService.ts`) |
| `PATCH /api/administrators/appeals/:id` with `{ decision }` → `{ data, contentSuspended, ... }` | `resolveAppeal` (`adminService.ts`) |

**Accounts** (`adminService.ts`, administrators only)

| Endpoint | Frontend function |
|---|---|
| `GET /api/administrators/users` → `{ data: users with active }` | `getAccounts` |
| `PATCH /api/administrators/users/:id/active` with `{ active }` | `setAccountActive` |
| `POST /api/administrators` with the sign-up fields in snake_case | `createAdministrator` |

**Not available in the backend**

| Feature | Notes |
|---|---|
| Reviewed appeals and changing a verdict | Needed for the appeal history screen, sketch C (3.10). |
| Director, subtitle and audio language | The sketches use them; content has no such fields, so search cannot filter by director. |

Details:

- **Errors.** Every service uses `request()` (`api.ts:48-68`). A network failure becomes "We
  couldn't reach the server...", a 404 becomes the service's own "not found" sentence, a 409 shows
  the backend's `message`, and 400, 401, 403, 413 and 415 get the friendly messages of
  `statusMessage` (`api.ts:14-21`). Uploads use `uploadWithProgress` (`api.ts:77-100`) with the
  same messages.
- **Uploader.** The backend takes the uploader (`id_author`) and the reviewer (`viewerId`) from the
  token, so the frontend never sends them (`UploadPage.tsx:44-50`, `ReviewButtons.tsx:55`). Someone
  else's content answers 403, shown as "You do not have permission to do that.".
- **Stored episode file name.** `data` is appended before the file because the backend names the
  stored file after `data.title` (`seriesService.ts`, `uploadEpisode`).
- **User endpoints.** The backend built authentication under `/api/users` instead of the `/auth`
  URLs first agreed. The frontend adapts to it in `HttpAuthService` (see 3.1 and 4.1):
  - Login receives `{ login, password }`, where `login` is the email **or** the username.
  - The user comes in snake_case (`UserDTO`: `id_user`, `user_name`, `first_name`, `last_name`,
    `email`, `role`, `active`). `toUser` (`authService.ts:36`) converts it into the app's `User`.
  - The token is a random string that expires after 7 days. It is not a JWT. The frontend only
    stores it and sends it as `Authorization: Bearer <token>` (`authHeader`, `api.ts`).
- **Field naming.** The backend uses snake_case for movies, series and users (`id_author`,
  `id_serie`, `user_name`), but camelCase for reports and appeals (`targetType`, `reportId`). The
  frontend keeps camelCase types and converts in the services: `toUser` (`authService.ts`),
  `toMovie` (`movieService.ts`), `toSeries`, `toSeason`, `toEpisode` (`seriesService.ts`), and
  `getWatchLater` for `thumbnail_path` (`watchLaterService.ts`). Pages never see snake_case.

### 1.4 What the backend still needs (from the frontend's perspective)

1. **Appeal history (sketch C):** list reviewed appeals and allow changing a verdict.
2. Content fields the sketches use: director, subtitle and audio language.
3. Optional: return a token on sign-up (saves the extra login request), use one naming style
   (snake_case or camelCase) everywhere, and offer "content of a user" endpoints, so "My Videos"
   does not have to download every movie and series and filter them in the browser (3.6).

---

## 2. Code map

### 2.1 Folder by folder

| Folder | What lives there |
|---|---|
| `src/pages/` | One component per route (one screen each). |
| `src/components/` | Reusable pieces of UI: navbar, footer, carousel section, request status, route guard, forms and managers used by the pages. |
| `src/services/` | Code that talks to the outside world (HTTP, localStorage): `api.ts` and `session.ts` plus one service per entity (auth, movies, series, reviews, watch later, reports, report types, appeals, viewers, administrators). |
| `src/context/` | App-wide state shared through React Context: the session (`AuthContext.ts`, `AuthProvider.tsx`) and the toast messages (`ToastContext.ts`, `ToastProvider.tsx`). |
| `src/hooks/` | Custom hooks: `useAuth`, `useCatalog`, `useToast`, `useDocumentTitle`. |
| `src/utils/` | Pure functions with no React and no HTTP: `catalog.ts`, `moderation.ts`, and `videoThumbnail.ts` (reads a thumbnail and the duration from a video file in the browser). |
| `src/types/` | All TypeScript types for domain data and DTOs, in a single file `index.ts`. |
| `src/test/` | Test setup (`setup.ts`). Test files live next to the code they test, as `*.test.ts(x)`. |
| `src/mockup/` | `mockAuthService.ts`: fake accounts for working without a backend (`VITE_USE_MOCK_AUTH = true`). |
| `public/` | Static files copied as-is. |
| `docs/` | The course documentation (entry point `README.md`, progress minutes `progress.md` built from the git history, `tracking.md`), this manual, the domain diagram (`dnd_cineweb.drawio`, source of truth for names, and `dnd_cineweb.png`, visual reference) and the screen sketches (`frontend sketch by Cande.drawio.pdf`, 19 pages, in Spanish). |

### 2.2 Important files one by one

**Entry and routing**

| File | Role |
|---|---|
| `index.html` | The single HTML page. Has `<div id="root">` and loads `src/main.tsx`. |
| `src/main.tsx` | Mounts React into `#root`, wrapping `<App />` in the providers (session and toasts). |
| `src/App.tsx` | Declares every route, including the 404 page (`NotFoundPage`) for unknown addresses. Reads the session with `useAuth()` and passes it to the navbar. |
| `src/index.css` | Loads Tailwind and DaisyUI, with the `night` theme as default. |

**User system**

| File | Role |
|---|---|
| `src/services/authService.ts` | `AuthService` interface, `HttpAuthService` (real backend) and the exported `authService` that picks real or mock. |
| `src/mockup/mockAuthService.ts` | `MockAuthService`: fake login and register using localStorage. |
| `src/services/session.ts` | Saves, reads and clears the session in localStorage. `isUser` type guard. |
| `src/services/api.ts` | `API_URL`, the shared error messages, the `ApiError` class, `errorMessage()`, `authHeader()`, and the HTTP helpers every content service uses: `request()` (fetch + friendly errors), `readJson()` and `uploadWithProgress()`. |
| `src/context/AuthContext.ts` | The context object and its type `AuthContextValue`. |
| `src/context/AuthProvider.tsx` | The component that owns the session state and provides it. |
| `src/hooks/useAuth.ts` | The hook every component uses to read the session. |
| `src/components/ProtectedRoute.tsx` | Route guard: login required and, optionally, specific roles. |
| `src/pages/AuthPage.tsx` | Login and sign-up form (`/login`). |
| `src/components/MainNavbar.tsx` | Shows "Log In" for guests, greeting and "Log Out" for users. |

**Content screens**

| File | Role |
|---|---|
| `src/services/movieService.ts` | Every `/api/movie` call (`getMovies`, `getMovie`, `updateMovie`, `deleteMovie`, `uploadMovie`) plus `videoUrl` and `toMovie`. |
| `src/services/seriesService.ts` | Every `/api/series`, `/api/seasons` and `/api/episodes` call. Converts the backend's snake_case DTOs into `Series`, `Season` and `Episode`. |
| `src/components/RequestStatus.tsx` | Shows a spinner, a friendly error or an empty message, and its `children` only when there is data. |
| `src/hooks/useCatalog.ts` | Loads movies and series together as one list of `CatalogItem`. Used by the landing and search pages. |
| `src/utils/catalog.ts` | Converts movies and series into `CatalogItem`, lists the categories and filters by text, type and category. |
| `src/pages/LandingPage.tsx` | Home page: category links, an "All" carousel and one carousel per category. |
| `src/pages/SearchPage.tsx` | Search by title, with type and category filters kept in the URL. |
| `src/pages/WatchPage.tsx` | Shows one movie and plays it, with ratings, "Watch later" and "Report". |
| `src/pages/UploadPage.tsx` | Upload form with a thumbnail preview and a progress bar. |
| `src/components/VideoPicker.tsx` | File input for a video: captures a thumbnail and reads the duration with `utils/videoThumbnail.ts`. |
| `src/components/Thumbnail.tsx` | Shows a content thumbnail, or a gradient when there is none. |
| `src/pages/UploadSeriesPage.tsx` | Upload a series in three steps (`/upload-series`). Holds the list of series and passes it to the three forms below. |
| `src/components/NewSeriesForm.tsx`, `NewSeasonForm.tsx`, `NewEpisodeForm.tsx` | The three forms of `UploadSeriesPage`: create a series, add a season, upload an episode. |
| `src/pages/MyVideosPage.tsx` | List with edit and delete. |
| `src/pages/SeasonSelectPage.tsx`, `EpisodeListPage.tsx`, `WatchSeriesPage.tsx` | Series screens: seasons of a series, episodes of a season, and the episode player. |
| `src/pages/ReportPage.tsx` | Report a movie or a series (`/report/:type/:id`): one reason from the `ReportType` catalog plus optional details, confirmation, sends the report. |
| `src/components/WatchLaterButton.tsx` | "＋ Watch later" toggle for a movie or a series. Props: `type`, `id`. |
| `src/pages/WatchLaterPage.tsx` | `/watch-later`: the viewer's saved movies and series, with "Remove". |
| `src/services/watchLaterService.ts` | `getWatchLater`, `addToWatchLater`, `removeFromWatchLater` (`/api/watch-later`). |
| `src/components/SeasonsManager.tsx`, `EpisodesManager.tsx` | Inside `MySeriesItem`: edit and delete the seasons of a series and the episodes of a season. |
| `src/components/ReviewButtons.tsx` | Like / dislike buttons with counts for one movie or episode. Props: `type`, `id`. |
| `src/services/reviewService.ts` | `getReviews`, `createReview`, `changeReview`, `deleteReview` (`/api/reviews`). |
| `src/services/reportService.ts` | `reportContent` (`POST /api/reports`), `isReportTargetType`, and `toModerationCase` / `toCaseReport`, which convert the moderation cases. |
| `src/services/reportTypeService.ts` | CRUD of the report reasons catalog (`/api/report-types`). |
| `src/pages/AdminPage.tsx` | `/admin` (administrators only): tabs for pending appeals, reports, report reasons, users and a new administrator. |
| `src/components/AppealReviewCard.tsx` | One pending appeal: shows the reported case and its reasons, accepts or rejects. Output prop `onResolved`. |
| `src/components/ModerationCasesPanel.tsx` | "Reports" tab: list of moderation cases with filters by case number, status and reason. |
| `src/pages/ModerationCasePage.tsx` | `/admin/reports/:id`: detail of one case (content, reported user, every report, the appeal). |
| `src/components/CaseSummary.tsx` | Summary of one case (content, status, grouped reasons, appeal), shared by the admin and viewer screens. |
| `src/components/ReportTypesManager.tsx` | "Report reasons" tab: create, edit and delete reasons. Output props `onSaved`, `onDeleted`. |
| `src/components/MyReportsList.tsx` | "Reports about my content" in the profile: appeal a case or withdraw a pending appeal. |
| `src/components/MySeriesItem.tsx` | One of the user's series in "My Videos": view, edit, delete. Output props `onUpdated`, `onDeleted`. |
| `src/components/AccountsTable.tsx` | Table of accounts with activate / deactivate. Output prop `onChanged`. |
| `src/components/NewAdministratorForm.tsx` | Form to create an administrator. Output prop `onCreated`. |
| `src/services/adminService.ts` | Every administrator call: appeals, moderation cases, accounts, new administrators. |
| `src/pages/ProfilePage.tsx` | `/profile`: edit your account; viewers also see their activity and their appeals. |
| `src/pages/AppealPage.tsx` | `/appeal/:reportId`: appeal a moderation case against your content. |
| `src/services/viewerService.ts` | `getViewerProfile` (`GET /api/viewers/me`) and `getMyReports` (`GET /api/viewers/me/reports`). |
| `src/services/appealService.ts` | `createAppeal` (`POST /api/appeals`), `withdrawAppeal` (`DELETE /api/appeals/:id`) and `toAppeal`, which turns `decision` into one `status`. |
| `src/components/Section.tsx` | Horizontal carousel of `CatalogItem` cards, each with a "Movie" or "Series" badge. Props: `title`, `items`. |
| `src/components/SearchBar.tsx` | Search form that navigates to `/search?q=...`. |
| `src/components/LanguagePanel.tsx` | Collapsible panel of language toggles. Currently not imported by any page. |
| `src/types/index.ts` | All types: `Movie`, `MovieDTO`, `Series`, `Season`, `Episode` and their DTOs, `ReportType`, `ReportRequest`, `ModerationCase`, `Review`, `Appeal`, `WatchLaterItem`, `ViewerProfile`, `User`, `LoginRequest`, ... |

### 2.3 How the pieces connect

```
index.html
└── src/main.tsx
    └── <AuthProvider>                     session state (context/AuthProvider.tsx)
        └── <ToastProvider>                 short messages after an action (context/ToastProvider.tsx)
            └── <App>                       routes (App.tsx)
                ├── <MainNavbar user onLogout>  reads session through props
                └── <Routes>
                    ├── public pages        LandingPage, SearchPage, WatchPage, series pages, AuthPage
                    ├── <ProtectedRoute allowedRoles={['viewer']}>
                    │   └── UploadPage, UploadSeriesPage, MyVideosPage, ReportPage, AppealPage, WatchLaterPage
                    ├── <ProtectedRoute allowedRoles={['administrator']}>
                    │   └── AdminPage, ModerationCasePage
                    ├── <ProtectedRoute> (any logged-in user)
                    │   └── ProfilePage
                    └── * → NotFoundPage

Pages / components ──useAuth()──▶ AuthContext ◀── AuthProvider
AuthProvider ──▶ authService (Http or Mock) ──▶ backend /api/users or localStorage
AuthProvider ──▶ session.ts ──▶ localStorage (cineweb_token, cineweb_user)
Pages ──▶ one service per entity (src/services) ──fetch / XMLHttpRequest──▶ backend /api/...
(every service uses request(), readJson() and, for uploads, uploadWithProgress() from api.ts)
```

### 2.4 Configuration files

| File | What it does |
|---|---|
| `.env` | Local environment variables. Ignored by git (`.gitignore`). |
| `.env.example` | Template to copy into `.env`: `VITE_API_URL` and `VITE_USE_MOCK_AUTH`. |
| `src/vite-env.d.ts` | Tells TypeScript which `VITE_` variables exist. |
| `vite.config.ts` | Vite plugins (React, Tailwind), an allowed host for the dev server, and the Vitest settings (`test`: jsdom, `src/test/setup.ts`, `src/**/*.test.{ts,tsx}`). |
| `tsconfig.app.json` | TypeScript in strict mode, plus `noUnusedLocals` and `noUnusedParameters`. |
| `eslint.config.js` | ESLint with TypeScript, React Hooks and React Refresh rules. |
| `package.json` | Dependencies and scripts: `dev`, `dev:host`, `build`, `lint`, `preview`, `test` (runs the unit tests once), `test:watch`. |

---

## 3. Feature walkthroughs

### 3.1 User system ✅ 🧪

By default (`VITE_USE_MOCK_AUTH = false` in `.env.example`) the app uses `HttpAuthService`, which
talks to the backend's `/api/users` endpoints. It is covered by unit tests with a fake `fetch`
(`authService.test.ts`). With `VITE_USE_MOCK_AUTH = true` it uses the **mock** accounts below
instead, for working without a backend.

**Checked against the running backend (2026-10-09, commit `9d30d59`)**, by sending the same HTTP
requests the frontend sends (with `curl`, not by clicking through the browser): sign-up (201
`{ data: user }`), login with the email and with the username (200
`{ token, token_type, expires_in, user }`), `GET /api/users/me` (200), logout (204), `/me` after
logout (401), duplicated sign-up (409), invalid sign-up (400), wrong password (401) and empty login
(400). Every answer had the shape and status code `HttpAuthService` and its tests expect. The CORS
preflight from `http://localhost:5173` allows the `authorization` and `content-type` headers.

Mock accounts (`src/mockup/mockAuthService.ts:21-46`). You can log in with the email or the
username:

| Email | Username | Password | Role |
|---|---|---|---|
| `admin@cineweb.com` | `admin` | `admin123` | administrator |
| `viewer@cineweb.com` | `viewer` | `viewer123` | viewer |

#### Logging in: from the form to the protected page

Example: a guest clicks "Upload Video", which leads to `/upload`.

1. **The guard stops the guest.** `/upload` is inside `<ProtectedRoute allowedRoles={['viewer']}>`
   (`App.tsx:36-37`). `ProtectedRoute` reads `user` from `useAuth()`. It is `null`, so it renders
   `<Navigate to="/login" ... state={{ from: "/upload" }} />` (`ProtectedRoute.tsx:16-17`).
   The `from` value remembers where the guest wanted to go.
2. **The form is shown.** `AuthPage` renders the login form. The inputs are *uncontrolled*: they
   have a `name` but no `useState`, so the password is never stored in React state
   (`AuthPage.tsx:24`).
3. **The user submits.** `handleSubmit` runs (`AuthPage.tsx:25`):
   - `event.preventDefault()` stops the browser from reloading the page.
   - `new FormData(event.currentTarget)` reads the input values by their `name`.
   - It sets `submitting` to `true`, which disables the button and shows a spinner, and clears
     old errors.
   - It calls `login({ login, password })` from the context (`AuthPage.tsx:42`). The login input
     is named `login` because it accepts the email or the username (`AuthPage.tsx:81`).
4. **The context delegates.** `login` in `AuthProvider.tsx:54` calls `authService.login(request)`.
   `authService` is either `MockAuthService` or `HttpAuthService`, chosen once at
   `authService.ts:134` from `VITE_USE_MOCK_AUTH`.
5. **The service answers.**
   - Mock (`mockAuthService.ts:74-84`): waits 500 ms, finds the account by email or username
     (trimmed, ignoring case), compares the password, and returns
     `{ token: "mock-token-<id>", user }`.
   - Real (`authService.ts:52-62`): `POST {API_URL}/api/users/login` with `{ login, password }`.
     It checks that the answer has a string `token` and a user with the backend's shape
     (`isUserDTO`, `authService.ts:24-31`) before trusting it, and converts that user with
     `toUser`.
6. **The session starts.** `startSession` (`AuthProvider.tsx:47-50`) calls `saveSession`, which
   writes `cineweb_token` and `cineweb_user` to localStorage (`session.ts:20-23`), and then
   `setUser(user)`.
7. **React re-renders.** Because `user` changed, `useMemo` builds a new context value
   (`AuthProvider.tsx:46-63`), and every component that uses `useAuth()` re-renders:
   - `MainNavbar` now shows "Hi, viewer" and the dropdown with "Log Out" (`MainNavbar.tsx:35-70`).
   - `AuthPage` now has a `user`, so it renders `<Navigate to={from} replace />` with
     `from = "/upload"` (`AuthPage.tsx:19-22`). The page never calls `navigate()` itself: the
     redirect happens because the state changed.
8. **The guard lets the user in.** `ProtectedRoute` runs again. `user` exists and its role is
   `'viewer'`, which is in `allowedRoles`, so it renders `<Outlet />` (`ProtectedRoute.tsx:24`),
   which shows `UploadPage`.

#### Signing up

The same form switches to sign-up mode with `toggleMode` (`AuthPage.tsx:50-53`), which shows the
first name, last name and username inputs. On submit it calls `register(...)` (`AuthPage.tsx:34-40`).
From there it follows the same path as login (steps 4–8).

- Mock (`mockAuthService.ts:84-104`): rejects the request if the email or username is taken, creates
  a user with the next free `id` and always `role: 'viewer'`, and saves the account under
  `cineweb_mock_accounts`.
- Real (`authService.ts:64-78`): `POST /api/users/register` with the fields renamed to snake_case
  (`user_name`, `first_name`, `last_name`). The backend answers without a token, so the service
  then calls its own `login` with the new email and password and returns that session. Public
  sign-up creates viewers only, so `RegisterRequest` has no `role` field
  (`types/index.ts:196-203`).
- The backend requires a username of 3 to 50 characters and a password of at least 8. The form
  asks for the same with `minLength` and shows "At least 8 characters." (`AuthPage.tsx:91`).
- The phone field exists in `RegisterRequest` as optional, but the form does not ask for it and the
  backend does not store it.

#### How the session is saved and restored

- **Saved:** on login or sign-up, in localStorage under `cineweb_token` and `cineweb_user`
  (`session.ts:3-4`, `20-23`). localStorage survives reloads and closing the browser.
- **Restored:** when the app starts, `AuthProvider` sets the initial `user` state with
  `getStoredSession()` (`AuthProvider.tsx:18`). This happens **synchronously**, before the first
  render, so a protected page does not flash to `/login` on reload.
- **Validated:** `getStoredSession` (`session.ts:31-44`) returns `null` if the token or user is
  missing. If the saved user is not valid JSON, or does not look like a `User` (checked by `isUser`,
  `session.ts:7-14`), it clears the session and also returns `null`.
- **Checked with the backend:** right after the first render, a `useEffect` in `AuthProvider`
  (`AuthProvider.tsx:21-44`) calls `authService.getCurrentUser()`, which asks
  `GET /api/users/me` with the saved token (`authService.ts:90-107`). Then:

  | Answer | What happens |
  |---|---|
  | The user (200) | The token is still valid. The saved user is replaced with the fresh data, in case the profile changed. |
  | `null` (401: token expired, revoked, or account deactivated) | `clearSession()` and `setUser(null)`: the user is logged out. |
  | Error (server unreachable) | Nothing: the saved session is kept, so a server problem does not log anyone out. |

  If the user logs in or out while the request is on its way, the answer is ignored, because the
  token it was asked for is no longer the saved one (`AuthProvider.tsx:29`). With the mock, the
  user is found from the id inside `mock-token-<id>`.

#### How a route is protected by role

`ProtectedRoute` (`ProtectedRoute.tsx`) is a *layout route*: it has no `path` of its own, and it
wraps child routes (`App.tsx:36-42`). For each visit it decides one of three outcomes:

| Situation | Result | Code |
|---|---|---|
| No user | Redirect to `/login`, remembering `from` | `ProtectedRoute.tsx:15-18` |
| User, but role not in `allowedRoles` | Redirect to `/` | `ProtectedRoute.tsx:20-22` |
| User with an allowed role (or no `allowedRoles` given) | Render the child page through `<Outlet />` | `ProtectedRoute.tsx:24` |

Groups today (`App.tsx:54-72`): `allowedRoles={['viewer']}` for `/upload`, `/upload-series`,
`/my-videos`, `/report/:type/:id`, `/appeal/:reportId` and `/watch-later`;
`allowedRoles={['administrator']}` for `/admin` and `/admin/reports/:id`; and a group with no
`allowedRoles` (any logged-in user) for `/profile`. A viewer who opens `/admin` is sent to `/`, and
so is an administrator who opens a viewer screen.

#### Logging out

The "Log Out" button calls `handleLogout` (`MainNavbar.tsx:13-16`). It calls the `onLogout` prop,
which `App` connects to `logout` from the context (`App.tsx:25`), and then navigates to `/`.
`logout` (`AuthProvider.tsx:56-61`) does three things, in this order:

1. Calls `authService.logout()` (`AuthProvider.tsx:58`). With the real backend this sends
   `POST /api/users/logout` with the token (`authService.ts:80-88`), so the server deletes that
   session and the token stops working at once. The mock does nothing. It does not wait for the
   answer, and `HttpAuthService.logout` never fails: if the server is unreachable, the user is
   still logged out locally, and the token expires on its own after 7 days.
2. Removes both localStorage keys with `clearSession()`.
3. Sets `user` to `null`, so the navbar and the guards react.

The order matters: `HttpAuthService.logout` reads the token with `authHeader()` before its first
`await`, so it still finds it even though `clearSession()` runs right after.

#### What happens when something fails

| Failure | Where it is handled | What the user sees |
|---|---|---|
| Wrong credentials, or an account deactivated by an administrator | Mock: `mockAuthService.ts:82`. Real: status 401 → `authService.ts:55` | "Incorrect email, username or password." |
| Email or username already used | Mock: `mockAuthService.ts:94`. Real: status 409 → `authService.ts:73` | "That email or username is already in use." |
| Invalid sign-up data (real backend) | Status 400 → `authService.ts:72` | "Please check your details: the username needs 3 to 50 characters and the password at least 8." |
| Empty login fields (real backend) | Status 400 → `authService.ts:54` | "Please enter your email or username and your password." |
| Server unreachable / network down | `fetch` throws → `authService.ts:122` | "We couldn't reach the server. Please try again later." |
| Any other HTTP error | `authService.ts:126` | "Something went wrong. Please try again." |
| Login answer without a token or a valid user | `authService.ts:60` | "Something went wrong. Please try again." |
| Unexpected error (a bug, not an `ApiError`) | `AuthPage.tsx:45` | "Something went wrong. Please try again." |
| Corrupted session in localStorage | `session.ts:36-43` | Nothing visible: they are treated as logged out. |
| `useAuth()` used outside `AuthProvider` | `useAuth.ts:7` | Developer error, thrown on purpose to catch the bug early. |
| Empty fields, invalid email format, short password or username | HTML `required`, `type="email"` and `minLength` in `AuthPage.tsx` | The browser's own validation message. |

The error appears in a DaisyUI `alert` with `role="alert"` (`AuthPage.tsx:97`), and
`submitting` goes back to `false` so they can try again (`AuthPage.tsx:46`).

How the messages travel: services throw `ApiError` (`api.ts:24-29`), an `Error` whose message is
already friendly. For content requests, `statusMessage` (`api.ts:14-21`) turns 400, 401, 403, 413
and 415 into "Please check the information you entered.", "Your session has expired. Please log in
again.", "You do not have permission to do that.", "The file is too large..." and "That file is not
a video...". A 409 (conflict) shows the backend's own `message` (`api.ts:61-65`), because those are
already readable sentences such as "You have already reported this content". The page shows `err.message` only when the error is an `ApiError`. Anything else
gets the generic message, so technical details never reach the user.

#### Switching from the mock to the real backend

1. Start the backend with the updated `init.sql` (it creates the `users` and `user_sessions`
   tables). Register an account from the app; an administrator has to be promoted by hand in SQL,
   as the backend README explains.
2. In `.env`, set `VITE_USE_MOCK_AUTH = false` (or remove it) and restart `pnpm dev`, because Vite
   reads `.env` only at startup.
3. Nothing else changes: the rest of the app depends on the `AuthService` interface, not on
   either implementation.
4. When the mock is no longer needed, delete `mockAuthService.ts` and the switch at the bottom of
   `authService.ts`, as its header comment says (`mockAuthService.ts:7-11`).

### 3.2 Landing page ✅

1. `LandingPage` gets `{ items, loading, error }` from the custom hook `useCatalog`
   (`LandingPage.tsx:12`).
2. `useCatalog` (`useCatalog.ts:16-41`) runs once on mount. It asks for movies and series at the
   same time with `Promise.allSettled` (`useCatalog.ts:23`), which do `GET /api/movie` and
   `GET /api/series`. Each one is converted into a `CatalogItem`
   (`{ kind, id, title, category, description, thumbnailPath, duration }`) by
   `movieToCatalogItem` or `seriesToCatalogItem` (`catalog.ts`). `allSettled` (instead of
   `Promise.all`) means that if one list fails, the other one is still shown, with a warning
   (`LandingPage.tsx:59-63`).
3. While loading it shows grey skeletons with the shape of the page (`LandingPage.tsx:24-34`). If
   nothing loaded it shows the error, and with no content at all it invites the visitor to upload
   (`LandingPage.tsx:41-52`).
4. `Hero` shows a banner with `featuredItem` (`catalog.ts:37-40`): the newest item with a thumbnail.
5. `categoriesOf` (`catalog.ts:72`) lists the categories found in the data, once each:
   "Drama", "drama " and "DRAMA" are the same category, because `categoryKey` (`catalog.ts:61`)
   trims and lowercases them. There is no categories table in the backend: categories are whatever
   uploaders typed.
6. The page shows one link per category, which opens the search filtered by it
   (`LandingPage.tsx:66-78`), then the carousels "New movies", "Series" and one per category
   (`LandingPage.tsx:80-90`).
7. `Section` is a carousel with left and right arrows that use `scrollBy` (`Section.tsx:22`). Each
   card is a `ContentCard`, which links to `/watch/:id` for a movie or `/series/:id/seasons` for a
   series (`catalogItemPath`, `catalog.ts:32-34`). The React `key` includes the kind, because a
   movie and a series can have the same `id` (`Section.tsx:48`).

### 3.3 Search ✅ ⚠️

1. `SearchBar` is a `<form>`: Enter and the button both run its submit handler, which navigates to
   `/search?q=<text>` (encoded with `encodeURIComponent`), or to `/search` when the text is empty.
2. `SearchPage` keeps every filter in the URL: `q` (title text), `type` (`movie` or `series`) and
   `category` (a category key). A search can be shared as a link, and "Back" returns to the
   previous filters. `parseCatalogType` (`catalog.ts:93`) ignores an invalid `type` in the URL.
3. It uses the same `useCatalog` hook as the landing page and filters in the browser with
   `filterCatalog` (`SearchPage.tsx:23`, `catalog.ts:83`): type, category and title text, all
   ignoring case. The backend has no search endpoint.
4. The two `<select>` (type and category) call `setFilter` (`SearchPage.tsx:27`), which changes one
   URL parameter and keeps the others. The page re-renders because the URL changed.
5. The `SearchBar` gets `key={filters.query}` (`SearchPage.tsx:42`), so it starts again with the
   new text when the URL changes.
6. Loading, error, and "No videos match this search." with a "See all videos" link are handled.

The filtering functions have unit tests (`catalog.test.ts`).

⚠️ Filtering by director (sketch 2) is not possible: the backend has no director field.

### 3.4 Watching a movie ✅

1. The route `/watch/:id` gives `WatchPage` the `id` through `useParams`.
2. A `useEffect` on `[id]` calls `getMovie(id)`. It handles **loading** (a skeleton with the shape
   of the page), **error** (a friendly message and a link to search) and success, and ignores
   answers for an old `id` (`WatchPage.tsx:23-66`).
3. `getMovie` converts the backend's snake_case movie into `Movie` with `toMovie`
   (`movieService.ts`), so the page reads `uploaderId`, `uploaderUsername` and `thumbnailPath`.
4. The video plays from the backend's static folder, `videoUrl(movie.path)`, with the thumbnail as
   `poster` (`WatchPage.tsx:76-81`).
5. Badges show the type, category, duration (`formatDuration`) and views. "Uploaded by @user"
   appears when the backend sends the username (`WatchPage.tsx:86-93`).
6. `ReviewButtons` (3.11) and `WatchLaterButton` (3.12) are under the title (`WatchPage.tsx:96-99`).
7. Descriptions longer than 180 characters get a "See more / See less" button
   (`SHORT_DESCRIPTION`, `WatchPage.tsx:13`, `69`).
8. "⚑ Report" links to `/report/movie/:id`. It is hidden when the logged-in user uploaded the
   movie, because nobody can report their own content (`WatchPage.tsx:112-115`).

### 3.5 Uploading a movie ✅

1. The page is a real `<form>` (`UploadPage.tsx:74`): every field is `required`, so the browser
   checks empty fields and Enter submits.
2. `VideoPicker` is the file input. When a file is chosen, `utils/videoThumbnail.ts` reads it in
   the browser: it captures a frame near second 2 as a JPEG thumbnail and reads the duration, and
   the picker shows them as a preview. A file the browser cannot play still uploads, without them.
   The file name, without its extension, becomes the default title (`UploadPage.tsx:30`).
3. On submit, `handleSubmit` (`UploadPage.tsx:33-67`) builds `movieData` with title, category,
   description and the duration. It does not send the uploader: the backend takes it from the
   token (`UploadPage.tsx:44`).
4. It calls `uploadMovie` (`movieService.ts`). The service builds a `FormData` with `data` (the
   JSON text), `file` (the video) and, if there is one, `thumbnail`, and passes it to
   `uploadWithProgress` (`api.ts:77-100`). That helper sends it with `XMLHttpRequest` instead of
   `fetch`, because `fetch` cannot report upload progress. The request carries `authHeader()`.
5. On success it clears the form, including the file input with `form.reset()`
   (`UploadPage.tsx:61`), and shows a success message. On failure it shows a friendly error: a file
   that is too large (413) or not a video (415) has its own message (`api.ts:18-19`).

### 3.6 My Videos ✅ ⚠️

1. On mount, it calls `getMovies()` and keeps only the movies whose `uploaderId` is the logged-in
   user's `id` (`MyVideosPage.tsx:44`). `RequestStatus` handles loading, error and "You have not
   uploaded any movie yet." with a link to upload one (`MyVideosPage.tsx:169-171`). Each movie shows
   its thumbnail.
2. **Delete:** `deleteVideo` asks for confirmation with `window.confirm`, then calls `deleteMovie`
   and removes the video from the list on success (`MyVideosPage.tsx:58-64`). The delete is logical:
   the backend sets `state = 'deleted'` and stops listing it.
3. **Edit:** `startEditing` copies the video into the edit fields. `saveEdit` rejects an empty
   title, calls `updateMovie` (`MyVideosPage.tsx:110`) and updates the list locally.
4. Errors from edit or delete are shown above the list. While a video is being saved or deleted,
   its buttons are disabled (`busyVideoId`).
5. **Series:** a second block lists the series uploaded by the logged-in user, filtered the same
   way by `uploaderId` (`MyVideosPage.tsx:51-52`). It has its own loading, error and empty state
   (`MyVideosPage.tsx:331-333`), so a failure in one block does not hide the other. Each series is
   a `MySeriesItem` with "Edit" (`PATCH /api/series/:id`), "Delete" (after a confirmation, a logical
   delete that also hides its seasons and episodes) and "Manage seasons". It tells the
   page with its output props `onUpdated` and `onDeleted`.
6. **Seasons and episodes:** `SeasonsManager` (`MySeriesItem.tsx:136`) lists the seasons of the
   series. Each row can change the season number and description (`updateSeason`), be deleted
   after a confirmation (`deleteSeason`), and open an `EpisodesManager` (`SeasonsManager.tsx:107`)
   that does the same for episodes (`updateEpisode`, `deleteEpisode`). A number that is already
   used answers 409, and its message is shown.
7. The header has "Upload videos" and "Upload series" buttons (`MyVideosPage.tsx:143-148`).

⚠️ Movies and series are filtered in the browser, because the backend has no "content of a user"
endpoint. `uploaderId` comes from the backend's `id_author`; the diagram calls it `upladerId`, a typo.

### 3.7 Series: seasons, episodes, watching and uploading ✅ ⚠️

The series pages read from the backend through `seriesService.ts`. Each one follows the same
pattern as `WatchPage`: a `useEffect` that depends on the route params, a `cancelled` flag that
ignores answers for old params, and `RequestStatus` for loading and errors. When a page needs
several things, it asks for them at the same time with `Promise.all`; if any request fails, the
page shows that request's friendly error.

Series are reached from the landing page carousels and the search, where they appear next to the
movies with a "Series" badge (3.2).

**Types.** `Series`, `Season` and `Episode` (`types/index.ts`) are the shapes the pages use. Their
names follow the domain diagram except where it is known to be wrong: `Series` uses `id` (the
diagram says `idSerie`) and `Season` points to its series with `seriesId` (the diagram says
`audiovisualId`). There are no `seasons` / `episodes` arrays: the diagram's arrays are
relationships, and the backend serves them from separate endpoints.

- `SeasonSelectPage` (`/series/:id/seasons`): loads the series and its seasons together
  (`SeasonSelectPage.tsx:37`). The active season is the one picked in the `<select>`, or the first
  one until the user picks. The episodes of the active season are loaded by a second `useEffect`
  each time the season changes, and shown with `EpisodeList` (`SeasonSelectPage.tsx:130`). The
  page also has `WatchLaterButton` and "⚑ Report series" (hidden for the uploader). With no seasons
  it shows "This series has no seasons yet."
- `EpisodeListPage` (`/series/:id/season/:seasonId/episodes`): loads the series, the season and its
  episodes (`EpisodeListPage.tsx:26`).
- `WatchSeriesPage` (`/watch-series/:id/:seasonId/:episodeId`): loads the series, the season, the
  episode and the other episodes of the season (`WatchSeriesPage.tsx:32`), plays
  `videoUrl(episode.path)` (`WatchSeriesPage.tsx:64`), shows `ReviewButtons` for the episode
  (`WatchSeriesPage.tsx:79`) and "⚑ Report series" for anyone but the uploader
  (`WatchSeriesPage.tsx:82-83`).

⚠️ The pages do not check that the season belongs to the series in the URL, or that the episode
belongs to the season: they trust the links.

#### Uploading a series ✅

`UploadSeriesPage` (`/upload-series`, viewers only, "Upload → Series" in the navbar) shows three
forms. The order matters, because each step needs the one before it.

1. **Loading.** On mount the page calls `getAllSeries()` and keeps only the series whose
   `uploaderId` is the logged-in user's `id` (`UploadSeriesPage.tsx:25-26`). The season and episode
   forms only offer those. The backend also answers 403 for someone else's series.
2. **New series.** `NewSeriesForm` sends title, category and description with `createSeries`
   (`NewSeriesForm.tsx:43-47`), plus an optional cover image. Without a cover the series shows a
   frame of its first episode. On success it calls its `onCreated` output prop
   (`NewSeriesForm.tsx:55`), and the page adds the series to its list, so it appears at once in the
   other two forms.
3. **New season.** `NewSeasonForm` receives the list through its `series` prop and sends the chosen
   series, the season number and a description with `createSeason`. On success it suggests the
   next season number and calls `onCreated`.
4. **New episode.** `NewEpisodeForm` loads the seasons of the chosen series, so a season added in
   step 3 shows up without reloading. It uses `VideoPicker` and `uploadEpisode` with a progress
   bar, the same way as movies (3.5).

All three are real `<form>` elements with `required` inputs, so Enter submits and the browser
checks empty fields. Each form has its own submitting, error and success state.

### 3.8 Report a video ✅

`ReportPage` (`/report/:type/:id`, viewers only) reports a movie (`/report/movie/3`) or a series
(`/report/series/1`). Episodes are reported through their series. Every "Report" button is hidden
for the content's own uploader.

1. The `type` in the URL is checked with `isReportTargetType`; anything else shows "We couldn't
   find that video." (`ReportPage.tsx:93-95`).
2. A `useEffect` loads, at the same time, the title of the content (`getMovie` or `getSeries`) and
   the reasons catalog with `getReportTypes` (`ReportPage.tsx:37-58`). The reasons are the
   `ReportType` records that administrators manage (3.10), not a fixed list in the code. With no
   reasons it says reporting is not available.
3. One radio button per reason (`ReportPage.tsx:121-133`). When a reason is chosen a text area
   appears: optional, or required when the type has `requiresDetails` (for example "Other")
   (`ReportPage.tsx:136-150`). "Report" stays disabled until the form is valid (`canSave`,
   `ReportPage.tsx:62-63`).
4. Submitting the form only opens a DaisyUI confirmation modal (`ReportPage.tsx:66-69`, `166`).
   "Cancel" closes it and keeps the choices.
5. "Send report" runs `confirmReport` (`ReportPage.tsx:71-88`), which calls `reportContent`
   (`reportService.ts`): `POST /api/reports` with `{ targetType, targetId, reportTypeId, details? }`
   and the token. The backend takes the reporter from the token.
6. On success it shows "Thanks for your report" and a link back. On failure it shows the error; a
   409 shows the backend's reason (for example "You have already reported this content").

`ReportPage.test.tsx` checks the page with fake services, including the "Other" type with its
explanation, the backend's 409 message and an invalid type in the URL.

### 3.9 Profile, reports received and appeals ✅

**`ProfilePage`** (`/profile`, any logged-in user, "My Profile" in the avatar menu):

1. A form with username, email, first and last name, filled with the current `user`. There is no
   password field. On submit it sends only the fields that changed through `updateProfile` from
   `AuthContext` (`ProfilePage.tsx:91`). With nothing changed it says "There is nothing to change."
   (`ProfilePage.tsx:85`) and sends nothing.
2. `updateProfile` in `AuthProvider` calls `authService.updateProfile`, saves the returned user in
   localStorage and updates the state, so the navbar greeting changes at once.
   `HttpAuthService.updateProfile` (`authService.ts:111`) sends `PATCH /api/users/me` with the
   fields in snake_case. A 409 shows the backend's message ("Email is already in use").
3. For viewers only, `ViewerActivity` (`ProfilePage.tsx:14`) loads `GET /api/viewers/me` with
   `getViewerProfile` and shows: uploaded videos, ratings given, and **reports received** on their
   content (a count computed by the backend). Below it shows `MyReportsList`
   (`ProfilePage.tsx:48`).

**`MyReportsList`** ("Reports about my content", sketch 7) loads `GET /api/viewers/me/reports` with
`getMyReports` and shows each moderation case with `CaseSummary`. A case still `pending` and
without an appeal has an "Appeal" button that opens `/appeal/:caseId` (`MyReportsList.tsx:70-74`).
A pending appeal has "Withdraw appeal", which asks for confirmation, calls `withdrawAppeal`
(`DELETE /api/appeals/:id`) and loads the cases again (`MyReportsList.tsx:32-47`). The empty state
says "Nobody has reported your videos."

**Appeal status.** The backend sends `reviewed` and `decision`, which say the same thing twice.
`toAppeal` (`appealService.ts`) and `toCaseAppeal` (`reportService.ts`) keep one `status`:
`'pending'` while `decision` is `null`, else `'approved'` or `'rejected'`.

**`AppealPage`** (`/appeal/:reportId`, viewers only) finds the case among the user's own cases
(`getMyReports`, `AppealPage.tsx:37-43`), so another user's case shows "We couldn't find that report
about your content.". If the case can still be appealed (`canAppeal`, `AppealPage.tsx:68`) it shows
a text area (required, max 2000 characters, with a counter); otherwise it explains that the case
was already appealed or decided. It sends `POST /api/appeals` with `{ reportId, description }`
through `createAppeal`. A 409 shows its reason. On success it links to the profile.

### 3.10 Administrator screens ✅ ⚠️

`AdminPage` (`/admin`, administrators only, "Administration" in the navbar) is the administrator
landing page (sketch A). On mount it loads the pending appeals, the accounts and the report reasons
at the same time (`AdminPage.tsx:48-63`). It has five tabs (`AdminPage.tsx:20-26`), which scroll
sideways on phones.

**Pending appeals (sketch B).** One `AppealReviewCard` per appeal, with its description and case
number. "See the reports" loads `GET /api/reports/:caseId` and shows the reasons grouped and
counted. "Accept appeal" / "Reject appeal" ask for confirmation and send
`PATCH /api/administrators/appeals/:id` with `decision`. Accepting keeps the content online;
rejecting makes the backend suspend it. The card calls its output prop `onResolved`, and
`handleResolved` (`AdminPage.tsx:65-70`) removes the appeal from the list and shows a toast.

**Reports.** `ModerationCasesPanel` lists the moderation cases with three filters: case number,
status (`pending`, `appealed`, `upheld`, `dismissed`) and reason (`ModerationCasesPanel.tsx:21-26`).
"Search" sends them as query parameters to `GET /api/reports` (`getModerationCases`,
`adminService.ts`). Each case shows the reported user, the content and the grouped reasons, and
opens its detail page.

**Case detail.** `ModerationCasePage` (`/admin/reports/:id`) loads `GET /api/reports/:id` and shows
the content, the reported user, the total of reports, the appeal (with "Accept" / "Reject" while it
is pending, `ModerationCasePage.tsx:45-65`) and a table with every report, its reason and details
(`ModerationCasePage.tsx:111-136`).

**Report reasons.** `ReportTypesManager` is the CRUD of the `ReportType` catalog: create, rename,
switch `requiresDetails`, and delete after a confirmation. A repeated name or a reason that reports
already use answers 409, and its message is shown (`ReportTypesManager.tsx:45-63`). It tells the
page with the output props `onSaved` and `onDeleted`.

**Users.** `AccountsTable` lists every viewer and administrator with an "Active" / "Inactive" badge
and a button to deactivate or activate the account. A deactivated account cannot log in. The
administrator's own row has no button, because the backend does not allow deactivating yourself.

**New administrator.** `NewAdministratorForm` creates an administrator with
`POST /api/administrators`. Like the login form, its inputs are uncontrolled, so the password is
never kept in React state. The new account is added to the users table through `onCreated`.

Tests: `AppealReviewCard.test.tsx` and `ReportTypesManager.test.tsx`.

⚠️ **Appeal history (sketch C) is not built:** the backend can only list pending appeals and
cannot change a verdict (1.4, point 1). Decided appeals can still be seen in the detail of their
case.

### 3.11 Reviews: like / dislike ✅

`ReviewButtons` (`ReviewButtons.tsx`) is shown under the title in `WatchPage` (`type="movie"`) and
for each episode in `WatchSeriesPage` (`type="episode"`, `WatchSeriesPage.tsx:79`). The backend has
reviews for movies and episodes only, not for whole series.

1. A `useEffect` on `[type, id]` loads the reviews with `getReviews` (`GET
   /api/reviews/audiovisual/:type/:id`) and keeps them in state. Likes and dislikes are counted
   from that list; nothing is stored twice.
2. `myReview` is the review whose `viewerId` is the logged-in user's `id`
   (`ReviewButtons.tsx:44`). The button of that vote is highlighted and has `aria-pressed="true"`.
3. Only viewers can vote (`canVote`, `ReviewButtons.tsx:46`). Guests see the counts and a "Log in
   to rate" link; administrators only see the counts.
4. `vote(rating)` decides what to send (`ReviewButtons.tsx:53-61`):

   | Situation | Request | Result |
   |---|---|---|
   | No vote yet | `POST /api/reviews` with `rating`, `audiovisualId`, `audiovisualType` | New vote |
   | Clicking the same vote again | `DELETE /api/reviews/:id` | Vote withdrawn (sketch 6) |
   | Clicking the other vote | `PATCH /api/reviews/:id` with the new `rating` | Like ↔ dislike |

   After each answer it updates the list locally, so the counts change without reloading.
5. The request carries the token and no `viewerId`: the backend takes the reviewer from the token
   (`ReviewRequest` omits it, `types/index.ts:193`). Errors are shown under the buttons; a 409
   shows the backend's message.

`ReviewButtons.test.tsx` checks the counts, voting, withdrawing, changing and the guest view.

### 3.12 Watch later ✅

1. `WatchLaterButton` (props `type`, `id`) is on `WatchPage` (movies) and `SeasonSelectPage`
   (series). For a viewer it loads the list with `getWatchLater` and checks whether this content is
   in it (`WatchLaterButton.tsx:25-42`). The item is identified by `audiovisualType` and
   `audiovisualId`, because a movie and a series can share an id.
2. Clicking it adds the content (`addToWatchLater`) or removes it (`removeFromWatchLater`), and a
   toast confirms it (`WatchLaterButton.tsx:44-60`). The button shows "＋ Watch later" or
   "✓ In Watch later" and has `aria-pressed`.
3. Guests see a link to log in; administrators do not see the button (`WatchLaterButton.tsx:62-67`).
4. `WatchLaterPage` (`/watch-later`, viewers only, "Watch later" in the navbar) lists the saved
   items with their thumbnail and a "Remove" button (`WatchLaterPage.tsx:29-40`). The empty state
   says "Your list is empty." with a link to search.

`WatchLaterButton.test.tsx` checks saving and removing, content already in the list, the guest
link and that administrators see nothing.

## 4. Design decisions and trade-offs

### 4.1 Fake backend behind an interface (Strategy pattern)

**What:** `AuthService` is an interface with two implementations, `HttpAuthService` and
`MockAuthService`. A single line chooses one from `.env` (`authService.ts:155-157`).

**Why:** the backend had no auth when this was built, and frontend work should not be blocked. The rest of the app
(context, pages) only knows the interface, so switching to the real backend changes one variable,
not the components. It is also the OOP design pattern that the course requires.

**Trade-offs:**
- The mock is not the backend. It can drift from what the backend really does (status codes, field
  names, validation rules). `HttpAuthService` is tested with a fake `fetch`, and its requests were
  checked against the running backend with `curl` (3.1).

**Adapter.** `HttpAuthService` is also an Adapter: the backend's user API has its own URLs and
snake_case fields, and the class translates both ways (`toUser`, the snake_case sign-up body), so
`AuthProvider`, the pages and the `User` type do not depend on how the backend names things. If
the backend changes its shape, only `authService.ts` changes.
- The mock stores passwords in plain text in localStorage. It is only acceptable because it is fake
  data for development.
- If someone forgets to set `VITE_USE_MOCK_AUTH = false` in production, users would log in against
  the fake service.

### 4.2 React Context for the session

**What:** `AuthProvider` keeps `user` in state and shares `{ user, login, register, logout }`
through `AuthContext`. Components read it with `useAuth()`.

**Why:** many unrelated components need the session (navbar, guard, login page). Passing it
through props at every level ("prop drilling") would be repetitive. Context is built into React,
so no extra library is needed.

**Trade-offs:**
- Every component that uses `useAuth()` re-renders when the session changes. That is fine for
  something that changes rarely, like login and logout. `useMemo` (`AuthProvider.tsx:46-69`) makes
  sure the value only changes when `user` changes.
- The context, the provider and the hook are in three files (`AuthContext.ts`, `AuthProvider.tsx`,
  `useAuth.ts`). This keeps the project's ESLint `react-refresh` rule happy, because that rule wants
  `.tsx` files to export only components.

### 4.3 Token and user in localStorage

**What:** `cineweb_token` and `cineweb_user` are saved in localStorage (`session.ts`), as agreed with
the backend team.

**Why:** it is simple, survives reloads, and works with a `Bearer` header (`authHeader()`,
`api.ts:42-45`).

**Trade-offs and risks:**
- **XSS:** any JavaScript running on the page can read localStorage. If an attacker manages to
  inject a script, they can steal the token. An `httpOnly` cookie would protect against that, but
  it requires backend support.
- **The stored user is trusted.** Anyone can open the browser tools and change `role` to
  `"administrator"` in `cineweb_user`. The frontend would then show admin screens. This is why the
  backend must check the token on every request: the frontend check is not security.
- **Expiry checked only on startup:** the token is checked with `GET /api/users/me` when the app
  starts (3.1). If it expires while the app is open, the user still looks logged in until a
  request fails or the page is reloaded.
- **No sync between tabs:** logging out in one tab does not update other open tabs until they
  reload.

### 4.4 Session restored synchronously

`useState(() => getStoredSession()?.user ?? null)` (`AuthProvider.tsx:18`) reads localStorage
**before** the first render. If it were done in a `useEffect`, the first render would have
`user = null`, and `ProtectedRoute` would send a logged-in user to `/login` for a moment.
Trade-off: it only works because localStorage is synchronous. The check against the server
(`GET /api/users/me`, 3.1) runs **after** that first render instead of blocking it, so for a moment
the app trusts the saved session. That avoids a loading screen on every visit; if the token turns
out to be invalid, the user is logged out as soon as the answer arrives.

### 4.5 Uncontrolled inputs for the password

The login form reads its values with `FormData` on submit (`AuthPage.tsx:31`) instead of
keeping every keystroke in `useState`. This follows the project rule that the password only
exists in `LoginRequest` / `RegisterRequest`, never in state.
Trade-off: there is no live validation as the user types (for example "password too short"). It
relies on HTML validation (`required`, `type="email"`).

### 4.6 Route protection with a layout route

`ProtectedRoute` renders `<Outlet />` and wraps a group of routes (`App.tsx:54-72`), instead of
wrapping each page separately. Adding a protected page means adding one line inside the group.
Trade-off: everything in a group shares the same roles. A page that needs other roles needs its
own group.

### 4.7 Types in a single file

All types live in `src/types/index.ts`, because that is how the project already worked.
Trade-off: the file grows with every entity. Some types do not match the domain diagram yet
(for example `Series`, `Season` and the report / moderation case split). The domain diagram
(`docs/dnd_cineweb.drawio`) is the source of truth for names.

### 4.8 Honest limits

**What is mock or hardcoded today**
- Authentication uses `mockAuthService.ts` only while `VITE_USE_MOCK_AUTH = true`. The default in
  `.env.example` is `false` (real backend).
- Categories are free text typed by the uploader; there is no categories table (3.2).

**What is tested**
- On 2026-10-13, `pnpm lint`, `pnpm test` (17 test files, 70 tests) and `pnpm build` all passed.
- Unit tests (Vitest + Testing Library) cover components (`ProtectedRoute`, `MainNavbar`,
  `AppealReviewCard`, `MyReportsList`, `ReportTypesManager`, `ReviewButtons`, `SeasonsManager`,
  `WatchLaterButton`), pages (`AuthPage`, `ReportPage`, `NotFoundPage`), providers (`AuthProvider`,
  `ToastProvider`), services (`authService`, `movieService`, `reportService`) and `utils/catalog.ts`.
  They use fake services or a fake `fetch`, never the real backend.
- There is no end-to-end test yet (5.2).
- This manual does not record which screens were clicked through in a browser against the running
  backend; that could not be verified by reading the code.

**Known security risks**
- Token in localStorage, readable by any script on the page (4.3).
- The role shown in the frontend can be changed by the user. Hiding screens is a convenience; the
  backend must enforce permissions, and per the API contract it checks the token and the owner on
  writes (403 otherwise).
- A token that expires while the app is open is only noticed on the next reload or the next request
  that answers 401 (4.3). Logging out revokes the token on the server (3.1).
- Mock passwords in plain text in localStorage (development only, `VITE_USE_MOCK_AUTH = true`).

### 4.9 Known issues and technical debt

| Issue | Where |
|---|---|
| Appeal history with verdict changes (sketch C) is not built: the backend has no endpoint for it yet. | `AdminPage.tsx` (1.4) |
| Search cannot filter by director, and content has no subtitle or audio language: the backend has no such fields. | `SearchPage.tsx` (3.3) |
| "My Videos" and "Upload series" download every movie and series and filter them by `uploaderId` in the browser, because there is no "content of a user" endpoint. | `MyVideosPage.tsx:44`, `51-52`, `UploadSeriesPage.tsx:25-26` |
| The series pages do not check that the season belongs to the series in the URL, or the episode to the season. | `EpisodeListPage.tsx`, `WatchSeriesPage.tsx` |
| Episodes cannot be reported on their own: the button reports the whole series. | `WatchSeriesPage.tsx:82-83` |
| `LanguagePanel` is not used by any page. | `src/components/LanguagePanel.tsx` |
| There is no end-to-end test (required for approval). | 5.2 |

---

## 5. Course requirements compliance

Requirements set by the course for regularity and approval. Status: ✅ Met · 🟡 Partial · ❌ Pending.

### 5.1 Regularity

| Requirement | Where in the code | Status |
|---|---|---|
| Handle user events (click, input...) | `AuthPage.tsx` (`onSubmit`, `toggleMode`), `SearchBar.tsx` and `SearchPage.tsx` filters (`onSubmit`, `onChange`), `UploadPage.tsx`, `ReportPage.tsx` (radio buttons, text area, confirmation modal), `ReviewButtons` and `WatchLaterButton` (`onClick`), `MyVideosPage.tsx` and the managers (edit / delete), `ModerationCasesPanel` filters | ✅ |
| Handle errors in a user-friendly way | `ApiError`, `request()` and `statusMessage` in `api.ts` turn network and HTTP failures (400, 401, 403, 404, 409, 413, 415) into friendly English sentences; pages show them with `errorMessage()` through `RequestStatus`, alerts or toasts (3.1, 1.3) | ✅ |
| React to state changes | `SearchPage.tsx` (re-filters when the URL changes), `WatchPage.tsx` (`[id]`), `SeasonSelectPage.tsx` (loads the episodes when the active season changes), `AuthPage.tsx` (redirect when `user` changes), `MainNavbar` (guest / viewer / administrator), `ReviewButtons` (counts from the reviews state) | ✅ |
| Use input props | `Section` (`title`, `items`, `seeAllTo`), `MainNavbar` (`user`), `ProtectedRoute` (`allowedRoles`), `ReviewButtons` and `WatchLaterButton` (`type`, `id`), `CaseSummary` (`moderationCase`, `showOwner`), `RequestStatus`, `SearchBar` (`initialText`) | ✅ |
| Use output props | `MainNavbar` `onLogout` (`App.tsx`), `AppealReviewCard` `onResolved`, `AccountsTable` `onChanged`, `NewAdministratorForm` `onCreated`, `ReportTypesManager` `onSaved` / `onDeleted` (`AdminPage.tsx`); `MySeriesItem` `onUpdated` / `onDeleted` (`MyVideosPage.tsx`); `NewSeriesForm` / `NewSeasonForm` `onCreated` (`UploadSeriesPage.tsx`); `VideoPicker` `onPicked` | ✅ |
| At least one service | `src/services/`: `api.ts`, `session.ts` and one service per entity (`authService`, `movieService`, `seriesService`, `reviewService`, `watchLaterService`, `reportService`, `reportTypeService`, `appealService`, `viewerService`, `adminService`) | ✅ |
| Model API data with interfaces/types | `src/types/index.ts`: backend DTOs (`MovieDTO`, `SeriesDTO`, `SeasonDTO`, `EpisodeDTO`, `UserDTO`, `AppealDTO`) and the app's types (`Movie`, `Series`, `Season`, `Episode`, `User`, `ReportType`, `ModerationCase`, `Appeal`, `Review`, `WatchLaterItem`, `LoginRequest`, `RegisterRequest`, ...) | ✅ |
| Apply an OOP design pattern | Strategy: `AuthService` interface with `HttpAuthService` and `MockAuthService` classes (`authService.ts`, `mockAuthService.ts`). Adapter: `HttpAuthService` translates the backend's user API into the app's types (4.1) | ✅ |
| Dependencies registered in `package.json` | `package.json` lists every runtime, development and test dependency; `pnpm-lock.yaml` locks them (pnpm only) | ✅ |
| Mobile-first, SM / MD / LG | Unprefixed Tailwind classes for phones and `sm:` / `md:` / `lg:` for larger screens in every page (for example `WatchPage.tsx:73`, `AdminPage.tsx:94`). Not verified by reading alone: check each page in the browser at the three widths | 🟡 |

### 5.2 Approval

| Requirement | Where in the code | Status |
|---|---|---|
| At least one component unit test | Vitest + Testing Library, run with `pnpm test`: 17 test files (4.8). Component tests give the component a fake context or fake services, so they do not need the backend | ✅ |
| At least one end-to-end test | None | ❌ |
| Login, with access protected by the backend's user levels via `ProtectedRoute` | `ProtectedRoute.tsx`, `AuthPage.tsx`, `AuthProvider.tsx`, roles `administrator` / `viewer` in `types/index.ts`. Viewer screens use `allowedRoles={['viewer']}` and the administration screens `allowedRoles={['administrator']}` (`App.tsx:54-72`). The roles come from the backend's `/api/users/login` | ✅ |
| Environments defined with `.env` | `.env` (git-ignored), `.env.example`, `VITE_API_URL`, `VITE_USE_MOCK_AUTH`, typed in `vite-env.d.ts`. There is one environment, with no separate development/production files | ✅ |

---

## 6. Glossary

**API / endpoint** — The set of URLs a server answers. An endpoint is one of them, such as
`POST /api/users/login`.

**Async / await, Promise** — A Promise is a value that will be ready later, like a server
response. `await` pauses an `async` function until the Promise is ready. `.then()` does the same
with callbacks (`LandingPage.tsx` explains it in its bottom comment).

**Bearer token / Authorization header** — How a request proves who is sending it: the header
`Authorization: Bearer <token>`. Built by `authHeader()` (`api.ts:42`).

**Component** — A function that returns UI (JSX). Example: `Section`, `AuthPage`.

**Context / Provider** — React's way to share a value with many components without passing props
through every level. The Provider (`AuthProvider`) holds the value. Components read it with
`useContext`, here wrapped in `useAuth`.

**Controlled vs uncontrolled input** — Controlled: React state holds the value
(`value={title} onChange=...` in `UploadPage`). Uncontrolled: the browser holds the value and you
read it when needed (`FormData` in `AuthPage`).

**CORS** — A browser rule that blocks requests to another origin unless the server allows them.
The backend enables it with `cors()`. It matters because the frontend (port 5173) and the backend
(port 3000) are different origins.

**DaisyUI** — A Tailwind plugin with ready-made component classes such as `btn`, `card`, `input`,
`alert` and `navbar`.

**Discriminator field** — A field whose value tells which variant an object is. `User.role` tells
whether a user is an `administrator` or a `viewer`.

**DTO (Data Transfer Object)** — The shape of data as it travels between frontend and backend.
Examples: `MovieDTO`, `LoginRequest`, `AuthResponse`.

**Environment variables / `.env`** — Settings outside the code, such as the API URL. Vite only
exposes variables that start with `VITE_`, through `import.meta.env`. It reads them when the dev
server starts.

**fetch** — The browser function for HTTP requests. It returns a Promise. It only throws on
network failure: an HTTP error such as 404 must be checked with `response.ok`.

**FormData** — A browser object holding form fields. Used to read the login form, and to send a
file plus data in the upload (`multipart/form-data`).

**Hook** — A React function whose name starts with `use` (`useState`, `useEffect`...). A
**custom hook** is one written by us, such as `useAuth`.

**Interface (TypeScript)** — A description of an object's shape, or of the methods a class must
have (`AuthService`). It only exists at compile time.

**JWT (JSON Web Token)** — A signed token format the backend is expected to issue on login. The
frontend only stores it and sends it. The mock's `mock-token-<id>` is **not** a real JWT.

**Layout route / `<Outlet />`** — A route without a path that wraps child routes. `<Outlet />` is
where the matching child renders. `ProtectedRoute` uses it.

**localStorage** — Key-value storage in the browser that survives reloads. Only the same site can
read it, but any script running on that site can.

**Mock** — A fake stand-in for something not available yet. Here: `MockAuthService`.

**Mobile-first** — Styles without a prefix apply to phones, and `sm:`, `md:`, `lg:` add rules for
bigger screens.

**multer** — The backend library that receives uploaded files. It expects the file under a
specific field name (see 1.3).

**`<Navigate />`** — A React Router component that redirects as soon as it renders. `replace`
means the redirect replaces the current history entry, so "Back" does not loop.

**Props (input props)** — Values a parent passes to a child component, such as
`<Section title="Uploaded" movies={movies} />`.

**Output props** — Props that are functions, named `onSomething`, which the child calls to tell
the parent that something happened. Example: `onLogout` in `MainNavbar`.

**React Router** — The library that maps URLs to components (`BrowserRouter`, `Routes`, `Route`),
and provides `useNavigate`, `useParams`, `useSearchParams` and `useLocation`.

**Service** — A module whose job is talking to the outside world (HTTP, storage), so components
do not have to. Here: `src/services/`.

**SPA (Single Page Application)** — The browser loads one HTML page (`index.html`) and JavaScript
swaps the screens. Changing route does not reload the page, unless a plain `<a href>` is used.

**State (`useState`)** — Data a component remembers between renders. Calling its setter makes
React render the component again.

**Strategy pattern** — An OOP design pattern: several classes implement the same interface, and
the code using them does not care which one it gets. Here: `HttpAuthService` and
`MockAuthService` behind `AuthService`.

**Tailwind CSS** — Styling through small utility classes in the markup (`flex`, `px-4`,
`text-xl`).

**Type guard** — A function that checks at runtime that a value has a type and tells TypeScript
so (`value is User`). Examples: `isUser`, `isUserDTO`. Needed because data from the network
or storage could be anything.

**`useEffect`** — Runs code after rendering, such as fetching data. The dependency array decides
when it runs again: `[]` means once, `[query]` means whenever `query` changes.

**`useMemo`** — Remembers a computed value and recalculates it only when its dependencies change.
Used so the context value stays the same object until `user` changes.

**Vite** — The dev server and build tool (`pnpm dev`, `pnpm build`).

**XMLHttpRequest (XHR)** — The older browser API for HTTP requests. Used in `UploadPage` because,
unlike `fetch`, it reports upload progress.

**XSS (Cross-Site Scripting)** — An attack where someone gets their JavaScript to run on your
page. It is the main risk of keeping tokens in localStorage.
