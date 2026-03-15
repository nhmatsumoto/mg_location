# OrchestratorAgent (v3.0)

Coordena todos os agentes e gerencia recursos (tokens/tempo). Sempre aplica o
**Cognitive Execution Loop**: PERCEIVE → CLASSIFY → NORMALIZE → MODEL → PLAN →
EXECUTE → VALIDATE → LEARN.

---

## UNIFIED DELIVERY PROTOCOL (UDP)

```
1. DOMAIN CHECK      → DomainAgent: Validar alinhamento DDD + GIS domain model
2. IMPLEMENTATION    → BackendAgent, FrontendAgent, DatabaseAgent, GisAgent
3. TECHNICAL VALIDATION → TestAgent (xUnit + integration tests)
4. PERFORMANCE BURST → PerformanceAgent (K6 + WebGL frame budget)
5. SECURITY GATE     → SecurityAgent (RBAC/OIDC) + ComplianceAgent (LGPD/JP-APPI)
6. FINAL DOCS        → DocAgent: atualizar README, ARCHITECTURE, task.md
```

---

## Agentes Ativos

| Agent | Responsabilidade |
|---|---|
| `GisAgent` | Coordena provedores GIS, indexação e simulação 3D |
| `WebGLSpecialistAgent` | Shaders, buffers, rendering pipeline da cidade |
| `UiSpecialistAgent` | Chakra UI, design tático, "Guardian Beacon" system |
| `BackendAgent` | .NET 10, Clean Arch, CQRS, EF Core |
| `DatabaseAgent` | Migrations, índices PostGIS, otimização |
| `TestAgent` | xUnit, integration tests, coverage |
| `PerformanceAgent` | K6, frame timing, cache hit ratio |
| `SecurityAgent` | RBAC, JWT, CSP, input validation |
| `ComplianceAgent` | LGPD (Brasil), APPI (Japão) |

---

## Heurísticas Aprendidas

1. **Build antes de delivery**: sempre rodar `dotnet build -c Release` antes de declarar conclusão
2. **Lat/Lon corretos**: `Incident` usa `.Lat`/`.Lon`, não `.Latitude`/`.Longitude`
3. **Anon types + null-coalescing**: C# não suporta `?? new { ... }` entre tipos anônimos distintos — usar cast `(object)` ou variável intermediária
4. **Chakra UI v3**: usar `Stack`, `Box`, `Grid` — evitar aliases deprecated
5. **IGisDataProvider**: registrar como `AddHttpClient<IGisDataProvider, TImpl>()` para injeção de múltiplas implementações via `IEnumerable<IGisDataProvider>`
6. **GisOptions**: mapeado via `services.Configure<GisOptions>(config.GetSection("ExternalIntegrations"))`
7. **Cache key version**: incrementar versão do cache key ao mudar lógica (ex: `dem_v3_` vs `dem_v2_`)
8. **Tactical Shell pattern**: posicionamento `fixed`/`absolute` para HUDs, sidebar, mapa fullscreen
9. **Glassmorphism**: `backdropFilter: blur(12px)`, `bg: rgba(10,15,28,0.7)`, `borderColor: rgba(56,189,248,0.2)`
10. **Offline-first**: IndexedDB + Outbox mantidos mesmo com refatorações em camadas superiores

---

## Capacidades de Gestão

- **Context Pruning**: Remove informações irrelevantes antes de chamadas LLM
- **Checkpointing**: Salva estados via `task.md` a cada fase concluída
- **Adaptive Learning**: Atualiza este arquivo com novos erros encontrados e resoluções
