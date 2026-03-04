# sos-location

Plataforma operacional de resposta a desastres com **frontend React + Tailwind**, **backend Django REST**, **mapa Leaflet** e autenticação preparada para **Keycloak**.

## Executar em localhost

### Opção 1: Docker Compose
```bash
./dev.sh up
```
Serviços esperados:
- Frontend: http://localhost:8088
- Backend/API: http://localhost:8001
- Keycloak: http://localhost:8080

### Opção 2: Execução local sem Docker
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_rain_flood_map
python manage.py runserver 0.0.0.0:8001
```
Em outro terminal:
```bash
cd frontend-react
npm install
npm run dev -- --host --port 8088
```

## Fluxo de acesso
- Público:
  - `/` landing
  - `/public/map` mapa read-only
  - `/public/transparency` dashboard público
- Privado:
  - `/login`
  - `/app/command-center`
  - `/app/hotspots`
  - `/app/missing-persons`
  - `/app/operations`

## Configuração de ambiente
- Backend: use `.env.example` (raiz).
- Frontend: use `frontend-react/.env.example`.

Variáveis principais:
- `VITE_API_BASE_URL`
- `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`
- `API_CORS_ORIGINS`
- `OPENMETEO_BASE_URL` (opcional)

## Scripts DX
```bash
./dev.sh up
./dev.sh down
./dev.sh logs
./dev.sh seed
./dev.sh reset
```

## Troubleshooting
- **Tudo em zero no Command Center**: rode `python manage.py seed_rain_flood_map`.
- **Erro CORS no browser**: valide `API_CORS_ORIGINS=http://localhost:8088`.
- **Frontend sem backend**: confira `VITE_DEV_API_TARGET=http://localhost:8001` no Vite.
- **ERR_BLOCKED_BY_CLIENT**: normalmente é extensão de navegador (adblock/privacy), não CORS.

## Documentação
- `docs/STATUS_LOCALHOST.md`
- `docs/PLAN_IMPLEMENTATION.md`
- `docs/DECISIONS.md`
- `agents/README.md`
