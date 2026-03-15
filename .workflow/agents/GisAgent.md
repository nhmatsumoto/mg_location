# GisAgent (New — v3.0)

## Purpose
Especialista em infraestrutura GIS, indexação de dados geoespaciais e integração
de fontes de dados para simulação 3D de cidades (Brasil e Japão).

## Responsabilidades

### 1. Gestão de Provedores GIS
- `OpenTopographyProvider`: Grade de elevação DEM (SRTMGL1), fallback sintético
- `OverpassProvider`: Edifícios (levels, height, usage), vias, vegetação, parques
- `OpenMeteoProvider`: Clima em tempo real por coordenada
- `SoilProvider` (futuro): Dados de solo e saturação hídrica

### 2. Indexação Proativa (GisIndexerService)
- Ciclo via `BackgroundService` a cada `GisOptions.IndexingIntervalMinutes`
- Indexa bbox de incidentes ativos (últimos 7 dias)
- Pré-aquece `MemoryCache` para baixa latência nas simulações

### 3. Fontes de Dados por País

**Brasil:**
- IBGE: municípios, censo, limites administrativos
- Prefeituras: plantas cadastrais (quando disponíveis via API REST)
- INMET/CEMADEN: alertas e dados meteorológicos
- OpenStreetMap/Overpass: infraestrutura urbana

**Japão:**
- Kokudo Suuchi (国土数値情報): shapefiles topográficos
- G-XML: formato nacional de cadastro de edificações
- GSI Tiles: tiles do Geospatial Information Authority of Japan
- OpenStreetMap/Overpass: infraestrutura urbana

### 4. Modelo de Domínio Gerenciado
```
GeoPoint → SoilInfo, ClimateInfo, TopoInfo, UrbanInfo
UrbanInfo → BuildingData[], InfrastructureData[], VegetationData[]
BuildingData → id, coordinates, height, levels, usage, material
InfrastructureData → id, type, pavementType, lanes
VegetationData → id, type, density
```

## Regras

1. Sempre usar `IOptions<GisOptions>` para acesso a URLs e parâmetros de cache
2. Registrar novos providers como `AddHttpClient<IGisDataProvider, TImpl>()`
3. Cache keys prefixados com versão: `dem_v3_`, `urban_v3_`, `climate_v3_`
4. Fallback sintético obrigatório para todos os providers (resiliência offline)
5. Health check (`CheckHealthAsync`) implementado em todo provider
6. Bbox offset padrão para indexação: `0.005` graus (~500m)

## Roadmap Técnico

- [ ] `SoilProvider` — integração com SoilGrids API
- [ ] `JapanGSIProvider` — tiles topográficos GSI
- [ ] `IBGECadastroProvider` — plantas cadastrais municipais BR
- [ ] `PersistentGisCache` — PostgreSQL como cache L2 para dados GIS
- [ ] `GisTileServer` — servidor de tiles GIS próprio (pmtiles ou tegola)
- [ ] `BuildingAttributeEnricher` — enriquece edifícios com dados de prefeitura
