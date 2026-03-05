# 3D Simulation Area & Flood Sandbox

## Visão Geral
A ferramenta **3D Simulation Area** (Scenario Sandbox) permite aos operadores desenhar e interagir com um volume 3D sobressalente no mapa tático, com o objetivo de capturar dados de terreno e infraestrutura em cenários de emergência para a execução de simulações físicas, como o avanço de enchentes ou fluxo de detritos.

Trata-se do MVP para integração futura com modelos de cidade em 3D (ex: PLATEAU da governança do Japão) usando um framework agnóstico que, no momento, utiliza elevações SRTM e extrações de superfície (OSM/building footprints).

## Funcionalidades Frontend
- **Modo Área 3D**: Disponível no Situation Room (após habilitar o modo 3D). Utiliza a biblioteca `@react-three/drei` (via `TransformControls`) para renderizar e permitir a manipulação ágil de um cubo de controle que representa o _Bounding Box_ da área selecionada.
- **Painel Sandbox**: Um painel contextual que oferece controles para:
  - **Gerar Terreno**: Dispara via API a requisição para extração algorítmica de dados geográficos da área definida.
  - **Simular**: Permite a visualização iterativa da progressão das águas (Flood Engine), manipulando o nível d'água via `useSimulationStore`.
- **FloodOverlay**: Renderiza sobre a Tactical3DMap um plano aquático translúcido que simula a coluna d'água baseada em cálculo volumétrico progressivo.

## Armazenamento de Estado (useSimulationStore)
Utiliza a store Zustand para gerenciar o controle síncrono da área sendo delimitada (*box location* e *dimensions*), além de amarrá-la ao ID de cenário no backend e gerir o parâmetro em tempo pseudo-real da profundidade d'água (`waterLevel`) na UX.

## Limitações do MVP
- A altura atual do `SimulationBoxEditor` é puramente indicativa (5 metros) na representação wireframe, devendo ser estendida para cálculos altimétricos mais detalhados na fase 2.
- A simulação de Flood é demonstrativa em tempo de execução frontend, iterando de 0 a 15 níveis.
- O terreno topográfico real em 3D está na fila para a v1.2, atualmente renderizado em plano tático achatado.
