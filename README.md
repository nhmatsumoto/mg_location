# MG Location: Plataforma Tática de Resposta a Desastres v1.1

![MG Location Banner](https://img.shields.io/badge/MG--Location-Resilience--v1.1-blueviolet?style=for-the-badge)
![Status Build](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**MG Location** é um sistema de suporte à decisão e coordenação operacional para cenários de desastres naturais (enchentes, deslizamentos, crises humanitárias). O objetivo principal é garantir **100% de disponibilidade operacional**, mesmo sob falha catastrófica de infraestrutura de rede.

---

## 🎯 Nossa Missão
Transformar dados complexos em ações táticas imediatas. O MG Location não é apenas um dashboard, é uma ferramenta de campo projetada para funcionar onde a internet não chega.

---

## 🏗️ Arquitetura de Resiliência (v1.1)

A versão 1.1 introduziu o redesenho **Resilience-First**, focado em quatro pilares fundamentais:

1. **Local-first (Offline Outbox)**: O app PWA funciona sem internet usando IndexedDB. Ações são enfileiradas e sincronizadas automaticamente quando houver conectividade.
2. **Protocolo Binário (MessagePack + Zstd)**: Substituímos o JSON pesado por MessagePack comprimido com Zstandard, reduzindo o tráfego de dados em até 80% — vital para links via rádio ou satélite.
3. **Event-Souring (DDD)**: Todas as alterações no sistema são tratadas como eventos imutáveis. Isso permite reconciliação automática de conflitos (CRDT-lite) e auditoria completa.
4. **Edge Hubs (Decentralized Command)**: Suporte a servidores locais (como Raspberry Pi) que servem como proxies táticos em áreas isoladas.

---

## 🚀 Como Funciona

### 1. Centro de Comando
Visualização em tempo real de alertas de chuva, áreas de risco e status de equipes de resgate. Integra inteligência do **GDACS**, **USGS** e **INMET**.

### 2. Operações de Busca e Resgate
Módulo tático para atribuição de tarefas, demarcação de áreas de busca e acompanhamento de equipes em campo.

### 3. Logística e Doações
Gestão transparente de recursos, campanhas de arrecadação e controle de despesas operacionais.

### 4. Análise Temporal (Scatter Plot)
Um gráfico tático de dispersão que permite analisar a severidade dos eventos versus o tempo, integrando eventos locais e globais em uma única visão estratégica.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, Vite, Tailwind CSS (Design tático moderno).
- **Backend**: Django 5.x, Django REST Framework (Core robusto).
- **Dados**: Postgres + Redis (Central) | IndexedDB (Local/App).
- **Protocolos**: MessagePack, Zstandard, RESTful Events.
- **SSO/Auth**: Keycloak (Gerenciamento de identidades nível Enterprise).

---

## 💻 Iniciando o Desenvolvimento

### Pré-requisitos
- Docker & Docker Compose
- Node.js / Bun (opcional para local)
- Python 3.11+ (opcional para local)

### Rápido (Docker)
```bash
./dev.sh up
```
- **App**: `http://localhost:8088`
- **API**: `http://localhost:8001`

### Semente de Dados (Importante)
Para ver o sistema populado com dados de simulação de enchentes em Ubá (MG):
```bash
./dev.sh seed
```

---

## 🤝 Convite para Contribuição

Este é um projeto **Open Source** com impacto social real. Precisamos de ajuda em várias frentes:

- **Desenvolvedores**: Otimização de algoritmos de sincronização, novos módulos de IA.
- **Especialistas em UX**: Melhoria da interface para uso sob stress e alta luminosidade.
- **Especialistas em GIS**: Integração de mais modelos de terreno e camadas de satélite.
- **Analistas de Dados**: Criação de modelos preditivos de risco.

### Como ingressar?
1. Leia nosso [Guia de Onboarding](docs/PROJECT_CONSOLIDATION_MG_LOCATION.md).
2. Explore os [Gaps de Implementação](docs/DEEP_IMPLEMENTATION_GAP_PLAN.md).
3. Abra uma *Issue* ou submeta um *Pull Request* com suas ideias.

---

## 📂 Organização do Projeto

```bash
├── apps/               # Aplicações Django (Backend)
├── frontend-react/     # Aplicação React (Frontend)
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

> [!TIP]
> **Interessado em rodar no campo?** Consulte nossa documentação sobre **Edge Hubs** para saber como configurar um ponto de sincronização local via rádio ou rede mesh.

**MG Location © 2026** - Desenvolvido para salvar vidas com tecnologia resiliente.
