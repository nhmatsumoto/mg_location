# Plano de Implementação (KANBAN)

## P0
- [x] Auditoria localhost e mapa de problemas.
- [x] CORS/proxy: suporte `API_CORS_ORIGINS` e validação por curl.
- [x] Backend seed para evitar tela zerada silenciosa.
- [x] Frontend: estados loading/empty/error + last updated no Command Center.
- [x] Rotas públicas/privadas + login local/SSO CTA.

## P1
- [x] Endpoint simplificado `/api/weather` para widget por clique no mapa.
- [ ] Melhorias avançadas de painel dock/undock e filtros por data severidade.
- [ ] Clustering e otimizações de render em datasets maiores.

## P2
- [ ] Módulo 3D isolado por feature flag.
- [ ] OpenTelemetry local opcional.

## Dependências
- Docker e Keycloak locais para fluxo SSO completo.
- Seeds carregadas no backend para snapshots realistas.
