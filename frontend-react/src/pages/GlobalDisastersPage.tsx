import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { MapContainer, Polygon, Polyline, Popup, TileLayer, useMap, useMapEvents, Marker, CircleMarker, Circle } from 'react-leaflet';
import { Modal } from '../components/ui/Modal';
import { createEvent, getEvents } from '../services/disastersApi';
import { operationsApi, type MapAnnotationDto } from '../services/operationsApi';
import { eventsApi, type DomainEvent } from '../services/eventsApi';
import { integrationsApi, type AlertDto, type WeatherForecastDto } from '../services/integrationsApi';
import { syncEngine, type OutboxCommand } from '../lib/SyncEngine';
import { useNotifications } from '../context/NotificationsContext';
import { EventScatterPlot, type ScatterPoint } from '../components/EventScatterPlot';
import { Tactical3DMap } from '../components/map/Tactical3DMap';
import { Globe, Map as MapIcon, Target, AlertTriangle, CloudRain, Zap, Flame, Waves, Search, HeartHandshake, Maximize2, Minimize2, PanelBottomClose, PanelBottomOpen, MousePointer2, Layers, Crosshair, Box, Play } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { ScenarioBuilderPanel } from '../components/map/ScenarioBuilderPanel';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import { CountryDropdown } from '../components/ui/CountryDropdown';

type ToolMode = 'inspect' | 'point' | 'area' | 'filter_area' | 'simulation_box';

const EVENT_TYPE_OPTIONS = ['Flood', 'Earthquake', 'Cyclone', 'Volcano', 'Wildfire', 'Storm', 'Tsunami', 'Landslide', 'Other'];
const PROVIDER_OPTIONS = ['MANUAL', 'GDACS', 'USGS', 'INMET'];
const MAX_PAGES = 10;

function MapInteractions({
  tool,
  onPickPoint,
  onHover,
  areaDraft,
  setAreaDraft,
  spatialFilter,
  setSpatialFilter,
  onFilterComplete
}: {
  tool: ToolMode;
  onPickPoint: (lat: number, lon: number) => void;
  onHover: (lat: number, lon: number) => void;
  areaDraft: Array<[number, number]>;
  setAreaDraft: (next: Array<[number, number]>) => void;
  spatialFilter: { center: [number, number], radius: number } | null;
  setSpatialFilter: (next: { center: [number, number], radius: number } | null) => void;
  onFilterComplete: (filter: { center: [number, number], radius: number }) => void;
}) {
  const map = useMap();
  useMapEvents({
    mousemove(e) {
      onHover(e.latlng.lat, e.latlng.lng);
      if (tool === 'filter_area' && spatialFilter && !spatialFilter.radius) {
        setSpatialFilter({ ...spatialFilter, radius: map.distance(spatialFilter.center, e.latlng) });
      }
    },
    click(e) {
      if (tool === 'point') {
        onPickPoint(e.latlng.lat, e.latlng.lng);
        return;
      }
      if (tool === 'area') {
        setAreaDraft([...areaDraft, [e.latlng.lat, e.latlng.lng]]);
      }
      if (tool === 'filter_area') {
        if (!spatialFilter || spatialFilter.radius) {
          setSpatialFilter({ center: [e.latlng.lat, e.latlng.lng], radius: 0 });
        } else {
          const finalRadius = map.distance(spatialFilter.center, e.latlng);
          const filter = { ...spatialFilter, radius: finalRadius };
          setSpatialFilter(filter);
          onFilterComplete(filter);
        }
      }
    },
    contextmenu() {
      if (tool === 'area' && areaDraft.length > 2) {
        const [lat, lon] = areaDraft[0];
        onPickPoint(lat, lon);
      }
    },
  });
  return null;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function GlobalDisastersPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [domainEvents, setDomainEvents] = useState<DomainEvent[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [mapAnnotations, setMapAnnotations] = useState<MapAnnotationDto[]>([]);
  const [outbox, setOutbox] = useState<OutboxCommand[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-14.2, -51.9]);
  const [show3D, setShow3D] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [weatherIntel, setWeatherIntel] = useState<WeatherForecastDto | null>(null);
  const [intelPanelOpen, setIntelPanelOpen] = useState(false);

  const [country, setCountry] = useState('BR');
  const [minSeverity, setMinSeverity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState<ToolMode>('inspect');
  const [mapLayer, setMapLayer] = useState<'dark' | 'soil'>('dark');
  const [hover, setHover] = useState<{ lat: number; lon: number } | null>(null);
  const [areaDraft, setAreaDraft] = useState<Array<[number, number]>>([]);
  const [spatialFilter, setSpatialFilter] = useState<{ center: [number, number], radius: number } | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [intelReport, setIntelReport] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);

  const [openEventModal, setOpenEventModal] = useState(false);
  const [openOpsModal, setOpenOpsModal] = useState(false);
  const [form, setForm] = useState({
    provider: 'MANUAL',
    eventType: 'Other',
    severity: 2,
    title: '',
    description: '',
    lat: '',
    lon: '',
    countryCode: '',
    countryName: '',
    sourceUrl: '',
  });
  const [opsForm, setOpsForm] = useState({ recordType: 'risk_area' as 'risk_area' | 'support_point' | 'missing_person', personName: '', lastSeenLocation: '', incidentTitle: '', severity: 'high' });
  const { pushNotice } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const all: any[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const resp = await getEvents({ country: country || undefined, minSeverity, page, pageSize: 500 });
        all.push(...resp.items);
        if (all.length >= resp.total || resp.items.length === 0) break;
      }
      setEvents(all);

      try {
        const dEvents = await eventsApi.list();
        setDomainEvents(dEvents);
      } catch (e) {
        console.warn('Failed to load domain events', e);
      }
      
      try {
        const fetchedAlerts = await integrationsApi.getAlerts();
        setAlerts(fetchedAlerts?.items || []);
      } catch (e) {
        console.warn('Failed to fetch official alerts', e);
      }
      
      try {
        const fetchedAnnotations = await operationsApi.listMapAnnotations();
        setMapAnnotations(fetchedAnnotations || []);
      } catch (e) {
        console.warn('Failed to fetch map annotations', e);
      }

      const pending = await syncEngine.getOutbox();
      setOutbox(pending);
    } catch (err) {
      console.error(err);
      pushNotice({ type: 'warning', title: 'Falha na sincronização', message: 'Alguns dados podem estar desatualizados.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => void loadData(), 10000);
    return () => clearInterval(interval);
  }, [country, minSeverity]);

  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Derived state to combine manually filtered and active hotpots
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const triggerHotspot = (type: 'brazil_floods' | 'landslides' | 'community_help' | 'high_alert') => {
    setCountry(''); // Reset dropdown
    switch (type) {
      case 'brazil_floods':
        setMapCenter([-23.5, -46.6]); // Focus more on Sul/Sudeste
        useMap?.().setView([-23.5, -46.6], 5);
        setFilteredEvents(events.filter(e => e.country_code === 'BR' && ['Flood', 'Storm'].includes(e.event_type || e.type)));
        break;
      case 'landslides':
        setMapCenter([-22.9, -43.2]); // Focus on RJ/SP sierras
        useMap?.().setView([-22.9, -43.2], 7);
        setFilteredEvents(events.filter(e => e.country_code === 'BR' && ['Landslide', 'Earthquake'].includes(e.event_type || e.type)));
        break;
      case 'community_help':
        setMapCenter([-14.2, -51.9]);
        useMap?.().setView([-14.2, -51.9], 4);
        // Look for community driven events or high priority items
        setFilteredEvents(events.filter(e => e.country_code === 'BR' && e.severity >= 3 && ['Other', 'Flood', 'Storm', 'Landslide'].includes(e.event_type || e.type)));
        break;
      case 'high_alert':
        setMapCenter([-14.2, -51.9]);
        useMap?.().setView([-14.2, -51.9], 4);
        setFilteredEvents(events.filter(e => e.country_code === 'BR' && e.severity >= 4));
        break;
    }
    setTool('inspect'); // Reset tool to avoid weird interactions
  };

  const filterByDistance = (lat?: number | string | null, lon?: number | string | null) => {
    if (!spatialFilter || !spatialFilter.radius) return true;
    if (!lat || !lon) return false;
    const center = L.latLng(spatialFilter.center[0], spatialFilter.center[1]);
    return center.distanceTo(L.latLng(Number(lat), Number(lon))) <= spatialFilter.radius + 5000;
  };

  const currentDisplayEvents = useMemo(() => {
    let list = country ? events.filter(e => e.country_code === country) : filteredEvents;
    if (spatialFilter?.radius) {
      list = list.filter(e => filterByDistance(e.lat, e.lon));
    }
    return list;
  }, [events, filteredEvents, country, spatialFilter]);

  const scatterPoints = useMemo(() => {
    const combined: ScatterPoint[] = [];
    currentDisplayEvents.forEach((e) => {
      // already filtered
      combined.push({
        id: `${e.provider}-${e.provider_event_id}`,
        x: 0, 
        y: 100 - ((e.severity - 1) / 4) * 100,
        label: e.title,
        type: e.event_type,
        timestamp: e.start_at,
        severity: e.severity,
        metadata: e
      });
    });

    domainEvents.forEach((e) => {
      const data = e.payload || {};
      if (!filterByDistance(data.lat, data.lng)) return;
      const severity = data.priority || (data.severity === 'high' ? 4 : data.severity === 'critical' ? 5 : 2);
      combined.push({
        id: e.id,
        x: 0,
        y: 100 - ((severity - 1) / 4) * 100,
        label: `${e.aggregate_type}: ${e.event_type}`,
        type: e.aggregate_type,
        timestamp: e.timestamp,
        severity: severity,
        metadata: e
      });
    });

    outbox.forEach((o) => {
      combined.push({
        id: o.id,
        x: 0,
        y: 80,
        label: `PENDENTE: ${o.method} ${o.url.split('/').pop()}`,
        type: 'Outbox',
        timestamp: new Date(o.timestamp).toISOString(),
        severity: o.priority || 3,
        isOffline: true,
        metadata: o
      });
    });

    alerts.forEach((alert) => {
      let alat = null, alon = null;
      if (alert.polygons?.[0]) {
        alat = Number(alert.polygons[0].split(/[,\s]+/)[0]);
        alon = Number(alert.polygons[0].split(/[,\s]+/)[1]);
      }
      if (!filterByDistance(alat, alon)) return;

      const severityMap: Record<string, number> = {
        'Extreme': 5,
        'Severe': 4,
        'Moderate': 3,
        'Minor': 2,
        'Unknown': 1
      };
      const severity = severityMap[alert.severity] || 3;
      combined.push({
        id: `alert-${alert.id}`,
        x: 0,
        y: 100 - ((severity - 1) / 4) * 100,
        label: `ALERTA (${alert.source}): ${alert.event}`,
        type: 'Alert',
        timestamp: alert.effective || new Date().toISOString(),
        severity: severity,
        metadata: alert
      });
    });

    mapAnnotations.forEach((ann) => {
      if (!filterByDistance(ann.lat, ann.lng)) return;
      const severityMap: Record<string, number> = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2 };
      const sev = severityMap[ann.severity || 'low'] || 2;
      combined.push({
        id: `ann-${ann.id}`,
        x: 0,
        y: 100 - ((sev - 1) / 4) * 100,
        label: `ANOTAÇÃO (${ann.recordType}): ${ann.title}`,
        type: ann.recordType,
        timestamp: ann.createdAtUtc || new Date().toISOString(),
        severity: sev,
        metadata: ann
      });
    });

    if (!combined.length) return [];
    const times = combined.map(p => new Date(p.timestamp).getTime());
    const minTs = Math.min(...times);
    const maxTs = Math.max(...times);
    const range = Math.max(1, maxTs - minTs);

    return combined.map(p => ({
      ...p,
      x: ((new Date(p.timestamp).getTime() - minTs) / range) * 95 + 2.5
    }));
  }, [currentDisplayEvents, domainEvents, outbox, alerts, mapAnnotations, spatialFilter]);

  const pickCoordinates = (lat: number, lon: number) => {
    setForm((prev) => ({ ...prev, lat: lat.toFixed(6), lon: lon.toFixed(6) }));
    setOpenEventModal(true);
  };

  const saveEvent = async () => {
    try {
      await createEvent({
        provider: form.provider,
        eventType: form.eventType,
        severity: Number(form.severity),
        title: form.title,
        description: form.description,
        lat: Number(form.lat),
        lon: Number(form.lon),
        countryCode: form.countryCode,
        countryName: form.countryName,
        sourceUrl: form.sourceUrl,
        geometry: areaDraft.length > 2 ? { type: 'Polygon', coordinates: [areaDraft.map(([lat, lon]) => [lon, lat])] } : undefined,
      });
      setOpenEventModal(false);
      setAreaDraft([]);
      await loadData();
    } catch {
      pushNotice({ type: 'error', title: 'Falha ao salvar evento', message: 'Erro de comunicação.' });
    }
  };

  const saveOps = async () => {
    try {
      if (form.lat && form.lon) {
        await operationsApi.createMapAnnotation({
          recordType: opsForm.recordType,
          title: opsForm.incidentTitle || (opsForm.recordType === 'missing_person' ? `Busca: ${opsForm.personName}` : 'Nova Anotação'),
          lat: Number(form.lat),
          lng: Number(form.lon),
          severity: opsForm.severity,
          ...(opsForm.recordType === 'risk_area' ? { radiusMeters: 300 } : {}),
          ...(opsForm.recordType === 'missing_person' ? { 
            personName: opsForm.personName, 
            lastSeenLocation: opsForm.lastSeenLocation || `${form.lat}, ${form.lon}` 
          } : {})
        });
      }
      setOpenOpsModal(false);
      setAreaDraft([]);
      await loadData();
    } catch {
      pushNotice({ type: 'error', title: 'Falha no cadastro operacional', message: 'Erro de comunicação.' });
    }
  };

  const selectedEvent = useMemo(() => {
    if (!hoveredId) return null;
    return events.find(e => `${e.provider}-${e.provider_event_id}` === hoveredId) || 
           domainEvents.find(e => e.id === hoveredId) ||
           alerts.find(a => `alert-${a.id}` === hoveredId) ||
           mapAnnotations.find(m => `ann-${m.id}` === hoveredId);
  }, [hoveredId, events, domainEvents, alerts, mapAnnotations]);

  useEffect(() => {
    if (selectedEvent) {
      setIntelPanelOpen(true);
      const lat = selectedEvent.lat || selectedEvent.payload?.lat || selectedEvent.metadata?.lat || (selectedEvent.polygons?.[0] ? Number(selectedEvent.polygons[0].split(/[,\s]+/)[0]) : null);
      const lon = selectedEvent.lon || selectedEvent.payload?.lon || selectedEvent.metadata?.lng || (selectedEvent.polygons?.[0] ? Number(selectedEvent.polygons[0].split(/[,\s]+/)[1]) : null);
      if (lat && lon) {
        integrationsApi.getWeatherForecast(lat, lon).then(setWeatherIntel).catch(() => setWeatherIntel(null));
      } else {
        setWeatherIntel(null);
      }
    } else {
      setWeatherIntel(null);
    }
  }, [selectedEvent]);

  const handleRegionSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regionFilter) return;
    setIsIntelLoading(true);
    try {
      const data = await integrationsApi.getDisasterIntelligence({ city: regionFilter });
      setIntelReport(data);
      if (data.location?.lat && data.location?.lon) {
         setSpatialFilter({ center: [data.location.lat, data.location.lon], radius: 60000 });
         setMapCenter([data.location.lat, data.location.lon]);
         useMap?.().setView([data.location.lat, data.location.lon], 9);
      }
      setIntelPanelOpen(true);
    } catch (err) {
      console.error(err);
      pushNotice({ type: 'error', title: 'Integração Inativa', message: 'Não foi possível buscar os dados da região.' });
    } finally {
      setIsIntelLoading(false);
    }
  };

  const handleFilterComplete = async (filter: { center: [number, number]; radius: number }) => {
    setIsIntelLoading(true);
    try {
       const data = await integrationsApi.getDisasterIntelligence({ lat: filter.center[0], lon: filter.center[1] });
       setIntelReport(data);
       setIntelPanelOpen(true);
    } catch (err) {
       console.error(err);
    } finally {
       setIsIntelLoading(false);
    }
  };

  return (
    <section className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
      {/* Top Header & Filters - More Compact */}
      <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tighter">Tactical Situation Room</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPERACIONAL</span>
              <span>// {scatterPoints.length} ATIVOS</span>
              {loading && <span className="text-cyan-400 opacity-80 ml-2 animate-pulse tracking-widest">SINC...</span>}
            </div>
          </div>
        </div>

        {/* Global Hotspots */}
        <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4 ml-4">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mr-2"><Crosshair size={10} className="inline mr-1" /> FOCO BRASIL (S.O.S):</span>
          <button onClick={() => triggerHotspot('brazil_floods')} className="px-2 py-1 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-700/50 rounded text-xs text-cyan-200 transition-colors tooltip"><CloudRain size={12} className="inline mr-1" /> Enchentes</button>
          <button onClick={() => triggerHotspot('landslides')} className="px-2 py-1 bg-amber-900/30 hover:bg-amber-800/50 border border-amber-700/50 rounded text-xs text-amber-200 transition-colors"><MapIcon size={12} className="inline mr-1" /> Deslizamentos</button>
          <button onClick={() => triggerHotspot('community_help')} className="px-2 py-1 bg-indigo-900/30 hover:bg-indigo-800/50 border border-indigo-700/50 rounded text-xs text-indigo-200 transition-colors"><HeartHandshake size={12} className="inline mr-1" /> Apoio Comunitário</button>
          <button onClick={() => triggerHotspot('high_alert')} className="px-2 py-1 bg-red-900/30 hover:bg-red-800/50 border border-red-700/50 rounded text-xs text-red-200 transition-colors"><AlertTriangle size={12} className="inline mr-1" /> Alerta Máximo (INMET)</button>
        </div>

        <div className="flex items-center gap-3">
          <form className="relative flex items-center mr-2" onSubmit={handleRegionSearch}>
            <input 
               type="text" 
               placeholder="Filtrar Cidade, UF..." 
               className="bg-slate-800/80 border border-slate-700 text-slate-200 text-[11px] rounded px-3 py-1.5 focus:outline-none focus:border-cyan-500 w-44" 
               value={regionFilter} 
               onChange={e => setRegionFilter(e.target.value)} 
               disabled={isIntelLoading}
            />
            {isIntelLoading ? (
               <div className="absolute right-2 w-3 h-3 rounded-full border-2 border-slate-500 border-t-cyan-400 animate-spin" />
            ) : (
               <button type="submit" className="absolute right-2 text-slate-400 hover:text-cyan-400 cursor-pointer">
                 <Search size={12} />
               </button>
            )}
            {spatialFilter && (
               <button type="button" onClick={() => { setSpatialFilter(null); setIntelReport(null); setRegionFilter(''); }} className="absolute -left-6 text-red-400 hover:text-red-300 tooltip" title="Remover Filtro Lógico">
                 ✖
               </button>
            )}
          </form>

          <CountryDropdown value={country} onChange={setCountry} />
          
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Severidade {minSeverity}+</span>
            <input type="range" min={1} max={5} value={minSeverity} onChange={(e) => setMinSeverity(Number(e.target.value))} className="w-24 h-1.5 rounded-lg appearance-none bg-slate-700 accent-cyan-500" />
          </div>

          <button 
            className="flex items-center gap-2 rounded-md bg-emerald-600/20 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-600/30" 
            onClick={() => setOpenOpsModal(true)}
          >
            <HeartHandshake size={14} /> CADASTRO RÁPIDO
          </button>

          <button 
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold transition-all ${show3D ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} 
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? <MapIcon size={14} /> : <Globe size={14} />}
            {show3D ? 'VISTA 2D' : 'SITUAÇÃO 3D'}
          </button>
        </div>
      </header>

      {/* Main Unified Dashboard Area */}
      <div className="flex-1 relative rounded-2xl border border-white/5 bg-slate-950 overflow-hidden shadow-3xl">
        {/* Unified Map & 3D Layer */}
        <div className="absolute inset-0 z-0">
          {show3D ? (
            <Tactical3DMap 
              events={events.concat(domainEvents)} 
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(p: any) => setHoveredId(p.id || `${p.provider}-${p.provider_event_id}`)}
              enableSimulationBox={tool === 'simulation_box'}
            />
          ) : (
            <MapContainer center={mapCenter} zoom={4} style={{ height: '100%', width: '100%' }} className="tactical-map-container">
              {mapLayer === 'dark' ? (
                <TileLayer attribution='&copy; CARTO' url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' />
              ) : (
                <>
                  <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' opacity={0.4} />
                  {/* Public SoilGrids WMS for World Soil Data */}
                  <TileLayer 
                    url='https://maps.isric.org/mapserv?map=/map/wrb.map&LAYERS=MostProbable&TRANSPARENT=true&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256' 
                    opacity={0.6}
                  />
                </>
              )}
              <MapRecenter center={mapCenter} />
              <MapInteractions 
                tool={tool} 
                onPickPoint={pickCoordinates} 
                onHover={(lat, lon) => setHover({ lat, lon })} 
                areaDraft={areaDraft} 
                setAreaDraft={setAreaDraft} 
                spatialFilter={spatialFilter} 
                setSpatialFilter={setSpatialFilter} 
                onFilterComplete={handleFilterComplete} 
              />
              
              {spatialFilter && spatialFilter.radius > 0 && (
                <Circle center={spatialFilter.center} radius={spatialFilter.radius} pathOptions={{ color: '#2dd4bf', fillColor: '#2dd4bf', fillOpacity: 0.1, dashArray: '4,4' }} />
              )}

              {hover && (
                <CircleMarker center={[hover.lat, hover.lon]} radius={4} pathOptions={{ color: '#22d3ee', fillOpacity: 0.9 }}>
                  <Popup>Cursor: {hover.lat.toFixed(5)}, {hover.lon.toFixed(5)}</Popup>
                </CircleMarker>
              )}

              {currentDisplayEvents.map((e) => {
                const id = `${e.provider}-${e.provider_event_id}`;
                const isHovered = hoveredId === id;
                const iconHtml = renderToString(getEventIcon(e.event_type || e.type, isHovered));
                
                return (
                  <Marker 
                    key={id} 
                    position={[e.lat, e.lon]} 
                    icon={L.divIcon({
                      html: `<div class="tactical-marker ${isHovered ? 'hovered' : ''}" style="color: ${isHovered ? '#22d3ee' : getSeverityColor(e.severity)}">${iconHtml}</div>`,
                      className: 'custom-div-icon',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                    eventHandlers={{
                      mouseover: () => setHoveredId(id),
                      mouseout: () => setHoveredId(null)
                    }}
                  >
                    <Popup className="tactical-popup">
                      <div className="font-mono text-xs p-1">
                        <div className="font-bold border-b border-white/10 mb-2 pb-1 text-cyan-400">{e.title}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-slate-500 uppercase text-[9px]">Tipo:</span>
                          <span className="text-slate-200">{e.event_type}</span>
                          <span className="text-slate-500 uppercase text-[9px]">Status:</span>
                          <span className="text-emerald-400 font-bold">Monitorando</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {mapAnnotations.map((ann) => {
                const id = `ann-${ann.id}`;
                const isHovered = hoveredId === id;
                const iconType = ann.recordType === 'missing_person' ? 'search' : ann.recordType === 'support_point' ? 'donation' : 'risk';
                const iconHtml = renderToString(getEventIcon(iconType, isHovered));
                
                return (
                  <Marker 
                    key={id} 
                    position={[ann.lat, ann.lng]} 
                    icon={L.divIcon({
                      html: `<div class="tactical-marker ${isHovered ? 'hovered' : ''}" style="color: ${isHovered ? '#22d3ee' : '#eab308'}">${iconHtml}</div>`,
                      className: 'custom-div-icon',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                    eventHandlers={{
                      mouseover: () => setHoveredId(id),
                      mouseout: () => setHoveredId(null)
                    }}
                  >
                    <Popup className="tactical-popup">
                      <div className="font-mono text-xs p-1">
                        <div className="font-bold border-b border-white/10 mb-2 pb-1 text-yellow-500">{ann.title}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-slate-500 uppercase text-[9px]">Tipo:</span>
                          <span className="text-slate-200">{ann.recordType}</span>
                          <span className="text-slate-500 uppercase text-[9px]">Inserido em:</span>
                          <span className="text-slate-200">{ann.createdAtUtc ? format(new Date(ann.createdAtUtc), 'dd/MM HH:mm') : 'Agora'}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {alerts.map((alert) => {
                if (!alert.polygons || !alert.polygons.length) return null;
                return alert.polygons.map((polyString, idx) => {
                  const rawChunks = polyString.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
                  const points: Array<[number, number]> = [];
                  for (let i = 0; i < rawChunks.length - 1; i += 2) {
                    let lat = Number(rawChunks[i]);
                    let lon = Number(rawChunks[i + 1]);
                    if (!isNaN(lat) && !isNaN(lon)) {
                      if (Math.abs(lat) > 90 && Math.abs(lon) <= 90) {
                        const temp = lat; lat = lon; lon = temp;
                      } else if (lat >= -75 && lat <= -25 && lon >= -35 && lon <= 10) {
                        const temp = lat; lat = lon; lon = temp;
                      }
                      points.push([lat, lon]);
                    }
                  }
                  if (points.length < 3) return null;
                  
                  const color = alert.severity === 'Extreme' ? '#ef4444' : alert.severity === 'Severe' ? '#f97316' : '#eab308';
                  return (
                    <Polygon 
                      key={`${alert.id}-${idx}`} 
                      positions={points} 
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 2 }}
                      eventHandlers={{
                        mouseover: () => setHoveredId(`alert-${alert.id}`),
                        mouseout: () => setHoveredId(null)
                      }}
                    >
                      <Popup className="tactical-popup">
                        <div className="font-mono text-xs p-1 min-w-[200px]">
                          <div className="font-bold border-b border-white/10 mb-2 pb-1" style={{color}}>{alert.event || 'Alerta Oficial'}</div>
                          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                            <span className="text-slate-500 uppercase text-[9px]">Severidade:</span>
                            <span className="text-slate-200">{alert.severity}</span>
                            <span className="text-slate-500 uppercase text-[9px]">Fonte:</span>
                            <span className="text-slate-200">{alert.source}</span>
                            <span className="text-slate-500 uppercase text-[9px]">Área:</span>
                            <span className="text-slate-200 text-[10px] leading-tight max-h-20 overflow-y-auto custom-scrollbar">{alert.area?.join(', ')}</span>
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                });
              })}

              {areaDraft.length > 1 && <Polyline positions={areaDraft} pathOptions={{ color: '#06b6d4', weight: 2, dashArray: '5, 5' }} />}
              {areaDraft.length > 2 && <Polygon positions={areaDraft} pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.2 }} />}
            </MapContainer>
          )}
        </div>

        {/* Floating Tool Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="flex flex-col gap-1 p-1 bg-slate-900/80 border border-white/10 rounded-lg backdrop-blur-md shadow-2xl">
            {[
              { id: 'inspect', icon: <MousePointer2 size={16} />, label: 'Inspecionar' },
              { id: 'point', icon: <Target size={16} />, label: 'Ponto' },
              { id: 'area', icon: <Maximize2 size={16} />, label: 'Área' },
              { id: 'filter_area', icon: <Crosshair size={16} />, label: 'Filtro Circular' },
              { id: 'simulation_box', icon: <Box size={16} />, label: 'Área 3D (Simulação)' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id as ToolMode)}
                className={`flex h-10 w-10 items-center justify-center rounded-md transition-all ${tool === t.id ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
            <button onClick={() => { setFilteredEvents(events); setCountry(''); }} className="h-9 px-4 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all">
              RESET
            </button>
            <button
              onClick={() => setShow3D(!show3D)}
              className={`h-9 px-4 rounded-md text-xs font-bold transition-all ${
                show3D ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              MODO 3D
            </button>
            <button
              onClick={() => setMapLayer(prev => prev === 'dark' ? 'soil' : 'dark')}
              className={`flex items-center gap-2 h-9 px-4 rounded-md text-xs font-bold transition-all border ${
                mapLayer === 'soil' ? 'bg-amber-900/50 border-amber-500/50 text-amber-200' : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Layers size={14} />
              {mapLayer === 'soil' ? 'MAPA DE SOLO (ISRIC)' : 'MAPA TÁTICO'}
            </button>
          </div>
          
          {tool !== 'inspect' && tool !== 'simulation_box' && (
            <div className="bg-cyan-500/20 border border-cyan-500/50 px-3 py-1.5 rounded-md animate-in fade-in slide-in-from-left duration-300 backdrop-blur-md">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {tool === 'point' ? 'MODO CAPTURA ATIVO' : 'MODO ÁREA ATIVO'}
              </span>
            </div>
          )}
        </div>

        {/* Scenario Sandbox UI */}
        {show3D && tool === 'simulation_box' && (
          <ScenarioBuilderPanel onClose={() => setTool('inspect')} />
        )}
        {/* Intelligence / Selection Sidebar */}
        <aside className={`absolute top-4 right-4 z-20 w-80 max-h-[calc(100%-120px)] bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-3xl transition-all duration-300 transform overflow-hidden flex flex-col ${intelPanelOpen && (selectedEvent || intelReport) ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              SITUATION INTEL
            </h3>
            <button onClick={() => setIntelPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors"><Minimize2 size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {intelReport && !selectedEvent && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><Crosshair size={10} /> Relatório Zonal de Risco</div>
                  <h4 className="text-lg font-bold text-slate-100 leading-tight">Inteligência Regional</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-500 uppercase font-bold text-[8px]">Nível de Risco</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className={`w-2 h-2 rounded-full ${i < (intelReport.risk_level === 'CRITICAL' ? 5 : intelReport.risk_level === 'HIGH' ? 4 : intelReport.risk_level === 'MEDIUM' ? 3 : 2) ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-slate-200">{intelReport.risk_level}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-500 uppercase font-bold text-[8px]">Alertas Ativos</div>
                    <div className="text-slate-200 mt-1 font-mono">{intelReport.alerts?.length || 0} Registros</div>
                  </div>
                </div>

                {intelReport.weather && intelReport.weather.current && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><CloudRain size={10} /> Meteorologia Local</div>
                    <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/20 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Chuva</span>
                        <span className="text-cyan-400 font-mono font-bold text-sm">{intelReport.weather.current.rain_mm || 0} mm</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Temp.</span>
                        <span className="text-orange-400 font-mono font-bold text-sm">{intelReport.weather.current.temp_c || '--'} °C</span>
                      </div>
                    </div>
                  </div>
                )}

                {intelReport.recommendations && intelReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Recomendações Táticas</div>
                    <ul className="p-3 bg-red-950/20 rounded-lg border border-red-500/20 text-[10px] text-red-200 font-mono leading-relaxed list-disc list-inside">
                      {intelReport.recommendations.map((rec: string, idx: number) => <li key={idx} className="mb-1">{rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedEvent && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Identificação</div>
                  <h4 className="text-lg font-bold text-slate-100 leading-tight">{selectedEvent.title}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-500 uppercase font-bold text-[8px]">Severidade</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= (selectedEvent.severity || 1) ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-slate-200">{(selectedEvent.severity || 1)}/5</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-500 uppercase font-bold text-[8px]">Início</div>
                    <div className="text-slate-200 mt-1">{selectedEvent.start_at || selectedEvent.timestamp || selectedEvent.effective || selectedEvent.createdAtUtc ? format(new Date(selectedEvent.start_at || selectedEvent.timestamp || selectedEvent.effective || selectedEvent.createdAtUtc), 'dd/MM HH:mm') : 'Desconhecido'}</div>
                  </div>
                </div>

                {weatherIntel && weatherIntel.current && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><CloudRain size={10} /> Meteorologia Local (24h)</div>
                    <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/20 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Chuva</span>
                        <span className="text-cyan-400 font-mono font-bold text-sm">{(weatherIntel.current as any).rain_mm || 0} mm</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Temperatura</span>
                        <span className="text-orange-400 font-mono font-bold text-sm">{(weatherIntel.current as any).temp_c || '--'} °C</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Análise de Dados</div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-white/5 text-[10px] text-slate-400 font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                    {selectedEvent.description || "Nenhuma descrição detalhada disponível."}
                  </div>
                </div>

                {selectedEvent.source_url && (
                  <a 
                    href={selectedEvent.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] uppercase hover:bg-cyan-500/20 transition-all"
                  >
                    Abrir Fonte Original <Maximize2 size={12} />
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Crosshair Overlay for Capture Mode */}
        {tool !== 'inspect' && !show3D && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="relative">
              <div className="absolute w-[200px] h-px bg-cyan-500/20 -translate-x-[100px]" />
              <div className="absolute w-px h-[200px] bg-cyan-500/20 -translate-y-[100px]" />
              <div className="absolute w-24 h-24 border border-dashed border-cyan-500/30 rounded-full -translate-x-12 -translate-y-12 animate-[spin_10s_linear_infinite]" />
              <div className="absolute w-4 h-4 border border-cyan-400 -translate-x-2 -translate-y-2 animate-pulse" />
              <Target size={16} className="absolute -translate-x-2 -translate-y-2 text-cyan-400 opacity-50" />
            </div>
          </div>
        )}

        {/* Bottom Timeline Tray */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${showTimeline ? 'h-64' : 'h-10'}`}>
          <div className="absolute top-0 right-4 -translate-y-full flex gap-1 items-end pointer-events-auto">
            <button 
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-slate-900/90 border-t border-x border-white/10 text-cyan-400 font-black text-[9px] uppercase tracking-widest backdrop-blur-xl shadow-2xl hover:bg-slate-800 transition-all"
            >
              {showTimeline ? <PanelBottomClose size={14} /> : <PanelBottomOpen size={14} />}
              {showTimeline ? 'Minimizar Timeline' : 'SITUATION TIMELINE'}
            </button>
          </div>
          <div className="h-full w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
             <EventScatterPlot 
               points={scatterPoints} 
               hoveredId={hoveredId}
               onHover={(p) => setHoveredId(p?.id || null)}
               onClick={(p) => {
                 setHoveredId(p.id);
                 if (p.metadata?.lat && p.metadata?.lon) {
                   setMapCenter([p.metadata.lat, p.metadata.lon]);
                 }
               }}
             />
          </div>
        </div>
      </div>

      <Modal title="Cadastrar evento global" open={openEventModal} onClose={() => setOpenEventModal(false)}>
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <select value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2">
            {PROVIDER_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={form.eventType} onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2">
            {EVENT_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Título do evento" />
          <input type="number" min={1} max={5} value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: Number(e.target.value) }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Severidade" />
          <input value={form.lat} onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Latitude" />
          <input value={form.lon} onChange={(e) => setForm((p) => ({ ...p, lon: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Longitude" />
          <input value={form.countryCode} onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value.toUpperCase() }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="ISO2" />
          <input value={form.countryName} onChange={(e) => setForm((p) => ({ ...p, countryName: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="País" />
          <input value={form.sourceUrl} onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 md:col-span-2" placeholder="URL da fonte" />
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 md:col-span-2" placeholder="Descrição" rows={3} />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border border-slate-700 px-3 py-2 text-xs" onClick={() => setOpenEventModal(false)}>Cancelar</button>
          <button className="rounded bg-cyan-600 px-3 py-2 text-xs" onClick={() => void saveEvent()}>Salvar evento</button>
        </div>
      </Modal>

      <Modal title="Cadastro operacional rápido" open={openOpsModal} onClose={() => setOpenOpsModal(false)}>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <select value={opsForm.recordType} onChange={(e) => setOpsForm((p) => ({ ...p, recordType: e.target.value as any }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-cyan-400 font-bold">
            <option value="risk_area">⚠️ Área de Risco / Ocorrência</option>
            <option value="support_point">🤝 Ponto de Apoio / Abrigo</option>
            <option value="missing_person">🔍 Pessoa Desaparecida</option>
          </select>
          <input value={opsForm.incidentTitle} onChange={(e) => setOpsForm((p) => ({ ...p, incidentTitle: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Título (ex: Deslizamento Morro X)" />
          <select value={opsForm.severity} onChange={(e) => setOpsForm((p) => ({ ...p, severity: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2">
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
          {opsForm.recordType === 'missing_person' && (
            <>
              <input value={opsForm.personName} onChange={(e) => setOpsForm((p) => ({ ...p, personName: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Nome da pessoa" />
              <input value={opsForm.lastSeenLocation} onChange={(e) => setOpsForm((p) => ({ ...p, lastSeenLocation: e.target.value }))} className="rounded border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Último local visto" />
            </>
          )}
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border border-slate-700 px-3 py-2 text-xs" onClick={() => setOpenOpsModal(false)}>Cancelar</button>
          <button className="rounded bg-emerald-600 px-3 py-2 text-xs" onClick={() => void saveOps()}>Salvar cadastro</button>
        </div>
      </Modal>
    </section>
  );
}

function getSeverityColor(severity: number): string {
  if (severity >= 5) return '#ef4444';
  if (severity >= 4) return '#f97316';
  if (severity >= 3) return '#eab308';
  return '#10b981';
}

function getEventIcon(type: string, isHovered: boolean) {
  const size = isHovered ? 24 : 20;
  const t = type.toLowerCase();
  if (t.includes('flood') || t.includes('water')) return <Waves size={size} />;
  if (t.includes('storm') || t.includes('wind')) return <CloudRain size={size} />;
  if (t.includes('wildfire') || t.includes('fire')) return <Flame size={size} />;
  if (t.includes('earthquake')) return <Zap size={size} />;
  if (t.includes('rescue')) return <Target size={size} />;
  if (t.includes('search')) return <Search size={size} />;
  if (t.includes('donation')) return <HeartHandshake size={size} />;
  return <AlertTriangle size={size} />;
}
