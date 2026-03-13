# MG Location — Crisis Backlog

Gerado automaticamente por scripts/bootstrap_backlog.sh.

## Critérios de priorização
1. **P0**: resgate/coordenação em campo + prevenção de downtime.
2. **P1**: confiabilidade, escala e qualidade operacional.
3. **P2**: integrações gov e expansão de dados.
4. **P3**: melhorias UX não-críticas.

## Findings automáticos do repositório
- TODOs encontrados: 0
- FIXMEs encontrados: 0
- Referências a baseURL/portas no frontend: 0
- Endpoint /api/health implementado: sim (v2.0)

## TODO list por prioridade
### P0
- [x] **[P0]** Disponibilidade da API e readiness/healthchecks
- [x] **[P0]** Padronizar CORS/proxy dev para frontend em localhost:8088
- [x] **[P0]** Estabilizar endpoint /api/alerts _(area:datahub | crisis:High | status:Done)_
- [ ] **[P0]** Validar /api/missing-persons para busca de desaparecidos _(area:operational | crisis:Critical | status:Backlog)_
- [ ] **[P0]** Validar /api/hotspots para áreas críticas _(area:operational | crisis:High | status:Backlog)_
- [ ] **[P0]** Validar /api/rescue-support para suporte de resgate _(area:operational | crisis:Critical | status:Backlog)_
- [ ] **[P0]** Publicar /api/risk-areas e /api/searched-areas _(area:operational | crisis:High | status:Backlog)_
- [x] **[P0]** Validar /api/weather/forecast no fluxo operacional _(area:datahub | crisis:High | status:Done)_

### P1
- [ ] **[P1]** Implementar caching em endpoints críticos _(area:infra | crisis:High | status:Backlog)_
- [ ] **[P1]** Aplicar rate limiting e retries/backoff _(area:infra | crisis:High | status:Backlog)_
- [ ] **[P1]** Observabilidade com logs estruturados e métricas _(area:backend | crisis:Medium | status:Backlog)_
- [ ] **[P1]** Validação estrita de payloads _(area:backend | crisis:Medium | status:Backlog)_
- [ ] **[P1]** Ampliar cobertura de testes automatizados _(area:backend | crisis:Medium | status:Backlog)_

### P2
- [ ] **[P2]** Expandir /api/transparency/transfers e /api/transparency/search _(area:datahub | crisis:Medium | status:Backlog)_
- [ ] **[P2]** Expandir /api/satellite/layers /stac/search /goes/recent _(area:datahub | crisis:Medium | status:Backlog)_

### P3
- [x] **[P3]** Melhorar filtros e UX de busca no mapa _(area:frontend | crisis:Low | status:Done)_
- [ ] **[P3]** Otimizar performance do mapa no frontend _(area:frontend | crisis:Low | status:Backlog)_
- [x] **[P3]** Acessibilidade e i18n _(area:frontend | crisis:Low | status:Done)_

## Kanban
| Priority | Item | Area | CrisisImpact | Status |
|---|---|---|---|---|
| P0 | Disponibilidade da API e readiness/healthchecks | operational | Critical | Done |
| P0 | Padronizar CORS/proxy dev para frontend em localhost:8088 | frontend | Critical | Done |
| P0 | Estabilizar endpoint /api/alerts | datahub | High | Done |
| P0 | Validar /api/missing-persons para busca de desaparecidos | operational | Critical | Backlog |
| P0 | Validar /api/hotspots para áreas críticas | operational | High | Backlog |
| P0 | Validar /api/rescue-support para suporte de resgate | operational | Critical | Backlog |
| P0 | Publicar /api/risk-areas e /api/searched-areas | operational | High | Backlog |
| P0 | Validar /api/weather/forecast no fluxo operacional | datahub | High | Done |
| P1 | Implementar caching em endpoints críticos | infra | High | Backlog |
| P1 | Aplicar rate limiting e retries/backoff | infra | High | Backlog |
| P1 | Observabilidade com logs estruturados e métricas | backend | Medium | Backlog |
| P1 | Validação estrita de payloads | backend | Medium | Backlog |
| P1 | Ampliar cobertura de testes automatizados | backend | Medium | Backlog |
| P2 | Expandir /api/transparency/transfers e /api/transparency/search | datahub | Medium | Backlog |
| P2 | Expandir /api/satellite/layers /stac/search /goes/recent | datahub | Medium | Backlog |
| P3 | Melhorar filtros e UX de busca no mapa | frontend | Low | Done |
| P3 | Otimizar performance do mapa no frontend | frontend | Low | Backlog |
| P3 | Acessibilidade e i18n | frontend | Low | Done |
