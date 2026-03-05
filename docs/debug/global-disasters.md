# Relatório de Diagnóstico: Tela Global Disasters

## Diagnóstico Inicial

### 1. Frontend: Rota e Componentes
- **Arquivo/Módulo**: `frontend-react/src/pages/GlobalDisastersPage.tsx`.
- **Comportamento Atual**: Trabalha ativamente com os endpoints `/api/disasters/events` e `syncEngine.getOutbox()`. O layout mescla `Tactical3DMap` e um ScatterPlot 2D na visualização "Foco Brasil".

### 2. Integrações Frontend vs Backend
- **Problema Raiz (`Dados da Defesa Civil não aparecem`)**: A página *não* está realizando requisições HTTP para ler alertas oficiais ou informações meteorológicas diretas. Atualmente, o componente busca apenas dados puramente catalogados (Eventos / Operações).
- **Backend**: Em `apps/api/views_integrations.py` e `apps/api/views.py`, o backend **já possui** integradores robustos expostos que não estão sendo consumidos pela página:
  - `GET /api/alerts` (Alertas locais INMET CAP e agregadores de inteligência).
  - `POST/GET /api/map-annotations` (Armazenamento e listagem de marcações manuais/polígonos).
  - `GET /api/integrations/weather` e `weather/forecast` (Precipitações).
  - `GET /api/integrations/ibge/municipios` (Malha territorial).

### 3. Causas da "Página Zerada/Falta de Dados"
A falta de exibição não é uma quebra de backend (erro 500 ou CORS recente) pois estes foram corrigidos na última etapa. A causa verdadeira é **omissão da camada de API de Integração no Lifecycle da UI** (a tela não importa `integrationsApi.ts` ou renderiza camadas baseadas em seus outputs).

### 4. Arquivos Tocados para a Correção Imediata
- `frontend-react/src/pages/GlobalDisastersPage.tsx`
- Novos serviços baseados em `frontend-react/src/services/integrationsApi.ts` para consumo de mapas e alertas.

### 5. Plano de Correção (Passos Iniciais)
1. **Ativar Camada de Alerta**: Incluir um `useEffect` na `GlobalDisastersPage` para buscar e plotar `integrationsApi.getAlerts()`.
2. **Ativar Marcação Clicável**: Adaptar o estado `toolTool` de "point/area" da tela atual para disparar o modal e chamar `apiClient.post('/api/map-annotations', ...)` ao confirmar.
3. **Melhorias de IBGE e Clima**: Carregar popups flutuantes baseados na coordenada/município sob demanda (lazy) sem bloquear a UI.
