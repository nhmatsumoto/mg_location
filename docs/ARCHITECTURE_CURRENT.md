# Arquitetura SOS Location (v2.0)

## Stack
- **Backend**: Django + Django REST Framework, SQLite/PostgreSQL.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind + **@react-three/fiber** (Three.js) + Zustand.
- **Renderização**: Sistema de **Dynamic Chunks** (Minecraft-style) centrado no usuário/câmera.
- **Herói SOS**: Componente interativo (Pegman) com Drag & Drop para exploração do cenário.

## Entrypoints
- Backend: `manage.py`, `core/urls.py`, `apps/api/urls.py`.
- Frontend: `sos-location-frontend/src/main.tsx`.
- Visualização Tática: `Tactical3DMap.tsx` (Situacion Room) integrado com `useChunkManager`.

## Estratégia de Renderização Dynamica
Para garantir performance em cenários reais complexos, o sistema agora divide o mapa em chunks de 500m. 
O `useChunkManager` monitora a posição do **SOS Hero** e carrega apenas os chunks necessários no raio de visão (default: 3x3 grid). Cada chunk é responsável por buscar seus próprios dados de relevo, edificações e vias via `gisApi`.

## Auth (estado atual)
- Endpoints de auth em `/api/auth/*` usando sessão.
- Autorização por role/incident (`apps/api/authz.py`) com persistência em claims JWT.
