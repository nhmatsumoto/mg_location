---
name: integration-api-resilience
description: Use this skill for external/internal API integrations with resilience, retries, fallback behavior, and robust error mapping.
---

# Integração de APIs com Resiliência

## Quando usar
Para integrações REST entre módulos internos ou provedores externos.

## Checklist
1. Definir cliente HTTP centralizado.
2. Aplicar timeout/retry com limites e backoff.
3. Mapear erros por categoria técnica/negócio.
4. Implementar fallback seguro quando aplicável.
5. Cobrir integração com testes automatizados.
