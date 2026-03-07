---
name: mg-location-orchestration
description: Use when translating MG Location natural-language requests into structured requirement cards, specialist-agent execution plans, routing matrices, and validation checklists across software, operations, and domain experts.
---

# MG Location Orchestration

## Quando usar
Use esta skill quando a demanda vier em linguagem natural e precisar virar plano técnico executável no contexto MG Location.

## Workflow padrão
1. Classificar a demanda por domínios (software, operação, ciência aplicada, emergência).
2. Preencher Requirement Card usando `references/requirement-card-template.md`.
3. Selecionar agentes + skills usando `references/agent-skill-routing-matrix.md`.
4. Definir plano de execução com dependências explícitas e sincronização entre especialistas.
5. Criar checklist de validação com comandos objetivos.
6. Registrar decisão, trade-off e aprendizado no learning log.

## Sincronização obrigatória do orquestrador
- Consolidar backlog técnico em uma fila única por prioridade.
- Declarar handoff entre agentes (entrada esperada -> saída esperada).
- Evitar execução paralela quando houver dependência bloqueante.
- Validar cobertura completa de skills para cada requisito.
- Publicar estado final: entregue, pendente, risco e rollback.

## Saída mínima obrigatória
- Requirement Card com escopo **in/out**.
- Plano por etapas com dependências explícitas.
- Matriz agente-skill usada no roteamento.
- Checklist de validação (comandos reproduzíveis).
- Riscos, mitigação e estratégia de rollback.

## Guardrails
- Não implementar sem critérios de aceite verificáveis.
- Não liberar endpoint crítico sem autenticação/autorização testada.
- Não publicar fluxo novo sem observabilidade mínima (logs + erro explícito).
- Não fechar tarefa sem registro de aprendizado reutilizável.
