# Project Memory — SOS Location (v3.0)

> Current state of the project for fast context restoration.
> Updated: 2026-03-15

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | .NET 10 (ASP.NET Core), EF Core 10, Dapper, MediatR, SignalR, FluentValidation |
| Auth | Keycloak 26 (OIDC/JWT), RBAC |
| Frontend | React 19, Vite, Chakra UI v3, Zustand, React Leaflet |
| Map | Leaflet 2D + WebGL 2.0 renderer (3D terrain, buildings, climate) |
| DB | PostgreSQL 15 + PostGIS |
| ML | Python FastAPI (risk-analysis-unit) |
| Infra | Docker Compose, Nginx (frontend), Dozzle (logs) |

---

## Active Domain Model

### GeoPoint (City-Scale)
```
GeoPoint → SoilInfo, ClimateInfo, TopoInfo, UrbanInfo
UrbanInfo → BuildingData[], InfrastructureData[], VegetationData[]
```

### GIS Service Architecture
```
GisService (facade) → IGisDataProvider[]
  ├── OpenTopographyProvider  (elevation DEM)
  ├── OverpassProvider        (buildings, roads, vegetation)
  └── OpenMeteoProvider       (climate)
GisIndexerService (BackgroundService @ 30min intervals)
GisOptions (IOptions<> → appsettings ExternalIntegrations section)
```

---

## Key File Locations

| Purpose | File |
|---|---|
| GIS Facade | `SOSLocation.Infrastructure/Services/Gis/GisService.cs` |
| GIS Options | `SOSLocation.Infrastructure/Services/Gis/GisOptions.cs` |
| GIS Indexer | `SOSLocation.Infrastructure/Services/Gis/GisIndexerService.cs` |
| Providers | `SOSLocation.Infrastructure/Services/Gis/Providers/` |
| Domain GeoPoint | `SOSLocation.Domain/Entities/Geospatial/GeoPoint.cs` |
| DI Registration | `SOSLocation.API/Extensions/DependencyInjectionExtensions.cs` |
| Incident entity | `SOSLocation.Domain/Incidents/Incident.cs` (uses `.Lat`/`.Lon`) |
| Auth store (FE) | `frontend-react/src/store/authStore.ts` |
| Theme | `frontend-react/src/theme.ts` |
| Sidebar | `frontend-react/src/components/layout/Sidebar.tsx` |
| HUD | `frontend-react/src/components/ui/SOSHeaderHUD.tsx` |
| Missions | `frontend-react/src/components/gamification/MissionsPanel.tsx` |

---

## Completed Phases

- [x] Phase 1-4: Core DDD backend + React frontend
- [x] Phase 5: WebGL GIS Simulation engine
- [x] Phase 6: Design system "Guardian Beacon"
- [x] Phase 7: Tactical Shell layout standardization (SOS, Simulations, Settings, Global Disasters, Transparency)
- [x] Phase 7b: Login/logout HUD, MissionsPanel refactor
- [x] Phase 8: GIS/Climate Infrastructure Refactor (modular providers, GisIndexerService)

## Current Phase
- City-Scale 3D Simulation — data sourcing and rendering implementation

## Next Steps
- Frontend: Connect simulation page to real GIS data via `/api/gis/*` endpoints
- Backend: Implement `GisController` endpoints for terrain, buildings, climate
- Backend: Build `SoilProvider` and `IBGECadastroProvider`
- WebGL: Implement `TerrainRenderer` and `BuildingRenderer` shaders
- Infra: Add `GIS_TILE_SERVER` (pmtiles or tegola) to docker-compose
