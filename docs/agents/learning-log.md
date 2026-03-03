# Learning Log dos Agentes

## Objetivo
Centralizar aprendizados operacionais e arquiteturais para reduzir retrabalho, acelerar bugfix e evoluir skills/agentes de forma contínua.

## Formato de registro

```md
## [YYYY-MM-DD] <agente>
- Contexto da tarefa:
- Sintoma/erro observado:
- Causa raiz:
- Ação aplicada:
- Validação executada:
- Aprendizado reutilizável:
- Tipo: [bug recorrente | melhoria arquitetural | otimização de fluxo | novo padrão de skill]
- Próximo passo: [atualizar skill | criar skill | ajustar checklist | monitorar]
```

---

## Registros

## [2026-03-02] orchestrator
- Contexto da tarefa: Definição de fluxo para transformar linguagem natural em requisitos de engenharia com DDD como núcleo.
- Sintoma/erro observado: Ausência de padrão único para traduzir demandas em especificações técnicas rastreáveis.
- Causa raiz: Documentação dispersa e sem contrato mínimo de requisito estruturado.
- Ação aplicada: Criação de arquitetura canônica de orquestração e template obrigatório de Requirement Card.
- Validação executada: Revisão documental dos pontos de integração entre agentes e definição de governança de aprendizado.
- Aprendizado reutilizável: Sempre exigir card estruturado antes de implementação reduz ambiguidade e retrabalho.
- Tipo: melhoria arquitetural
- Próximo passo: ajustar checklist

## [2026-03-03] mg-location-orchestration-agent
- Contexto da tarefa: Revisar consolidação para torná-la acionável em execução por múltiplos agentes especialistas.
- Sintoma/erro observado: Documento consolidado anterior estava correto, porém descritivo e sem template operacional reutilizável.
- Causa raiz: Ausência de artefato padrão para Requirement Card e falta de amarração explícita com validação/rollback.
- Ação aplicada: Evolução da skill de orquestração com referência de template e reforço de guardrails; atualização da consolidação com seção de artefatos operacionais.
- Validação executada: Verificação de consistência Markdown e ausência de problemas de diff.
- Aprendizado reutilizável: Consolidação documental deve sempre incluir template operacional + checklist de validação para reduzir ambiguidade de execução.
- Tipo: novo padrão de skill
- Próximo passo: monitorar

## [2026-03-03] specialist-skill-orchestrator
- Contexto da tarefa: Expandir catálogo de agentes e skills para cobrir backend, frontend, segurança, integrações, dados e qualidade.
- Sintoma/erro observado: Cobertura parcial de especialidades, sem catálogo único para temas como Docker, Redes, HTTP, certificados, LGPD e testes.
- Causa raiz: Evolução incremental anterior sem mapa completo de competências por domínio.
- Ação aplicada: Criação de catálogo central de agentes especialistas e inclusão de novas skills orientadas a Python/Django, segurança/autenticação/Keycloak/LGPD, Docker/redes, HTTP/certificados, SOLID/DDD, integração e testes automatizados.
- Validação executada: Revisão de consistência dos documentos, links de índice e presença dos arquivos de skill.
- Aprendizado reutilizável: Expansão de capacidades deve vir acompanhada de matriz de responsabilidade por agente + catálogo de skills para descoberta rápida.
- Tipo: novo padrão de skill
- Próximo passo: atualizar skill

## [2026-03-03] orchestrator-sync-evolution
- Contexto da tarefa: Ajustar expansão anterior de agentes/skills para cobrir novas especialidades e melhorar sincronização do orquestrador.
- Sintoma/erro observado: Catálogo anterior cobria parte dos domínios, porém sem protocolo de sincronização claro entre todos os novos especialistas.
- Causa raiz: Crescimento do ecossistema sem matriz formal de roteamento agente-skill e sem handoff padronizado.
- Ação aplicada: Ampliação do catálogo de agentes (incluindo Git, Design Patterns, PO, Eng. Software, Estatística, Matemática, Física, Geologia, Arquitetura, Eng. Civil, Supply Chain, Resgate/Emergência), criação de novas skills por domínio e evolução da skill/documentação do orquestrador com matriz de roteamento.
- Validação executada: Conferência de presença de skills, consistência de links e verificação semântica por busca de palavras-chave.
- Aprendizado reutilizável: Sempre que aumentar cobertura de especialistas, adicionar protocolo de sincronização e matriz de roteamento para evitar lacunas de coordenação.
- Tipo: melhoria arquitetural
- Próximo passo: ajustar checklist
