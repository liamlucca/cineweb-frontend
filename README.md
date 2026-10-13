# CineWeb — Frontend

Plataforma de películas y series: los espectadores suben, miran, valoran y denuncian contenido, y
los administradores moderan las denuncias y las apelaciones. Trabajo práctico de Desarrollo de
Software (DSW).

## Equipo

| Rol | Responsable |
|-----|-------------|
| Diseño (draw.io) | Requelme, Candela M — [Ver diseño](https://app.diagrams.net/#G1eFO_b5KQ9T8M1xZn47CeNbCgubCR8u94) |
| Frontend | Lucca, Liam Santiago — [Ver repositorio](https://github.com/liamlucca/cineweb-frontend) |
| Backend | Marino, Eduardo — [Ver repositorio](https://github.com/EduardoMarino73/TP-BackEnd) |

> Los roles no son estrictos. Cualquier integrante puede contribuir en cualquier área del proyecto según lo necesite el equipo.

## Tecnologías

- **React 18** con **TypeScript** y **Vite 5**
- **Tailwind CSS** + **DaisyUI** (tema `night`), mobile-first
- **React Router** — navegación entre páginas
- **Vitest** + **Testing Library** — tests unitarios
- **pnpm** — gestor de paquetes

## Puesta en marcha rápida

Requisitos: Node.js 20+, pnpm y el [backend](https://github.com/EduardoMarino73/TP-BackEnd) corriendo en `http://localhost:3000`.

```bash
git clone https://github.com/liamlucca/cineweb-frontend
cd cineweb-frontend
pnpm install
cp .env.example .env    # VITE_API_URL y VITE_USE_MOCK_AUTH
pnpm dev                # http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Chequeo de tipos y build de producción |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests unitarios |

## Páginas

| Ruta | Página | Quién |
|------|--------|-------|
| `/` | Inicio: destacado y carruseles por categoría | todos |
| `/search` | Búsqueda por título, tipo y categoría | todos |
| `/watch/:id` | Película: reproductor, valoraciones, "Ver más tarde", denunciar | todos |
| `/series/:id/seasons` | Serie: temporadas y episodios | todos |
| `/series/:id/season/:seasonId/episodes` | Episodios de una temporada | todos |
| `/watch-series/:id/:seasonId/:episodeId` | Episodio | todos |
| `/login` | Ingresar / registrarse | todos |
| `/upload`, `/upload-series` | Subir película / serie (con miniatura automática) | espectador |
| `/my-videos` | Mis videos: editar y borrar películas, series, temporadas y episodios | espectador |
| `/watch-later` | Lista "Ver más tarde" | espectador |
| `/report/:type/:id` | Denunciar un video | espectador |
| `/appeal/:reportId` | Apelar una denuncia sobre mi contenido | espectador |
| `/profile` | Perfil, actividad y denuncias sobre mi contenido | usuario logueado |
| `/admin`, `/admin/reports/:id` | Apelaciones, denuncias, motivos de denuncia y cuentas | administrador |

## Documentación

Toda la documentación está en [docs/](docs/README.md): propuesta, PR, minutas, tracking, el manual
del código y el modelo de dominio.
