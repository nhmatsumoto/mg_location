# Agent-Skill Routing Matrix

## Objetivo
Ajudar o agente orquestrador a selecionar rapidamente especialistas e skills por domínio da demanda.

## Roteamento por tema
- Backend Python/Django/API REST -> agentes 1/7/11/15 | skills: `python-django-api-rest`, `integration-api-resilience`, `solid-ddd-best-practices`, `software-engineering-execution`.
- Banco PostgreSQL -> agente 2 | skills: `postgres-ddd-modular-backend`.
- Frontend React/TS/Zustand -> agente 6 | skills: `web-react-typescript-zustand`, `typescript-componentization`, `zustand-state-management`.
- Segurança, Keycloak, LGPD -> agentes 5/9 | skills: `security-auth-keycloak-lgpd`, `oauth2-keycloak-integration`.
- Docker/Runtime/Redes/HTTP/TLS -> agentes 3/4/8 | skills: `docker-networking-runtime`, `http-certificates-tls`.
- Qualidade e testes -> agente 10 | skills: `automated-testing-pyramid`.
- Git e governança de mudança -> agente 12 | skills: `git-workflow-governance`.
- Design patterns e arquitetura -> agentes 11/13 | skills: `design-patterns-architecture`, `solid-ddd-best-practices`.
- Produto e backlog -> agente 14 | skills: `product-owner-delivery`.
- Estatística e matemática -> agentes 16/17 | skills: `statistics-decision-intelligence`, `mathematics-modeling`.
- Física/geologia/arquitetura/civil -> agentes 18/19/20/21 | skills: `physics-simulation-basics`, `geology-risk-terrain`, `architecture-urban-infra`, `civil-engineering-infrastructure`.
- Supply chain e emergência -> agentes 22/23 | skills: `supply-chain-operations`, `rescue-emergency-operations`.

## Protocolo de sincronização mínima
1. Definir escopo in/out e critério de aceite.
2. Selecionar especialistas e skills via tabela acima.
3. Publicar plano por dependência (ordem de execução).
4. Executar validações objetivas.
5. Registrar aprendizado no `docs/agents/learning-log.md`.
