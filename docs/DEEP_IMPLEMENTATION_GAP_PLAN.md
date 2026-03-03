# Análise Profunda Consolidada e Plano de Implementação por Funcionalidade

## 1) Objetivo
Consolidar, em um único artefato, o que já existe, o que ainda falta implementar e um plano de execução por especialistas para maximizar eficiência e previsibilidade.

## 2) Escopo analisado (todos os projetos)
- Backend principal Django: `apps/api`, `apps/map`, `apps/rescue_ops`, `core`.
- Frontend web React/TypeScript: `frontend-react`.
- App mobile de captura: `flutter_capture_app`.
- Agente de risco (ML/service): `risk_agent`.
- Serviço legado geolocations: `geolocations_service`.
- Infra e operação: `docker-compose.yml`, scripts e documentação técnica.

## 3) Diagnóstico executivo por projeto

### 3.1 Backend Django (API principal)
**Cobertura atual observada**
- Endpoints para incidentes, suporte, resgate, autenticação, integrações, risco, mapa e snapshot operacional.
- Suíte de testes backend funcional (46 testes em `apps.api.tests`) executando com sucesso localmente.

**Gaps críticos (P0/P1)**
1. Seed e fallback em runtime ainda presentes (`_seed_initial_collapse_report`, `ATTENTION_ALERTS`, fallbacks em contexto de terreno).
2. Endpoints de autenticação majoritariamente `@csrf_exempt` com reforço de hardening ainda pendente.
3. Falta explicitar política única de erro/observabilidade por domínio de endpoint.
4. Falta e2e real ponta a ponta (já indicado no checklist).

### 3.2 Frontend React/TypeScript
**Cobertura atual observada**
- Páginas operacionais amplas (Command Center, Data Hub, Incidents, Missing Persons, Simulations etc.).
- Serviços por domínio (`authApi`, `incidentsApi`, `integrationsApi`, `operationsApi`, etc.).

**Gaps críticos (P0/P1)**
1. Snapshot fallback local em `operationsApi` pode mascarar falha de backend.
2. Ausência de suíte e2e formal para fluxos críticos de operação.
3. Estratégia de feature flags e states de indisponibilidade parcial ainda não padronizada.

### 3.3 Flutter Capture App
**Cobertura atual observada**
- Fluxos de envio de relatório, alerta, push register e upload para splat.

**Gaps críticos (P0/P1)**
1. Uso de `mock-fcm-token` no fluxo de registro push.
2. Falta camada robusta de autenticação/tokens para uso em produção.
3. Falta instrumentação de erros, retries e telemetry mobile.

### 3.4 Risk Agent (FastAPI)
**Cobertura atual observada**
- Endpoint `/risk-assessment` com validação de token interno.
- Pipeline de feature engineering + inferência local.

**Gaps críticos (P0/P1)**
1. Modelo treinado on-request (custo/latência), sem estratégia explícita de versionamento de modelo.
2. Falta suíte de testes dedicada e contrato OpenAPI validado em CI.
3. Fontes externas com fallback silencioso (`return {}`), sem classificação de erro observável.

### 3.5 Geolocations Service (legado)
**Cobertura atual observada**
- Serviço Django legado com routers de geolocations/visited/found_people.

**Gaps críticos (P1/P2)**
1. Stack e settings desatualizados (SQLite, configuração antiga) frente ao backend principal.
2. Sobreposição funcional com API principal sem estratégia de convergência.
3. Falta plano de descontinuação, migração ou integração oficial.

### 3.6 Infra, segurança e governança
**Cobertura atual observada**
- Compose com backend/frontend/postgres/risk-agent.
- Catálogo de agentes e skills ampliado.

**Gaps críticos (P0/P1)**
1. Falta pipeline único de qualidade com gates cross-stack (backend + frontend + mobile + risk-agent).
2. Falta baseline formal para certificados/TLS por ambiente.
3. Falta SLO/SLI operacional com alertas para APIs críticas.

---

## 4) Matriz de funcionalidades e plano por especialistas

| Funcionalidade | Status atual | Lacuna principal | Agentes líderes | Skills aplicadas | Plano de implementação |
|---|---|---|---|---|---|
| Gestão de incidentes (`/api/incidents*`) | Parcialmente madura | Falta observabilidade de negócio e e2e | Python/Django Backend, Quality Testing | `python-django-api-rest`, `automated-testing-pyramid` | Fase 1: mapear contratos críticos; Fase 2: ampliar testes de integração; Fase 3: e2e por jornada operacional |
| Operações de resgate e busca | Funcional | Falta otimização de priorização e métricas de eficiência | Rescue & Emergency, Statistics, Software Engineering Execution | `rescue-emergency-operations`, `statistics-decision-intelligence`, `software-engineering-execution` | Definir KPIs (tempo de resposta, cobertura por área), painel de decisão e backlog de melhorias |
| Data Hub (weather/alerts/transparency/satellite) | Funcional | Dependência de fallback e políticas de indisponibilidade | API Integration, Network & HTTP, Quality Testing | `integration-api-resilience`, `http-certificates-tls`, `automated-testing-pyramid` | Introduzir política de degrade controlado, circuit-breaker com telemetry e teste de caos leve |
| Simulação de risco/deslizamento | Funcional com fallback | Modelo e fonte de dados sem governança de versão | Risk (Python), Physics, Geology, Mathematics | `physics-simulation-basics`, `geology-risk-terrain`, `mathematics-modeling` | Definir versionamento de modelo, separar treino/inferência, validar métricas técnicas por release |
| Cadastro de desaparecidos e anotações de mapa | Funcional | Falta hardening de validações e trilha analítica | Django Backend, Web Frontend, LGPD | `python-django-api-rest`, `web-react-typescript-zustand`, `security-auth-keycloak-lgpd` | Revisar validações, adicionar auditoria e política de retenção de dados pessoais |
| Autenticação e autorização | Parcial | Endpoints com `csrf_exempt` e evolução IAM pendente | Security/Auth/Keycloak, Engineering Best Practices | `security-auth-keycloak-lgpd`, `oauth2-keycloak-integration`, `solid-ddd-best-practices` | Evoluir para política de autenticação unificada (token/session), hardening e testes de segurança |
| Frontend Command Center | Funcional | Fallback local oculta indisponibilidade | Web Frontend, API Integration | `web-react-typescript-zustand`, `integration-api-resilience` | Adotar estados explícitos: online/degradado/offline com alertas visuais e ação operacional |
| Mobile captura (Flutter) | MVP funcional | Push token mockado e sem fluxo auth robusto | Rescue Operations, Security/Auth, Software Engineering Execution | `rescue-emergency-operations`, `security-auth-keycloak-lgpd`, `software-engineering-execution` | Integrar provider push real, autenticação de dispositivo e política de retry/offline queue |
| Serviço legado geolocations | Legado ativo | Duplicidade com backend principal | Software Engineering Execution, Git Governance | `software-engineering-execution`, `git-workflow-governance` | Decidir: migrar, encapsular ou descontinuar; publicar ADR com cronograma |
| Supply e logística de apoio | Parcial | Falta motor de planejamento e monitoramento de estoque | Supply Chain, Product Owner | `supply-chain-operations`, `product-owner-delivery` | Mapear fluxo ponta a ponta e implementar backlog de reposição + nível de serviço |
| Governança de mudanças | Parcial | Falta standard único de release/hotfix e readiness | Git Governance, PO, Eng. Software | `git-workflow-governance`, `product-owner-delivery`, `software-engineering-execution` | Definir Definition of Ready/Done, PR template obrigatório e checklist de release |

---

## 5) Plano macro de implementação (90 dias)

## Sprint 0 (semana 1)
- Criar backlog único priorizado por risco operacional (P0/P1/P2).
- Definir owners por agente e handoff oficial.
- Publicar baseline de validação (testes, segurança, observabilidade).

## Sprint 1-2 (semanas 2-5) — Estabilização P0
- Remover seeds/fallbacks perigosos em runtime do backend.
- Hardening de autenticação/autorização e política CSRF.
- Remover mock token no Flutter e preparar integração push real.
- Tornar fallback do frontend explícito para operação (sem mascarar erro).

## Sprint 3-4 (semanas 6-9) — Eficiência operacional P1
- Formalizar governança do risk-agent (versão de modelo + métricas).
- Implementar testes e2e prioritários (incidente -> resgate -> suporte).
- Consolidar SLO/SLI para APIs críticas e painéis de saúde.

## Sprint 5-6 (semanas 10-13) — Escala e convergência P2
- Resolver destino do `geolocations_service` (migração/descontinuação).
- Evoluir planejamento de supply chain e alocação de recursos.
- Consolidar catálogo de decisões arquiteturais (ADRs) por domínio.

---

## 6) Protocolo de execução com todos os agentes
1. Orquestrador gera Requirement Card por funcionalidade.
2. Roteamento obrigatório via matriz `agent-skill-routing-matrix.md`.
3. Cada agente devolve:
   - escopo técnico,
   - plano incremental,
   - riscos,
   - critérios de validação.
4. Orquestrador consolida cronograma e dependências bloqueantes.
5. Fechamento com evidências (testes, métricas, rollback, aprendizado).

---

## 7) Checklist de validação contínua
- Backend: `python manage.py check` + suíte de testes API.
- Frontend: lint + testes unitários + e2e de jornadas críticas.
- Mobile: smoke tests de captura/envio/push + telemetria de erro.
- Risk agent: testes de contrato, latência e qualidade de predição mínima.
- Infra: healthchecks, logs estruturados e alerta por indisponibilidade.

## 8) Definição de pronto (DoD) consolidada
Uma funcionalidade só é considerada concluída quando:
1. Possui critérios de aceite executáveis.
2. Possui testes automatizados (unidade e/ou integração) no nível adequado.
3. Possui observabilidade mínima (logs de erro e métricas de sucesso/falha).
4. Possui plano de rollback para mudanças críticas.
5. Possui registro de aprendizado no `docs/agents/learning-log.md`.
