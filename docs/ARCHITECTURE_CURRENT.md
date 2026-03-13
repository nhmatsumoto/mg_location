# Architecture SOS Location (v2.1)

## Stack
- **Backend**: ASP.NET Core 10 (C#), EF Core, Npgsql, PostgreSQL.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind + **@react-three/fiber** (Three.js) + Zustand.
- **Rendering**: **Mixed Map System** (2D Tactical Leaflet + 3D Minecraft-style Center).
- **SOS Hero**: Interactive component (Pegman) with Drag & Drop functionality and store-based coordinate sync.

## Entrypoints
- **Backend**: `SOSLocation.API/Program.cs`, `Controllers/*.cs`.
- **Frontend**: `frontend-react/src/main.tsx`.
- **Tactical 2D**: `SOSPage.tsx` using specialized disaster tools HUD.
- **Tactical 3D**: `Tactical3DMap.tsx` with `useChunkManager`.

## Dynamic Rendering Strategy
The map is divided into 500m chunks. The `useChunkManager` monitors the **SOS Hero** position and loads chunks in a 3x3 grid. Each chunk fetches its own GIS data (terrain, buildings, roads) via `gisApi`.

## Auth & Security
- **Identity**: Keycloak (OIDC) for centralized identity management.
- **Authorization**: Role-based access control (RBAC) via JWT claims.
- **Resilience**: PWA with IndexedDB for offline-first capabilities.
