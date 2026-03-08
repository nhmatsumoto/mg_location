# MG Location: Mapa Tático Resiliente e Sala de Situação 3D v1.2

![MG Location Banner](https://img.shields.io/badge/MG--Location-Resilience--v1.1-blueviolet?style=for-the-badge)
![Status Build](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[English](./README.md) | [日本語](./README.ja.md) | **Português**

**MG Location** é um sistema de suporte à decisão e coordenação operacional para cenários de desastres naturais (enchentes, deslizamentos, crises humanitárias). O objetivo principal é garantir **100% de disponibilidade operacional**, mesmo sob falha catastrófica de infraestrutura de rede.

---

## 🎯 Nossa Missão
Transformar dados complexos em ações táticas imediatas. O MG Location não é apenas um dashboard, é uma ferramenta de campo projetada para funcionar onde a internet não chega.

---

## 🏗️ Arquitetura de Resiliência (v1.2)

A versão 1.2 consolidou o redesenho **Resilience-First** e a nova camada de **Visualização Tática**, focada em quatro pilares fundamentais:

```mermaid
graph TD
    subgraph "Interface Tática 2.0"
        UI[PWA Frontend] --> T3D[Sala de Situação 3D]
        UI --> SPT[Scatter Plot Tático]
        UI --> MCP[Captura de Pontos de Precisão]
        T3D -.->|Estado Compartilhado| SPT
    end

    subgraph "Campo / Offline"
        UI --> DB[(IndexedDB)]
        DB --> OB[Fila Outbox]
    end

    subgraph "Proxy Tático"
        EH[Edge Hub / RPi] 
        EH -->|Sincronia Local| OB
    end

    subgraph "Infraestrutura Global"
        API[Django REST API]
        MP[MessagePack + Zstd]
        EV[Event Store / DDD]
        API --> EV
    end

    OB -.->|Sincronia Binária| MP
    MP -.-> API
    EH -.->|Backhaul| API
```

1. **Local-first (Offline Outbox)**: O app PWA funciona sem internet usando IndexedDB. Ações são enfileiradas e sincronizadas automaticamente quando houver conectividade.
2. **Protocolo Binário (MessagePack + Zstd)**: Substituímos o JSON pesado por MessagePack comprimido com Zstandard, reduzindo o tráfego de dados em até 80%.
3. **Event-Souring (DDD)**: Todas as alterações no sistema são tratadas como eventos imutáveis com reconciliação automática de conflitos.
4. **Visualização 3D Imersiva**: Nova camada de renderização espacial para consciência situacional profunda em tempo real.

---

## 🚀 Como Funciona

### 1. Sala de Situação 3D (v2.0)
Ambiente tático imersivo usando **Three.js** para visualizar eventos como "beacons" 3D pulsantes. Oferece percepção de profundidade e clusterização espacial de desastres.

### 2. API Padronizada e Monitoramento de Saúde
Integração robusta com **ASPNET Core v10**. Inclui endpoints especializados para monitoramento de alta disponibilidade:
- `GET /api/health`: Fornece o status do serviço e verificação de uptime.

### 3. Análise Tática (Scatter Plot 2.0)
...
### Rápido (Docker)
```bash
./dev.sh up
```
- **App**: `http://localhost:8088` (Frontend React)
- **API**: `http://localhost:8001` (Backend .NET)
- **Saúde**: `http://localhost:8001/api/health`

### Semente de Dados (Importante)
Para ver o sistema populado com dados de simulação de enchentes em Ubá (MG):
```bash
./dev.sh seed
```

---

## 📂 Organização do Projeto

```bash
├── backend-dotnet/     # ASP.NET Core 10 Web API
├── frontend-react/     # Aplicação React 19 + Vite
├── agents/             # Agentes de IA e Automação
├── docs/               # Documentação profunda e planos
├── dev.sh              # Canivete suíço tático para DX
└── Dockerfile.*        # Definições de ambiente
```

---

## 📑 Documentação Detalhada
- 📖 [Arquitetura Atual](docs/ARCHITECTURE_CURRENT.md)
- ⚖️ [Políticas de Transparência](docs/PRIVACY_TRANSPARENCY_POLICY.md)
- 🧪 [Plano de Testes](docs/SECURITY_TEST_CHECKLIST.md)

---

**MG Location © 2026** - Desenvolvido para salvar vidas com tecnologia resiliente.
