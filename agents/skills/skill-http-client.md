# skill-http-client
- Timeout padrão: 8s (máx 15s em integrações lentas).
- Retry exponencial: 3 tentativas (250ms, 500ms, 1000ms).
- Circuit breaker simples: abre por 30s após 5 falhas seguidas.
- Sempre logar: fonte, latência, status, cacheHit.
