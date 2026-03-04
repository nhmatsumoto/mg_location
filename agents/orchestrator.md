# Orchestrator Flow

1. Auditoria local e mapa de problemas (`docs/STATUS_LOCALHOST.md`).
2. Correções de conectividade (CORS/proxy/env).
3. Estabilização backend (logs, seeds, endpoints sem retorno silencioso zerado).
4. Fluxo de autenticação (login, rotas públicas/privadas, integração Keycloak).
5. UX operacional (mapa com camadas, painéis e filtros).
6. DX local (scripts, compose e troubleshooting).

Checklist DoD:
- Endpoints principais com dados em localhost.
- Estado de loading/empty/error no FE.
- Login e separação de rotas públicas/autenticadas.
- documentação atualizada.
