# Heuristics Memory — SOS Location (v3.0)

> **Auto-updated** by OrchestratorAgent. Each entry is a learned behavior.
> Format: `PATTERN | TRIGGER | RESOLUTION | CONFIDENCE`

---

## Backend (.NET 10)

| Pattern | Trigger | Resolution | Confidence |
|---|---|---|---|
| `Incident.Lat/Lon` | CS1061 Latitude/Longitude not found | Use `.Lat` `.Lon` — `Incident.cs` uses abbreviated names | HIGH |
| `(object)` cast for anon types | CS0019 `??` between anon types | Cast first: `return (object)new { ... }` or use temp var | HIGH |
| `IGisDataProvider` DI | Multiple AddHttpClient registrations | Use `IEnumerable<IGisDataProvider>` in constructor, resolve with `.OfType<T>()` | HIGH |
| `IOptions<GisOptions>` | Direct config access pattern | Register: `services.Configure<GisOptions>(config.GetSection("ExternalIntegrations"))` | HIGH |
| Cache key versioning | Changed logic breaks cached data | Increment suffix: `dem_v3_` → `dem_v4_` | MEDIUM |
| `BackgroundService` DI scope | Cannot inject `Scoped` services directly | Use `IServiceProvider.CreateScope()` inside `ExecuteAsync` | HIGH |

---

## Frontend (React 19 + Chakra UI)

| Pattern | Trigger | Resolution | Confidence |
|---|---|---|---|
| `fontWeight="black"` | Invalid prop `fontBlack` | Use string value `"black"` not boolean prop | HIGH |
| `Circle` from Chakra | Import error | Use `Box borderRadius="full"` instead | HIGH |
| `useNavigate` source | Wrong import | Always from `react-router-dom` | HIGH |
| `useAuthStore` path | Import conflict | Always `../../store/authStore` | HIGH |
| Tailwind vs Chakra | Mixed styling causes build failure | Use Chakra UI exclusively; remove any leftover TW classes | HIGH |
| `SimpleGrid` columns | Missing prop causes layout failure | Always specify `columns={{ base: 1, md: 2, lg: 3 }}` | MEDIUM |

---

## Docker / Infrastructure

| Pattern | Trigger | Resolution | Confidence |
|---|---|---|---|
| ENV var naming | .NET config `__` separator | Docker env: `Section__Key=value` → `config["Section:Key"]` | HIGH |
| Postgres healthcheck | Service depends on db | `condition: service_healthy` + `pg_isready` test | HIGH |
| Backend startup | DB not ready | Add `depends_on: postgres: condition: service_healthy` | HIGH |

---

## GIS / City-Scale Simulation

| Pattern | Trigger | Resolution | Confidence |
|---|---|---|---|
| Overpass timeout | Large bbox query fails | Add `[timeout:30]` in query; fallback synthetic | HIGH |
| DEM fallback | OpenTopography API unavailable | `GenerateSyntheticTerrain()` with seeded Random (lat*400+lon*400) | HIGH |
| Bbox offset for indexing | Need region around incident point | Use `offset = 0.005` degrees (~500m) | MEDIUM |
| Cache warm vs cold | First render slow if no cache | `GisIndexerService` pre-warms cache every 30 min | HIGH |
| Provider health check | Settings page needs status | Implement `CheckHealthAsync()` in every IGisDataProvider | HIGH |

---

## Design System

| Token | Value |
|---|---|
| Background | `#030712` / `void.950` |
| Surface | `#0a0f1c` / `void.900` |
| Primary accent | `#22d3ee` / `cyan.400` |
| Warning | `#fbbf24` / `amber.400` |
| Critical | `#f43f5e` / `rose.500` |
| Glassmorphism border | `rgba(56, 189, 248, 0.2)` |
| Glassmorphism bg | `rgba(10, 15, 28, 0.7)` |
| Blur | `backdrop-filter: blur(12px)` |
