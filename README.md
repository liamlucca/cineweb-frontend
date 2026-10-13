# CineWeb — Frontend

A movie and series platform: viewers upload, watch, rate and report content, and administrators
moderate reports and appeals. Course project for Desarrollo de Software (DSW).

## Team

| Role | Member |
|-----|-------------|
| Design (draw.io) / Frontend | Requelme, Candela M — [See the design](https://app.diagrams.net/#G1eFO_b5KQ9T8M1xZn47CeNbCgubCR8u94) |
| Frontend | Lucca, Liam Santiago — [See the repository](https://github.com/liamlucca/cineweb-frontend) |
| Backend | Marino, Eduardo — [See the repository](https://github.com/EduardoMarino73/TP-BackEnd) |

> The roles are not strict. Any member can contribute to any area of the project when the team needs it.

## Technologies

- **React 18** with **TypeScript** and **Vite 5**
- **Tailwind CSS** + **DaisyUI** (`night` theme), mobile-first
- **React Router** — navigation between pages
- **Vitest** + **Testing Library** — unit tests
- **pnpm** — package manager

## Quick start

Requirements: Node.js 20+, pnpm and the [backend](https://github.com/EduardoMarino73/TP-BackEnd) running at `http://localhost:3000`.

```bash
git clone https://github.com/liamlucca/cineweb-frontend
cd cineweb-frontend
pnpm install
cp .env.example .env    # VITE_API_URL and VITE_USE_MOCK_AUTH
pnpm dev                # http://localhost:5173
```

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Type check and production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests |

## Pages

| Route | Page | Who |
|------|--------|-------|
| `/` | Home: featured item and carousels by category | everyone |
| `/search` | Search by title, type and category | everyone |
| `/watch/:id` | Movie: player, ratings, "Watch later", report | everyone |
| `/series/:id/seasons` | Series: seasons and episodes | everyone |
| `/series/:id/season/:seasonId/episodes` | Episodes of a season | everyone |
| `/watch-series/:id/:seasonId/:episodeId` | Episode | everyone |
| `/login` | Log in / sign up | everyone |
| `/upload`, `/upload-series` | Upload a movie / series (with an automatic thumbnail) | viewer |
| `/my-videos` | My videos: edit and delete movies, series, seasons and episodes | viewer |
| `/watch-later` | "Watch later" list | viewer |
| `/report/:type/:id` | Report a video | viewer |
| `/appeal/:reportId` | Appeal a report about my content | viewer |
| `/profile` | Profile, activity and reports about my content | logged-in user |
| `/admin`, `/admin/reports/:id` | Appeals, reports, report reasons and accounts | administrator |

## Documentation

All the documentation is in [docs/](docs/README.md): proposal, PRs, progress minutes, tracking, the
code manual and the domain model.
