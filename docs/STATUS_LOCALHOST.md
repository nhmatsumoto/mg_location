# STATUS LOCALHOST — sos-location

## Auditoria rápida
- Estrutura detectada: `frontend-react` (Vite + React + Tailwind), backend Django em `apps/api`, infraestrutura em `docker-compose.yml`.
- Portas padrão: frontend `8088`, backend `8001`, keycloak `8080`.
- Evidência local: ambiente não possui `docker` instalado; validações foram feitas via `python manage.py runserver` + `curl`.

## Evidências de execução
- `docker compose up -d --build` → `bash: command not found: docker`.
- `curl -i -H 'Origin: http://localhost:8088' http://127.0.0.1:8001/api/hotspots` → respondeu `Access-Control-Allow-Origin: http://localhost:8088`.
- `curl http://127.0.0.1:8001/api/operations/snapshot` mostrou `missingPersons: 0` e `activeTeams: 0` antes de seed completo.

## Mapa de problemas
| Endpoint | Status | Causa provável | Ação |
|---|---|---|---|
| `/api/operations/snapshot` | Parcial (KPIs zerados) | Seed não populava missing persons/rescue groups/supply | Estendido `seed_rain_flood_map` com datasets mínimos |
| `/api/missing-persons` | Vazio | banco limpo sem seed | seed local adicionada |
| `/api/weather` | Ausente | havia apenas `/api/weather/forecast` | criado endpoint simplificado `/api/weather` |
| Frontend snapshot | “modo resiliente zerado” silencioso | `operationsApi.snapshot()` engolia erro | removido fallback silencioso e adicionados estados loading/empty/error |
| CORS por env | Inconsistente (`CORS_ALLOWED_ORIGINS` apenas) | padronização faltando | adicionado suporte a `API_CORS_ORIGINS` |

## Usuários locais
- Perfis locais (Django):
  - `admin` / `admin123456`
  - `governo` / `governo123456`
  - `voluntario` / `voluntario123456`
  - `usuario` / `usuario123456`
- Perfis locais (Keycloak):
  - `admin1` / `admin123`
  - `governo1` / `governo123`
  - `volunteer1` / `volunteer123`
  - `publico1` / `publico123`

## Troubleshooting
1. Se tudo aparecer zero: rode `python manage.py seed_rain_flood_map`.
2. Se erro CORS: configure `API_CORS_ORIGINS=http://localhost:8088`.
3. Se front não alcança API: confirme proxy Vite (`VITE_DEV_API_TARGET=http://localhost:8001`).


## Visualização de logs com Dozzle
- Serviço adicionado no `docker-compose.yml` como `dozzle`.
- URL local esperada: `http://localhost:9999` (configurável via `DOZZLE_PORT`).
- Pré-requisito: Docker Engine com socket disponível em `/var/run/docker.sock`.
