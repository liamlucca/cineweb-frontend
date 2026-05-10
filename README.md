# CineWeb — Frontend

Plataforma de películas donde los usuarios pueden subir y reproducir contenido

## Equipo

| Rol | Responsable |
|-----|-------------|
| Diseño (draw.io) | Requelme, Candela M — [Ver diseño](https://app.diagrams.net/#G1eFO_b5KQ9T8M1xZn47CeNbCgubCR8u94) |
| Frontend | Lucca, Liam Santiago — [Ver repositorio](https://github.com/liamlucca/cineweb-frontend) |
| Backend | Marino, Eduardo — [Ver repositorio](https://github.com/EduardoMarino73/TP-BackEnd) |

> Los roles no son estrictos. Cualquier integrante puede contribuir en cualquier área del proyecto según lo necesite el equipo.

## Tecnologías

- **React** con **TypeScript**
- **Vite 5** 
- **Tailwind CSS**
- **DaisyUI**
- **React Router** — navegación entre páginas
- **pnpm** — gestor de paquetes

## Requisitos previos

- Node.js
- pnpm instalado globalmente

```bash
npm install -g pnpm
```

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/liamlucca/cineweb-frontend
cd cineweb-frontend

# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev
```

El frontend se inicia en `http://localhost:5173`

El backend debe iniciarse en `http://localhost:3000` ya que el frontend realiza llamadas a la API en esa dirección (por ahora).

## Páginas actuales

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | LandingPage | Listado de películas |
| `/subir` | UploadPage | Formulario para subir una película |

