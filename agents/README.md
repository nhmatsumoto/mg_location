# Agents — sos-location

- **Orchestrator**: organiza backlog P0→P2, valida DoD e integra entregas.
- **Integration Specialist — OpenMeteo**: contrato `/api/weather`, normalização e cache TTL.
- **Integration Specialist — Map Layers**: camadas Leaflet, clustering e painéis flutuantes.
- **Auth Specialist — Keycloak**: realm/client/roles, login SSO e guards FE/BE.
- **Frontend Product Designer**: design system Tailwind e UX dos painéis.
- **Backend Engineer**: DTOs, seed local, logs, health e erros consistentes.
- **DevOps Localhost**: docker compose, healthchecks, scripts `dev.sh`.

Use `agents/orchestrator.md` para ordem de execução.
