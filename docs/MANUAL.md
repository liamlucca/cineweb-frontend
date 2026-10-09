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

Every statement about the code points to a file, usually as `path:line`. Line numbers were checked
against the working tree on 2026-10-05 (base commit `a7dba18` plus the user system, which was not
committed yet). If the code changes, line numbers may drift: search for the function name instead.

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

Plus login (email, password) and sign-up (first name, last name, email, username, password).

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

The "Backend status" column was checked by reading the backend's local copy (commit `d234e0a`,
branch `Liam`) on 2026-10-05. The series endpoints and the new user endpoints were checked again
on 2026-10-08 (commit `9d30d59`). The backend team may have newer code that was not available
locally.

**Endpoints the frontend uses**

| Endpoint | Used by | Backend status |
|---|---|---|
| `POST /api/users/login` with `{ login, password }` → `{ token, token_type, expires_in, user }` | `HttpAuthService.login` (`authService.ts:52-62`) | ✅ Available (commit `9d30d59`). Checked against the running backend on 2026-10-09 (see 3.1). |
| `POST /api/users/register` with `{ user_name, first_name, last_name, email, password }` → `{ data: user }` | `HttpAuthService.register` (`authService.ts:64-78`) | ✅ Available (commit `9d30d59`). Checked against the running backend on 2026-10-09 (see 3.1). |
| `POST /api/reports` (with the token, viewers only) with `{ targetType, targetId, reason }` → 201 | `reportContent` (`reportService.ts`), used by `ReportPage` | ✅ Available. 409 when the user already reported it, owns it, or it is not active. Not checked live (3.8). |
| `GET /api/reviews/audiovisual/:type/:id` → `{ data: Review[] }` | `getReviews` (`reviewService.ts`), used by `ReviewButtons` | ✅ Available. Checked live on 2026-10-09. |
| `POST /api/reviews` with `{ viewerId, rating, audiovisualId, audiovisualType }` → `{ data }`; `PATCH /api/reviews/:id` with `{ rating }`; `DELETE /api/reviews/:id` → 204 | `createReview`, `changeReview`, `deleteReview` (`reviewService.ts`), used by `ReviewButtons` | ✅ Available. Checked live on 2026-10-09 (create, change, list, duplicate → 409, delete). These routes do not check the token, and `viewerId` comes from the body (1.4). |
| `GET /api/viewers/me` (viewers only) → `{ data: viewer }` with `reportsReceivedCount`, `appeals`, `uploadedAudiovisuals`, `reviews` | `getViewerProfile` (`viewerService.ts`), used by `ProfilePage` | ✅ Available. Checked live on 2026-10-09. |
| `PATCH /api/users/me` with the changed fields in snake_case → `{ data: user }` | `HttpAuthService.updateProfile` (`authService.ts:111`), used by `ProfilePage` through `AuthContext` | ✅ Available. Checked live on 2026-10-09. 409 when the email or username is taken. |
| `POST /api/appeals` (viewers only) with `{ reportId, description }` → 201 | `createAppeal` (`appealService.ts`), used by `AppealPage` | ✅ Available. 404 for an unknown case (checked live); 409 when the user does not own the content or already appealed. |
| `POST /api/users/logout` (with the token) → 204 | `HttpAuthService.logout` (`authService.ts:80-88`), called by `AuthProvider` on "Log Out" | ✅ Available (commit `9d30d59`). Checked against the running backend on 2026-10-09 (see 3.1). |
| `GET /api/users/me` (with the token) → `{ data: user }`, or 401 if the token is not valid | `HttpAuthService.getCurrentUser` (`authService.ts:90-107`), called by `AuthProvider` when the app starts | ✅ Available (commit `9d30d59`). Checked against the running backend on 2026-10-09 (see 3.1). |
| `GET /api/movie` → array of movies | `getMovies` (`movieService.ts:24-28`), used by `useCatalog` (landing and search) and `MyVideosPage` | ✅ Available. |
| `GET /api/movie/:id` → `{ movie }` | `getMovie` (`movieService.ts:30-35`), used by `WatchPage` | ✅ Available. |
| `POST /api/movie` (multipart: `data` + `file`) | `uploadMovie` (`movieService.ts:49-59`), used by `UploadPage` | ✅ Available. Requires `id_author` (see below). |
| `PATCH /api/movie/:id` | `updateMovie` (`movieService.ts:37-43`), used by `MyVideosPage` | ✅ Available. |
| `DELETE /api/movie/:id` | `deleteMovie` (`movieService.ts:45-47`), used by `MyVideosPage` | ✅ Available. |
| `GET /api/series` → array of series | `getAllSeries` (`seriesService.ts:70-73`), used by `useCatalog` (landing and search), `MyVideosPage` and `UploadSeriesPage` | ✅ Available. |
| `GET /api/series/:id` → `{ serie }` | `getSeries` (`seriesService.ts:75-78`), used by the three series pages | ✅ Available. |
| `GET /api/seasons/serie/:serieId` → array of seasons | `getSeasons` (`seriesService.ts:81-84`), used by `SeasonSelectPage` | ✅ Available. |
| `GET /api/seasons/:id` → `{ season }` | `getSeason` (`seriesService.ts:86-89`), used by `EpisodeListPage`, `WatchSeriesPage` | ✅ Available. |
| `GET /api/episodes/season/:seasonId` → array of episodes | `getEpisodes` (`seriesService.ts:92-95`), used by `EpisodeListPage` | ✅ Available. |
| `GET /api/episodes/:id` → `{ episode }` | `getEpisode` (`seriesService.ts:97-100`), used by `WatchSeriesPage` | ✅ Available. |
| `POST /api/series` (JSON) → `{ message, data }` | `createSeries` (`seriesService.ts:102-104`), used by `NewSeriesForm` | ✅ Available. Requires `id_author` (see below). |
| `POST /api/seasons` (JSON) → `{ message, data }` | `createSeason` (`seriesService.ts:106-108`), used by `NewSeasonForm` | ✅ Available. |
| `POST /api/episodes` (multipart: `data` + `archivo`) | `uploadEpisode` (`seriesService.ts:110-121`), used by `NewEpisodeForm` | ✅ Available. Requires `id_author`. The file field is `archivo`, not `file` (`seriesService.ts:119`). |
| Static files under `/movies` and `/series` | `videoUrl` (`movieService.ts:11-13`) builds video URLs from `path` | ✅ Available. |

**Endpoints available but not used by the frontend yet**

| Endpoints | Notes |
|---|---|
| `GET /api/movie/:id/stream` | Streams the video in chunks. `WatchPage` plays the static file instead (`WatchPage.tsx:61`); both work. |
| `PUT` / `PATCH` / `DELETE` on series, seasons and episodes, `GET /api/episodes/:id/stream` | Not used. `WatchSeriesPage` plays the static file, like `WatchPage`. |
| `GET /api/reviews`, `GET /api/reviews/viewer/:viewerId`, `GET /api/reviews/:id` | Not used: `ReviewButtons` only needs the reviews of one movie or episode. |

**Not available**

| Feature | Notes |
|---|---|
| Appeals, complaints, report types | The backend has routers for them, each with a single `GET /`, but they are not registered in `src/index.ts`, so no URL answers. |

Details:

- **Response shape of `GET /api/movie/:id`.** `getMovie` (`movieService.ts:30-35`) expects
  `{ movie: MovieDTO }`, which matches what the backend sends.
- **`id_author` on upload.** The backend rejects a movie, a series or an episode without
  `id_author`, so the frontend still sends the logged-in user's `id` (`UploadPage.tsx:44`,
  `UploadSeriesPage.tsx:43`, `47`). This goes against the agreed contract below.
- **Movie `state`.** The backend stores `state` as text and only lists movies whose `state` is
  exactly `'active'`. The upload sends `state: 'active'` (`UploadPage.tsx:49`). Before 2026-10-09 it
  sent `true`, which the database stored as `'1'`: movies uploaded from the app that way never
  appear in any list. Fixed and checked against the running backend: an upload with the new `data`
  appeared in `GET /api/movie`.
- **Stored episode file name.** The `path` the backend returns for an uploaded episode is built from
  the episode title, and `data` must be sent before the file for that to work
  (`seriesService.ts:116-117`). Two episodes with the same title (for example "Pilot" in two
  series) get the same `path`, so the second upload replaces the first one's video.
- **User endpoints (commit `9d30d59`).** The backend built authentication under `/api/users`
  instead of the `/auth` URLs first agreed. The frontend adapts to it in `HttpAuthService`
  (`authService.ts:51-131`, see 3.1 and 4.1):
  - Login receives `{ login, password }`, where `login` is the email **or** the username.
  - Sign-up answers `{ data: user }` with no token, so the frontend logs in right after it
    (`authService.ts:77`).
  - The user comes in snake_case (`UserDTO`: `id_user`, `user_name`, `first_name`, `last_name`,
    `email`, `role`, `active`). `toUser` (`authService.ts:34-45`) converts it into the app's `User`.
    The backend has no phone, so `phone` is always `null`.
  - The token is a random string the backend stores in its sessions table and that expires after
    7 days. It is not a JWT. The frontend only stores it and sends it, so this does not change it.
  - Authenticated requests send `Authorization: Bearer <token>`.
  - Other new endpoints not used by the frontend yet: `/api/administrators/...` (users, appeals)
    and `GET /api/reports/:id`.
  - Movie, series, season and episode routes do not check the token yet, so uploads still need
    `id_author` and anyone can still change anyone's content. The agreed goal is still that the
    backend takes the uploader from the token and the frontend never sends it.
- **Field naming.** The backend uses snake_case for movies, series and users (`id_author`,
  `id_serie`, `user_name`), but camelCase for reports and appeals (`targetType`, `reportId`). The
  frontend keeps camelCase types and converts in the services: for users, `toUser` (above). For
  series, `seriesService.ts` converts the backend shapes
  (`SeriesDTO`, `SeasonDTO`, `EpisodeDTO`) into camelCase types (`toSeries`, `toSeason`,
  `toEpisode`, `seriesService.ts:14-41`), so the pages never see snake_case.

### 1.4 What the backend still needs (from the frontend's perspective)

1. Register the appeal, complaint and report type routers in `src/index.ts`, and add the
   endpoints the moderation screens need (report a video, appeal, accept / reject).
2. Authentication exists under `/api/users` and the frontend adapts to it (1.3). Still needed:
   checking the token on the movie, series, season and episode routes, so the uploader comes from
   the token instead of `id_author`. Optional: return a token on sign-up, which would save the
   extra login request, and use one naming style (snake_case or camelCase) everywhere.
3. Agree on error status codes. The frontend already maps 401 (wrong login), 400 (invalid data)
   and 409 (email or username in use) to messages (`authService.ts:54-73`).
4. Give each uploaded episode a unique file name, so episodes with the same title do not overwrite
   each other (see 1.3).
5. Check ownership: reject `POST /api/seasons` and `POST /api/episodes` (and editing or deleting
   series, seasons and episodes) when the user in the token did not upload that series. The
   frontend only hides other users' series in `UploadSeriesPage`; anyone can still send those
   requests directly.
6. Let a viewer list the moderation cases opened against their content (for example
   `GET /api/viewers/me/reports`, with the case id, the content and its status).
   `GET /api/viewers/me` only gives `reportsReceivedCount`, and an appeal needs the case id
   (`reportId`), so today a viewer cannot reach the appeal form from the app (3.9).

---

## 2. Code map

### 2.1 Folder by folder

| Folder | What lives there |
|---|---|
| `src/pages/` | One component per route (one screen each). |
| `src/components/` | Reusable pieces of UI: navbar, search bar, carousel section, request status, route guard. |
| `src/services/` | Code that talks to the outside world (HTTP, localStorage). Today: auth, movies and series. |
| `src/context/` | App-wide state shared through React Context. Today: the session. |
| `src/hooks/` | Custom hooks. Today: `useAuth` and `useCatalog`. |
| `src/utils/` | Pure functions with no React and no HTTP, easy to unit test. Today: `catalog.ts`. |
| `src/types/` | All TypeScript types for domain data and DTOs, in a single file `index.ts`. |
| `src/test/` | Test setup (`setup.ts`). Test files live next to the code they test, as `*.test.tsx`. |
| `src/mockup/` | Fake stand-ins used while the backend is missing. Today only `mockAuthService.ts`. |
| `src/styles/` | Plain CSS for a few older pages (`WatchPage.css`, `SeasonSelectPage.css`). |
| `public/` | Static files copied as-is (`vite.svg`). |
| `docs/` | This manual, the domain diagram (`dnd_cineweb.drawio`, source of truth for names, and `dnd_cineweb.png`, visual reference) and the screen sketches (`frontend sketch by Cande.drawio.pdf`, 19 pages, in Spanish). |

### 2.2 Important files one by one

**Entry and routing**

| File | Role |
|---|---|
| `index.html` | The single HTML page. Has `<div id="root">` and loads `src/main.tsx`. |
| `src/main.tsx` | Mounts React into `#root`, wrapping `<App />` in `<AuthProvider>` (`main.tsx:9-11`). |
| `src/App.tsx` | Declares every route. Reads the session with `useAuth()` and passes it to the navbar (`App.tsx:21-25`). |
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
| `src/pages/WatchPage.tsx` | Shows one movie and plays it. |
| `src/pages/UploadPage.tsx` | Upload form with a progress bar. |
| `src/pages/UploadSeriesPage.tsx` | Upload a series in three steps (`/upload-series`). Holds the list of series and passes it to the three forms below. |
| `src/components/NewSeriesForm.tsx`, `NewSeasonForm.tsx`, `NewEpisodeForm.tsx` | The three forms of `UploadSeriesPage`: create a series, add a season, upload an episode. |
| `src/pages/MyVideosPage.tsx` | List with edit and delete. |
| `src/pages/SeasonSelectPage.tsx`, `EpisodeListPage.tsx`, `WatchSeriesPage.tsx` | Series screens: seasons of a series, episodes of a season, and the episode player. |
| `src/pages/ReportPage.tsx` | Report a movie or a series (`/report/:type/:id`): reasons + "Other", confirmation, sends the report. |
| `src/components/ReviewButtons.tsx` | Like / dislike buttons with counts for one movie or episode. Props: `type`, `id`. |
| `src/services/reviewService.ts` | `getReviews`, `createReview`, `changeReview`, `deleteReview` (`/api/reviews`). |
| `src/services/reportService.ts` | `reportContent` (`POST /api/reports`) and `isReportTargetType`. |
| `src/pages/ProfilePage.tsx` | `/profile`: edit your account; viewers also see their activity and their appeals. |
| `src/pages/AppealPage.tsx` | `/appeal/:reportId`: appeal a moderation case against your content. |
| `src/services/viewerService.ts` | `getViewerProfile` (`GET /api/viewers/me`). |
| `src/services/appealService.ts` | `createAppeal` (`POST /api/appeals`) and `toAppeal`, which turns `decision` into one `status`. |
| `src/components/Section.tsx` | Horizontal carousel of `CatalogItem` cards, each with a "Movie" or "Series" badge. Props: `title`, `items`. |
| `src/components/SearchBar.tsx` | Search form that navigates to `/search?q=...`. |
| `src/components/LanguagePanel.tsx` | Collapsible panel of language toggles. Currently not used: its imports are commented out in `WatchPage.tsx:4` and `WatchSeriesPage.tsx:2`. |
| `src/types/index.ts` | All types: `Movie`, `MovieDTO`, `Series`, `Season`, `Episode` and their DTOs, `ReportRequest`, `Review`, `Appeal`, `ViewerProfile`, `User`, `LoginRequest`, ... |

### 2.3 How the pieces connect

```
index.html
└── src/main.tsx
    └── <AuthProvider>                     session state (context/AuthProvider.tsx)
        └── <App>                           routes (App.tsx)
            ├── <MainNavbar user onLogout>  reads session through props
            └── <Routes>
                ├── public pages            LandingPage, SearchPage, WatchPage, series pages, AuthPage
                └── <ProtectedRoute allowedRoles={['viewer']}>
                    └── UploadPage, UploadSeriesPage, MyVideosPage, ReportPage, AppealPage
                <ProtectedRoute> (any logged-in user)
                    └── ProfilePage

Pages / components ──useAuth()──▶ AuthContext ◀── AuthProvider
AuthProvider ──▶ authService (Http or Mock) ──▶ backend /auth or localStorage
AuthProvider ──▶ session.ts ──▶ localStorage (cineweb_token, cineweb_user)
Content pages ──▶ movieService.ts ──fetch / XMLHttpRequest──▶ backend /api/movie
Series pages  ──▶ seriesService.ts ──fetch / XMLHttpRequest──▶ backend /api/series, /api/seasons, /api/episodes
(both services use request(), readJson() and uploadWithProgress() from api.ts)
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

Works end to end in the browser using the **mock** backend (`VITE_USE_MOCK_AUTH = true`).
The real HTTP version (`HttpAuthService`) talks to the backend's `/api/users` endpoints. It is
covered by unit tests with a fake `fetch` (`authService.test.ts`).

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

Groups today (`App.tsx`): `allowedRoles={['viewer']}` for `/upload`, `/upload-series`, `/my-videos`,
`/report/:type/:id` and `/appeal/:reportId`, and a group with no `allowedRoles` (any logged-in user)
for `/profile` (`App.tsx:45`).

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

How the messages travel: services throw `ApiError` (`api.ts:20-25`), an `Error` whose message is
already friendly. For content requests, `statusMessage` (`api.ts:12-17`) turns 400, 401 and 403
into "Please check the information you entered.", "Your session has expired. Please log in
again." and "You do not have permission to do that.". A 409 (conflict) shows the backend's own
`message` (`api.ts:52-56`), because those are already readable sentences such as "You have already
reported this content". The page shows `err.message` only when the error is an `ApiError`. Anything else
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
   (`LandingPage.tsx:10`).
2. `useCatalog` (`useCatalog.ts`) runs once on mount. It asks for movies and series at the same
   time with `Promise.allSettled` (`useCatalog.ts:23`), which do `GET /api/movie` and
   `GET /api/series`. Each one is converted into a `CatalogItem` (`{ kind, id, title, category }`)
   by `movieToCatalogItem` or `seriesToCatalogItem` (`catalog.ts:7-18`). `allSettled` (instead of
   `Promise.all`) means that if one list fails, the other one is still shown, with a warning
   (`LandingPage.tsx:19`).
3. `RequestStatus` shows a spinner while loading, a friendly error if nothing loaded, or "There are
   no videos yet." when there is nothing at all.
4. `categoriesOf` (`catalog.ts:31-40`) lists the categories found in the data, once each:
   "Drama", "drama " and "DRAMA" are the same category, because `categoryKey` trims and lowercases
   them (`catalog.ts:20-22`). There is no categories table in the backend: categories are whatever
   uploaders typed.
5. The page shows one link per category, which opens the search filtered by it
   (`LandingPage.tsx:32`), then an "All" carousel and one carousel per category
   (`LandingPage.tsx:39-46`).
6. `Section` is a carousel with left and right arrows that use `scrollBy`
   (`Section.tsx:17-25`). Each card shows a badge from its `kind`, "Movie" or "Series"
   (`Section.tsx:70`), and "See more" goes to `/watch/:id` for a movie or `/series/:id/seasons`
   for a series (`linkTo`, `Section.tsx:11-13`). The React `key` includes the kind, because a movie
   and a series can have the same `id` (`Section.tsx:65`).

### 3.3 Search ✅ ⚠️

1. `SearchBar` is a `<form>`: Enter and the button both run `handleSearch`
   (`SearchBar.tsx:16-21`), which navigates to `/search?q=<text>` (encoded with
   `encodeURIComponent`), or to `/search` when the text is empty.
2. `SearchPage` keeps every filter in the URL: `q` (title text), `type` (`movie` or `series`) and
   `category` (a category key) (`SearchPage.tsx:13-17`). A search can be shared as a link, and
   "Back" returns to the previous filters. `parseCatalogType` ignores an invalid `type` in the URL
   (`catalog.ts:52-54`).
3. It uses the same `useCatalog` hook as the landing page and filters in the browser with
   `filterCatalog` (`SearchPage.tsx:21`, `catalog.ts:42-49`): type, category and title text, all
   ignoring case. The backend has no search endpoint.
4. The two `<select>` (type and category) call `setFilter`, which changes one URL parameter and
   keeps the others (`SearchPage.tsx:24-29`). The page re-renders because the URL changed.
5. The `SearchBar` gets `key={filters.query}` (`SearchPage.tsx:36`), so it starts again with the
   new text when the URL changes.
6. `RequestStatus` handles loading, error and "No videos match this search.".

The filtering functions have unit tests (`catalog.test.ts`).

⚠️ Filtering by director (sketch 2) is not possible: the backend has no director field.

### 3.4 Watching a movie ✅ ⚠️

1. The route `/watch/:id` gives `WatchPage` the `id` through `useParams` (`WatchPage.tsx:14`).
2. A `useEffect` on `[id]` calls `getMovie(id)`. It handles **loading**, **error** and success,
   and ignores answers for an old `id` (`WatchPage.tsx:21-39`). It shows a spinner or a friendly
   error (`WatchPage.tsx:42-51`).
3. The video plays from the backend's static folder, `videoUrl(movie.path)` (`WatchPage.tsx:64`).
   The backend also offers `/api/movie/:id/stream` (1.3), which is not used.
4. If the description is longer than 100 characters, a "See more / See less" button appears.
   `showMoreBtn` is computed from the data, not kept in state (`WatchPage.tsx:54`).
5. `ReviewButtons` shows the likes and dislikes and lets viewers vote (`WatchPage.tsx:77`, see
   3.11).
6. "Report" links to `/report/movie/:id` (`WatchPage.tsx:69`). It is hidden when the logged-in
   user uploaded the movie, because nobody can report their own content.

⚠️ "Add to Watch later" (sketch 3) is ⏳ pending: the backend has no endpoint for it.

### 3.5 Uploading a movie ✅ ⚠️

1. The page is a real `<form>` (`UploadPage.tsx:69`): every field is `required`, so the browser
   checks empty fields and Enter submits.
2. The user picks a file. `handleFileSelect` stores it and uses the file name, without its
   extension, as the default title (`UploadPage.tsx:20-28`).
3. On submit, `handleSubmit` builds `movieData` with the logged-in user's `id` as `id_author` and
   `state: 'active'` (`UploadPage.tsx:30-50`).
4. It calls `uploadMovie` (`UploadPage.tsx:53`, `movieService.ts:49-59`). The service builds a
   `FormData` with two parts, `data` (the JSON text) and `file` (the video), and passes it to
   `uploadWithProgress` (`api.ts:63-86`). That helper sends it with `XMLHttpRequest` instead of
   `fetch`, because `fetch` cannot report upload progress. Each `progress` event updates the
   progress bar (`UploadPage.tsx:122`). The request carries `authHeader()` (`api.ts:83`).
5. On success it clears the form, including the file input with `form.reset()`
   (`UploadPage.tsx:59`), and shows "Your video was uploaded." with a link to "My Videos". On
   failure it shows a friendly error (`UploadPage.tsx:124`).

⚠️ The backend still requires `id_author` (1.3). Remove it once the backend reads the token.

### 3.6 My Videos ✅ ⚠️

1. On mount, it calls `getMovies()` and keeps only the movies whose `id_author` is the logged-in
   user's `id` (`MyVideosPage.tsx:37-43`), because there is no "movies of a user" endpoint.
   `RequestStatus` handles loading, error and "You have no uploaded videos."
   (`MyVideosPage.tsx:157-162`).
2. **Delete:** `deleteVideo` asks for confirmation with `window.confirm`, then calls `deleteMovie`
   and removes the video from the list on success (`MyVideosPage.tsx:54-70`). The backend deletes
   the row (`DELETE FROM movies`), while the sketch describes a logical delete.
3. **Edit:** `startEditing` copies the video into the edit fields (`MyVideosPage.tsx:73-79`).
   `saveEdit` rejects an empty title, calls `updateMovie` and updates the list locally
   (`MyVideosPage.tsx:90-121`). `cancelEditing` clears the fields (`MyVideosPage.tsx:82-87`).
4. Errors from edit or delete are shown above the list (`MyVideosPage.tsx:151-153`). While a video
   is being saved or deleted, its buttons are disabled (`busyVideoId`).

5. **Series:** a second block, "Series", lists the series uploaded by the logged-in user. There is
   no "series of a user" endpoint, so it fetches every series with `getAllSeries()` and keeps the
   ones whose `uploaderId` is the user's `id` (`MyVideosPage.tsx:45-51`). It has its own loading,
   error and "You have no uploaded series." state (`MyVideosPage.tsx:313`), so a failure in one
   block does not hide the other. Each series links to its seasons. Series cannot be edited or
   deleted from here yet.
6. The header has "Upload videos" and "Upload series" buttons (`MyVideosPage.tsx:139`).

⚠️ Movies and series are filtered in the browser, because the backend has no "content of a user"
endpoint. `uploaderId` comes from the backend's `id_author`; the diagram calls it `upladerId`, a typo.

### 3.7 Series: seasons, episodes, watching and uploading ✅ ⚠️

The three pages read from the backend through `seriesService.ts`. Each one follows the same pattern
as `WatchPage`: a `useEffect` that depends on the route params, a `cancelled` flag that ignores
answers for old params, and `RequestStatus` for loading and errors. When a page needs several
things, it asks for them at the same time with `Promise.all`; if any request fails, the page shows
that request's friendly error.

Series are reached from the landing page carousels, where they appear next to the movies with a
"Series" badge (3.2). There is no separate series list page.

**Types.** `Series`, `Season` and `Episode` (`types/index.ts`) are the shapes the pages use. Their
names follow the domain diagram except where it is known to be wrong: `Series` uses `id` (the
diagram says `idSerie`) and `Season` points to its series with `seriesId` (the diagram says
`audiovisualId`). There are no `seasons` / `episodes` arrays: the diagram's arrays are
relationships, and the backend serves them from separate endpoints.

- `SeasonSelectPage` (`/series/:id/seasons`): loads the series and its seasons together
  (`SeasonSelectPage.tsx:28`). The active season is the one picked in either `<select>`, or the
  first one until the user picks (`SeasonSelectPage.tsx:45`). "View Episodes" navigates to that
  season's episode list. With no seasons it shows "This series has no seasons yet."
- `EpisodeListPage` (`/series/:id/season/:seasonId/episodes`): loads the series, the season and its
  episodes (`EpisodeListPage.tsx:25`). Shows "This season has no episodes yet." when the list is
  empty, and always a "See seasons" link back.
- `WatchSeriesPage` (`/watch-series/:id/:seasonId/:episodeId`): loads the series, the season and the
  episode (`WatchSeriesPage.tsx:29`), plays `videoUrl(episode.path)` (`WatchSeriesPage.tsx:54`), and
  links back to the seasons and the episodes.

⚠️ The pages do not check that the season belongs to the series in the URL, or that the episode
belongs to the season: they trust the links.

#### Uploading a series ✅ ⚠️

`UploadSeriesPage` (`/upload-series`, viewers only, linked as "Upload Series" in the avatar menu,
`MainNavbar.tsx:63`) shows three forms side by side on large screens and stacked on phones
(`UploadSeriesPage.tsx:41`). The order matters, because each step needs the one before it.

1. **Loading.** On mount the page calls `getAllSeries()` and keeps only the series whose
   `uploaderId` is the logged-in user's `id` (`UploadSeriesPage.tsx:21-28`). The season and episode
   forms only offer those, so a user cannot add seasons or episodes to someone else's series from
   this page. `RequestStatus` shows a spinner or a friendly error.
2. **New series.** `NewSeriesForm` sends title, category, description and `id_author` with
   `createSeries` (`NewSeriesForm.tsx:28`). On success it clears its fields and calls its
   `onCreated` output prop (`NewSeriesForm.tsx:38`). The page adds the new series to its list
   (`UploadSeriesPage.tsx:44`), so it appears at once in the other two forms.
3. **New season.** `NewSeasonForm` receives the list through its `series` prop. It sends the chosen
   series, the season number and a description with `createSeason` (`NewSeasonForm.tsx:28`). On
   success it suggests the next season number (`NewSeasonForm.tsx:36`) and calls `onCreated`, which
   the page stores as `newestSeason` (`UploadSeriesPage.tsx:46`).
4. **New episode.** `NewEpisodeForm` loads the seasons of the chosen series in a `useEffect` on
   `[seriesId, newestSeason]` (`NewEpisodeForm.tsx:35-54`), so a season added in step 3 shows up
   without reloading. Changing the series clears the chosen season (`NewEpisodeForm.tsx:56-61`). On
   submit it calls `uploadEpisode` with a progress bar (`NewEpisodeForm.tsx:80`), the same way as
   movies (3.5). On success it shows a link to that season's episodes, suggests the next episode
   number and clears the form, including the file input with `form.reset()`
   (`NewEpisodeForm.tsx:89-93`).

All three are real `<form>` elements with `required` inputs, so Enter submits and the browser
checks empty fields. Each form has its own `submitting` (or `uploading`), `error` and success
state.

⚠️ `id_author` is the logged-in user's `id`. With the mock login this is a mock id, which may not
match any user in the backend. Episodes with the same title overwrite each other's video (1.3).
Not tested against a running backend yet.

### 3.8 Report a video ✅

`ReportPage` (`/report/:type/:id`, viewers only) reports a movie (`/report/movie/3`) or a series
(`/report/series/1`). Episodes are reported through their series: the "Report series" button of
`WatchSeriesPage` links to the series (`WatchSeriesPage.tsx:66`). Both "Report" buttons are hidden
for the content's own uploader.

1. The `type` in the URL is checked with `isReportTargetType`; anything else shows "We couldn't
   find that video.". A `useEffect` loads the title with `getMovie` or `getSeries`
   (`ReportPage.tsx:36-56`), so the page says what is being reported.
2. A radio button for each reason in `REPORT_REASONS` (`ReportPage.tsx:111`) and, for "Other", a
   required text area. "Report" stays disabled until a reason is chosen, and "Other" also needs
   text (`canSave`, `ReportPage.tsx:58-59`).
3. Submitting the form only opens a DaisyUI confirmation modal (`ReportPage.tsx:62-65`, `152`).
   "Cancel" closes it and keeps the choices.
4. "Send report" runs `confirmReport` (`ReportPage.tsx:67-85`), which calls `reportContent`
   (`reportService.ts`): `POST /api/reports` with `{ targetType, targetId, reason }` and the token.
   The backend takes the reporter from the token.
5. **Reason.** The backend accepts one free-text `reason` (max 1000 characters). The page sends the
   chosen label, or `Other: <text>` (`ReportPage.tsx:76-78`). Whether reports should use fixed
   reason codes is still an open decision in `CLAUDE.md`.
6. On success it shows "Thanks for your report" and a link back (`ReportPage.tsx:99`). On failure it
   shows the error; a 409 shows the backend's reason ("You have already reported this content",
   "You cannot report your own content", "Content is not active").

`ReportPage.test.tsx` checks the title, the request with an "Other" reason, the backend's 409
message and an invalid type in the URL, with fake services.

Not checked against the running backend: a real report counts toward the 3 reports that open a
moderation case on that content, so it was not sent on a shared database.

### 3.9 Profile, reports received and appeals ✅ ⚠️

**`ProfilePage`** (`/profile`, any logged-in user, "My Profile" in the avatar menu):

1. A form with username, email, first and last name, filled with the current `user`. There is no
   password field. On submit it builds `changes` with only the fields that changed
   (`ProfilePage.tsx:96`) and calls `updateProfile` from `AuthContext` (`ProfilePage.tsx:111`).
   With nothing changed it says "There is nothing to change." and sends nothing.
2. `updateProfile` in `AuthProvider` (`AuthProvider.tsx:56`) calls `authService.updateProfile`,
   saves the returned user in localStorage and updates the state, so the navbar greeting changes
   at once. `HttpAuthService.updateProfile` (`authService.ts:111`) sends `PATCH /api/users/me` with
   the fields in snake_case. The mock (`mockAuthService.ts`) updates its saved account. A 409 shows
   the backend's message ("Email is already in use").
3. For viewers only, `ViewerActivity` (`ProfilePage.tsx:23`) loads `GET /api/viewers/me` with
   `getViewerProfile` and shows: uploaded videos (movies and episodes), ratings given, **reports
   received** on their content (a count computed by the backend), and **My appeals**, each with its
   case number and status.

**Appeal status.** The backend sends `reviewed` and `decision`, which say the same thing twice.
`toAppeal` (`appealService.ts`) keeps one `status`: `'pending'` while `decision` is `null`, else
`'approved'` or `'rejected'`. The profile shows them as "Waiting for review", "Accepted: your
content stays online" and "Rejected: your content was suspended".

**`AppealPage`** (`/appeal/:reportId`, viewers only): a text area (required, max 2000 characters,
with a counter). It sends `POST /api/appeals` with `{ reportId, description }` through
`createAppeal`. The backend checks with the token that the user owns the content. A 409 shows its
reason ("An appeal already exists for this report", "Only the content owner can appeal this
report"). On success it links to the profile.

⚠️ **The appeal form cannot be reached from the app yet.** An appeal needs the moderation case id,
and the backend only tells a viewer *how many* reports they received, not which cases are open
(1.4, point 6). Until that endpoint exists, `/appeal/:reportId` only works by typing the case
number in the URL.

The old `ComplaintPage` (hardcoded "Received Complaints") and its CSS were removed.

### 3.10 Administrator screens ⏳

None of them exist yet: admin landing page, pending appeals and appeal history (sketches A, B, C).
When they are built, they should go in a new route group wrapped in
`<ProtectedRoute allowedRoles={['administrator']}>`.

---

### 3.11 Reviews: like / dislike ✅ ⚠️

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
4. `vote(rating)` (`ReviewButtons.tsx:48`) decides what to send:

   | Situation | Request | Result |
   |---|---|---|
   | No vote yet | `POST /api/reviews` with `rating` | New vote |
   | Clicking the same vote again | `DELETE /api/reviews/:id` | Vote withdrawn (sketch 6) |
   | Clicking the other vote | `PATCH /api/reviews/:id` with the new `rating` | Like ↔ dislike |

   After each answer it updates the list locally, so the counts change without reloading.
5. Errors are shown under the buttons; a 409 ("Viewer already reviewed this audiovisual") shows the
   backend's message.

`ReviewButtons.test.tsx` checks the counts, voting, withdrawing, changing and the guest view.

⚠️ The backend takes `viewerId` from the request body and does not check the token on
`/api/reviews`, so the frontend sends the user's `id` (marked with a TODO) and anyone could vote,
change or delete reviews in someone else's name by hand (1.4).

## 4. Design decisions and trade-offs

### 4.1 Fake backend behind an interface (Strategy pattern)

**What:** `AuthService` is an interface with two implementations, `HttpAuthService` and
`MockAuthService`. A single line chooses one from `.env` (`authService.ts:134-136`).

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
  something that changes rarely, like login and logout. `useMemo` (`AuthProvider.tsx:46-63`) makes
  sure the value only changes when `user` changes.
- The context, the provider and the hook are in three files (`AuthContext.ts`, `AuthProvider.tsx`,
  `useAuth.ts`). This keeps the project's ESLint `react-refresh` rule happy, because that rule wants
  `.tsx` files to export only components.

### 4.3 Token and user in localStorage

**What:** `cineweb_token` and `cineweb_user` are saved in localStorage (`session.ts`), as agreed with
the backend team.

**Why:** it is simple, survives reloads, and works with a `Bearer` header (`authHeader()`,
`api.ts:33-36`).

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

The login form reads its values with `FormData` on submit (`AuthPage.tsx:27-28`) instead of
keeping every keystroke in `useState`. This follows the project rule that the password only
exists in `LoginRequest` / `RegisterRequest`, never in state.
Trade-off: there is no live validation as the user types (for example "password too short"). It
relies on HTML validation (`required`, `type="email"`).

### 4.6 Route protection with a layout route

`ProtectedRoute` renders `<Outlet />` and wraps a group of routes (`App.tsx:36-42`), instead of
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
- Authentication (`mockAuthService.ts`), while `VITE_USE_MOCK_AUTH = true`.
- Uploader id: movies, series and episodes send the logged-in user's id as `id_author`. With the
  mock login it is a mock id that may not exist in the backend.
- Navbar avatar: a fixed DaisyUI sample image (`MainNavbar.tsx:49-51`).

**What is not tested**
- Unit tests cover `ProtectedRoute`, `AuthPage`, `AuthProvider` (session check on startup) and
  `HttpAuthService` (login, sign-up, logout, current user) (5.2). There is no end-to-end test yet.
- The user system was checked with `tsc -b` and `pnpm build`, both passing. It was **not**
  tested by clicking through the browser before this manual was written.
- `HttpAuthService` is covered by unit tests with a fake `fetch` (`authService.test.ts`), and its
  requests were checked against the running backend with `curl` (3.1). The login, sign-up and
  logout screens were not clicked through in the browser with the real backend yet.
- The movie pages were not tested against the backend. The local backend copy now exposes the
  movie endpoints (1.3), so they can be tested by running it.
- The series pages, the series upload page and the series block of "My Videos" were checked with
  `tsc -b`, `pnpm lint`, `pnpm test` and `pnpm build` only. They were not run against a backend.

**Known security risks**
- Token in localStorage, readable by any script on the page (4.3).
- The role shown in the frontend can be changed by the user. The backend must enforce permissions.
- A token that expires while the app is open is only noticed on the next reload (4.3). Logging out
  revokes the token on the server (3.1).
- Mock passwords in plain text in localStorage (development only).
- Upload, edit and delete requests send the token (`movieService.ts:40`, `47`, `api.ts:83`), but the
  backend does not check it yet, so today it cannot know who makes them.
- No backend authorization exists yet on any endpoint. For example, `UploadSeriesPage` only offers
  the user's own series, but a request sent by hand can add a season or an episode to any series
  (1.4).

### 4.9 Known issues and technical debt

| Issue | Where |
|---|---|
| Movies, series and episodes send the logged-in user's id as `id_author`, against the agreed contract. | `UploadSeriesPage.tsx:43`, `47` |
| Uploaded episodes with the same title overwrite each other's video (backend file naming). | `POST /api/episodes` (1.3) |
| Series cannot be edited or deleted from "My Videos" (the backend has `PATCH` / `DELETE /api/series/:id`). The sketch asks for a logical delete. | `MyVideosPage.tsx` |
| "My Videos" does not show season, episode, duration, subtitles or audio, as the sketch does. The backend has no duration, subtitle or audio fields. | `MyVideosPage.tsx` |
| Any user can add seasons or episodes to someone else's series, or edit and delete any content, by sending the request by hand. The frontend only hides other users' series; the backend must check ownership (1.4). | `UploadSeriesPage.tsx:21-28` |
| A 403 (forbidden) answer would show the generic "Something went wrong" message, because no friendly message is mapped for it yet. | `api.ts:52`, `api.ts:78` |
| The series pages do not check that the season belongs to the series in the URL, or the episode to the season. | `EpisodeListPage.tsx`, `WatchSeriesPage.tsx` |
| Custom CSS files instead of DaisyUI classes in the watch and season pages. | `src/styles/` |
| A viewer cannot see which moderation cases are open against their content, so the appeal form is only reachable by typing its URL. Needs a backend endpoint (1.4). | `AppealPage.tsx` |
| Both `pnpm-lock.yaml` and `package-lock.json` exist, but the project uses pnpm only. | repo root |
| `.env` has a `VITE_API_URL_HOST` variable that no code reads and `vite-env.d.ts` does not declare. | `.env` |

---

## 5. Course requirements compliance

Requirements set by the course for regularity and approval. Status: ✅ Met · 🟡 Partial · ❌ Pending.

### 5.1 Regularity

| Requirement | Where in the code | Status |
|---|---|---|
| Handle user events (click, input...) | `AuthPage.tsx` (`onSubmit`, `toggleMode`), `SearchBar.tsx` (`onSubmit`, `onChange`), `SearchPage.tsx` filters (`onChange`), `UploadPage.tsx` (`onSubmit`, `onChange`), `MyVideosPage.tsx` (edit/delete buttons), the series upload forms (`onSubmit`, `onChange`) | ✅ |
| Handle errors in a user-friendly way | `AuthPage` + `authService.ts`; content pages through `movieService.ts` (`ApiError`) + `errorMessage()` (`api.ts:28-30`), shown by `RequestStatus` or alerts in `WatchPage`, `UploadPage`, `MyVideosPage` | ✅ |
| React to state changes | `SearchPage.tsx` (re-filters when the URL changes), `WatchPage.tsx:21` (`[id]`), the series pages (effects on their route params), `AuthPage.tsx:19-22` (redirect when `user` changes), `MainNavbar` (guest vs user) | ✅ |
| Use input props | `Section` (`title`, `items`), `MainNavbar` (`user`), `ProtectedRoute` (`allowedRoles`), `AuthProvider` (`children`), `RequestStatus`, `SearchBar` (`initialText`) | ✅ |
| Use output props | `MainNavbar` `onLogout` (`MainNavbar.tsx:7`, `App.tsx:25`), `NewSeriesForm` and `NewSeasonForm` `onCreated` (`UploadSeriesPage.tsx:44`, `46`) | ✅ |
| At least one service | `src/services/authService.ts`, `src/services/movieService.ts`, `src/services/seriesService.ts` (+ `session.ts`, `api.ts`) | ✅ |
| Model API data with interfaces/types | `src/types/index.ts` (`MovieDTO`, `MovieUpdate`, `MovieUploadData`, `SeriesDTO`, `SeasonDTO`, `EpisodeDTO`, `User`, `LoginRequest`, `AuthResponse`, ...) | ✅ |
| Apply an OOP design pattern | Strategy: `AuthService` interface with `HttpAuthService` and `MockAuthService` classes (`authService.ts`, `mockAuthService.ts`). Adapter: `HttpAuthService` translates the backend's user API into the app's types (4.1) | ✅ |
| Dependencies registered in `package.json` | `package.json` lists React, React Router, Tailwind, DaisyUI, Vite, TypeScript, ESLint. A stray `package-lock.json` exists next to `pnpm-lock.yaml` | ✅ |

### 5.2 Approval

| Requirement | Where in the code | Status |
|---|---|---|
| At least one component unit test | Vitest + Testing Library, run with `pnpm test`. `ProtectedRoute.test.tsx` (guest → `/login`, wrong role → `/`, allowed role sees the page) and `AuthPage.test.tsx` (sends the login request, friendly and generic error messages, switch to sign up). Both give the component a fake `AuthContext` value, so they do not use the mock service or localStorage. `authService.test.ts` tests `HttpAuthService` with a fake `fetch`: URLs, snake_case bodies, the conversion to `User`, the login after sign-up, the friendly errors, the logout request and `/api/users/me`. `AuthProvider.test.tsx` checks the session check on startup with a fake `authService`: invalid token → logged out, valid token → fresh user data, server down → session kept | ✅ |
| At least one end-to-end test | None | ❌ |
| Login, with access protected by the backend's user levels via `ProtectedRoute` | Frontend side done: `ProtectedRoute.tsx`, `AuthPage.tsx`, `AuthProvider.tsx`, roles `administrator` / `viewer` in `types/index.ts:92`. But the user levels come from the **mock**, because the backend has no auth, and no admin routes exist yet | 🟡 |
| Environments defined with `.env` | `.env` (git-ignored), `.env.example`, `VITE_API_URL`, `VITE_USE_MOCK_AUTH`, typed in `vite-env.d.ts`. There is one environment, with no separate development/production files | ✅ |

---

## 6. Glossary

**API / endpoint** — The set of URLs a server answers. An endpoint is one of them, such as
`POST /api/users/login`.

**Async / await, Promise** — A Promise is a value that will be ready later, like a server
response. `await` pauses an `async` function until the Promise is ready. `.then()` does the same
with callbacks (`LandingPage.tsx` explains it in its bottom comment).

**Bearer token / Authorization header** — How a request proves who is sending it: the header
`Authorization: Bearer <token>`. Built by `authHeader()` (`api.ts:33`).

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
