# Decisões Técnicas

1. **Eliminar fallback silencioso no snapshot**: erros reais agora aparecem no frontend para evitar “falso zero”.
2. **Seed operacional ampliada**: dados mínimos de desaparecidos, equipes e suprimentos sempre disponíveis.
3. **CORS padronizado por `API_CORS_ORIGINS`**: mantém compatibilidade com `CORS_ALLOWED_ORIGINS` existente.
4. **Rotas públicas e privadas separadas**: `/`, `/public/*`, `/login` e `/app/*`.
5. **Endpoint `/api/weather`**: contrato enxuto para widget de mapa sem acoplamento ao payload extenso de forecast.
