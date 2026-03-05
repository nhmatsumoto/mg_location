import { useEffect, useMemo, useState, memo, useCallback, lazy, Suspense } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { format } from 'date-fns';
import { MapContainer, Polygon, Popup, TileLayer, WMSTileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { Modal } from '../components/ui/Modal';
import { createEvent, getEvents } from '../services/disastersApi';
import { operationsApi, type MapAnnotationDto } from '../services/operationsApi';
import { eventsApi, type DomainEvent } from '../services/eventsApi';
import { integrationsApi, type AlertDto } from '../services/integrationsApi';
import { syncEngine, type OutboxCommand } from '../lib/SyncEngine';
import { useNotifications } from '../context/NotificationsContext';
import { EventScatterPlot, type ScatterPoint } from '../components/EventScatterPlot';
const Tactical3DMap = lazy(() => import('../components/map/Tactical3DMap').then(m => ({ default: m.Tactical3DMap })));
import { Globe, Target, AlertTriangle, CloudRain, Zap, Flame, Waves, Search, HeartHandshake, Maximize2, PanelBottomClose, PanelBottomOpen, MousePointer2, Layers, Crosshair, Box, BarChart3 } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import { CountryDropdown } from '../components/ui/CountryDropdown';

type ToolMode = 'inspect' | 'point' | 'area' | 'filter_area' | 'simulation_box';

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

const MemoizedEventMarker = memo(({ e, isHovered, onHover, onUnhover }: { e: any, isHovered: boolean, onHover: (id: string) => void, onUnhover: () => void }) => {
  const id = `${e.provider}-${e.provider_event_id}`;
  const iconHtml = renderToString(getEventIcon(e.event_type || e.type, isHovered));
  return (
    <Marker 
      position={[e.lat, e.lon]} 
      icon={L.divIcon({
        html: `<div class="tactical-marker ${isHovered ? 'hovered' : ''}" style="color: ${isHovered ? '#22d3ee' : getSeverityColor(e.severity)}">${iconHtml}</div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })}
      eventHandlers={{
        mouseover: () => onHover(id),
        mouseout: onUnhover
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
});

const MemoizedAnnotationMarker = memo(({ ann, isHovered, onHover, onUnhover }: { ann: any, isHovered: boolean, onHover: (id: string) => void, onUnhover: () => void }) => {
  const id = `ann-${ann.id}`;
  const iconType = ann.recordType === 'missing_person' ? 'search' : ann.recordType === 'support_point' ? 'donation' : 'risk';
  const iconHtml = renderToString(getEventIcon(iconType, isHovered));
  return (
    <Marker 
      position={[ann.lat, ann.lng]} 
      icon={L.divIcon({
        html: `<div class="tactical-marker ${isHovered ? 'hovered' : ''}" style="color: ${isHovered ? '#22d3ee' : '#eab308'}">${iconHtml}</div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })}
      eventHandlers={{
        mouseover: () => onHover(id),
        mouseout: onUnhover
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
});

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
  const [intelPanelOpen, setIntelPanelOpen] = useState(false);

  const [country, setCountry] = useState('BR');
  const [minSeverity, setMinSeverity] = useState(1);
  const [tool, setTool] = useState<ToolMode>('inspect');
  const [mapLayer, setMapLayer] = useState<'dark' | 'soil'>('dark');
  const [areaDraft, setAreaDraft] = useState<Array<[number, number]>>([]);
  const [spatialFilter, setSpatialFilter] = useState<{ center: [number, number], radius: number } | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [intelReport, setIntelReport] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);

  const handleMarkerHover = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleMarkerUnhover = useCallback(() => {
    setHoveredId(null);
  }, []);

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
    <div className="h-screen w-screen relative overflow-hidden bg-slate-950">
      {/* Top Header - Ultra Tactical */}
      <header className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 rounded-full border border-cyan-500/30 bg-slate-900/80 px-6 py-2 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="relative">
             <Globe className="h-5 w-5 text-cyan-400 animate-pulse" />
             <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em] leading-none">Command Center</h2>
            <span className="text-[8px] text-cyan-500/70 font-mono mt-1">SITUATION_ROOM_v4 // {scatterPoints.length} SENSORS_OK</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Filtro Local:</span>
            <CountryDropdown value={country} onChange={setCountry} />
          </div>

          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/5 bg-slate-950/50">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Impacto {minSeverity}+</span>
            <input type="range" min={1} max={5} value={minSeverity} onChange={(e) => setMinSeverity(Number(e.target.value))} className="w-20 h-1 rounded-lg appearance-none bg-slate-800 accent-cyan-500" />
          </div>

          <div className="flex gap-1 h-8">
            <button onClick={() => triggerHotspot('brazil_floods')} className="px-3 rounded-full bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/30 text-[10px] uppercase font-bold text-cyan-100 transition-all flex items-center gap-1.5">
              <CloudRain size={12} /> S.O.S RS/MG
            </button>
            <button onClick={() => triggerHotspot('high_alert')} className="px-3 rounded-full bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-[10px] uppercase font-bold text-red-100 transition-all flex items-center gap-1.5">
              <AlertTriangle size={12} /> Alerta Máximo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-6 border-l border-white/10">
          <form className="relative flex items-center" onSubmit={handleRegionSearch}>
            <input 
               type="text" 
               placeholder="COORD_LAT_LON / CITY_ID" 
               className="bg-slate-950/50 border border-white/10 text-cyan-100 text-[10px] font-mono rounded-full px-4 py-1.5 focus:outline-none focus:border-cyan-500/50 w-48 placeholder:text-slate-600" 
               value={regionFilter} 
               onChange={e => setRegionFilter(e.target.value)} 
               disabled={isIntelLoading}
            />
            {isIntelLoading && <div className="absolute right-3 w-2 h-2 rounded-full border-2 border-slate-500 border-t-cyan-400 animate-spin" />}
          </form>
          
          <button 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 transition-all hover:bg-emerald-500/30" 
            onClick={() => setOpenOpsModal(true)}
            title="REGISTRAR OCORRÊNCIA"
          >
            <HeartHandshake size={14} />
          </button>
        </div>
      </header>

      {/* Main Unified Dashboard Area */}
      <div className="absolute inset-0 z-0">
        {show3D ? (
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-900 text-cyan-500 font-mono animate-pulse uppercase tracking-widest">Iniciando motor tático 3D...</div>}>
            <Tactical3DMap 
              events={events.concat(domainEvents)} 
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(p: any) => {
                setHoveredId(p.id || `${p.provider}-${p.provider_event_id}`);
                setIntelPanelOpen(true);
              }}
              enableSimulationBox={tool === 'simulation_box'}
            />
          </Suspense>
        ) : (
          <MapContainer center={mapCenter} zoom={4} zoomControl={false} style={{ height: '100%', width: '100%' }} className="tactical-map-container">
            {mapLayer === 'dark' ? (
              <TileLayer attribution='&copy; CARTO' url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' />
            ) : (
              <>
                <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' opacity={0.4} />
                <WMSTileLayer 
                  url='https://maps.isric.org/mapserv?map=/map/wrb.map' 
                  layers='MostProbable'
                  format='image/png'
                  transparent={true}
                  version='1.1.1'
                  opacity={0.6}
                />
              </>
            )}
            <MapRecenter center={mapCenter} />
            <MapInteractions 
              tool={tool} 
              onPickPoint={pickCoordinates} 
              onHover={() => {}} 
              areaDraft={areaDraft} 
              setAreaDraft={setAreaDraft} 
              spatialFilter={spatialFilter} 
              setSpatialFilter={setSpatialFilter} 
              onFilterComplete={handleFilterComplete} 
            />
            
            <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
              {currentDisplayEvents.map((e) => {
                const id = `${e.provider}-${e.provider_event_id}`;
                return (
                  <MemoizedEventMarker 
                    key={id} 
                    e={e} 
                    isHovered={hoveredId === id}
                    onHover={handleMarkerHover}
                    onUnhover={handleMarkerUnhover}
                  />
                );
              })}
              {mapAnnotations.map((ann) => {
                const id = `ann-${ann.id}`;
                return (
                  <MemoizedAnnotationMarker 
                    key={id} 
                    ann={ann} 
                    isHovered={hoveredId === id}
                    onHover={handleMarkerHover}
                    onUnhover={handleMarkerUnhover}
                  />
                );
              })}
            </MarkerClusterGroup>

            {alerts.map((alert) => {
              if (!alert.polygons || !alert.polygons.length) return null;
              return alert.polygons.map((polyString, idx) => {
                 const rawChunks = polyString.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
                 const points: Array<[number, number]> = [];
                 for (let i = 0; i < rawChunks.length - 1; i += 2) {
                   let lat = Number(rawChunks[i]);
                   let lon = Number(rawChunks[i + 1]);
                   if (!isNaN(lat) && !isNaN(lon)) {
                     if (Math.abs(lat) > 90 && Math.abs(lon) <= 90) { const temp = lat; lat = lon; lon = temp; }
                     else if (lat >= -75 && lat <= -25 && lon >= -35 && lon <= 10) { const temp = lat; lat = lon; lon = temp; }
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
                   />
                 );
              });
            })}
          </MapContainer>
        )}
      </div>

      {/* Floating Tool Controls - Left */}
      <div className="absolute top-24 left-6 z-20 flex flex-col gap-3">
        <div className="flex flex-col gap-2 p-1.5 bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
          {[
            { id: 'inspect', icon: <MousePointer2 size={18} />, label: 'Inspecionar' },
            { id: 'point', icon: <Target size={18} />, label: 'Ponto' },
            { id: 'area', icon: <Maximize2 size={18} />, label: 'Área' },
            { id: 'filter_area', icon: <Crosshair size={18} />, label: 'Filtro Circular' },
            { id: 'simulation_box', icon: <Box size={18} />, label: 'Simulação 3D' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as ToolMode)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${tool === t.id ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 p-1.5 bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl">
           <button
            onClick={() => setShow3D(!show3D)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${show3D ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="SITUAÇÃO 3D"
          >
            <Globe size={18} />
          </button>
          <button
            onClick={() => setMapLayer(prev => prev === 'dark' ? 'soil' : 'dark')}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${mapLayer === 'soil' ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="CAMADA DE SOLO (ISRIC)"
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Integrated Scatter Plot Section */}
      <footer className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-500 transform ${showTimeline ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
        <div className="h-[200px] w-full bg-slate-950/80 backdrop-blur-xl border-t border-cyan-500/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <BarChart3 size={14} /> SCATTER_EVENT_TIMELINE_V3
              </h3>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-[9px] text-slate-500 font-mono">STREAMING ATIVO // {scatterPoints.length} OBJETOS_DETECTADOS</div>
            </div>
            <button 
              onClick={() => setShowTimeline(!showTimeline)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              {showTimeline ? <PanelBottomClose size={18} /> : <PanelBottomOpen size={18} />}
            </button>
          </div>
          <div className="flex-1">
            <EventScatterPlot 
              points={scatterPoints} 
              hoveredId={hoveredId}
              onHover={(p) => setHoveredId(p?.id || null)}
              onClick={(p) => {
                if (p.metadata?.lat && p.metadata?.lon) {
                  setMapCenter([p.metadata.lat, p.metadata.lon]);
                } else if (p.metadata?.payload?.lat) {
                  setMapCenter([p.metadata.payload.lat, p.metadata.payload.lng]);
                }
                setHoveredId(p.id);
                setIntelPanelOpen(true);
              }}
            />
          </div>
        </div>
      </footer>

      {/* Intelligence Sidebar Overlay */}
      <aside className={`absolute top-24 right-6 z-20 w-80 max-h-[calc(100%-250px)] bg-slate-900/80 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-3xl transition-all duration-500 transform overflow-hidden flex flex-col ${intelPanelOpen && (selectedEvent || intelReport) ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+100px)] opacity-0'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              SITUATION INTEL
            </h3>
            <button onClick={() => setIntelPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors"><Maximize2 size={14} className="rotate-45" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/50">
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

                {intelReport.recommendations && intelReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Recomendações</div>
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

                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Análise de Dados</div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-white/5 text-[10px] text-slate-400 font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                    {selectedEvent.description || "Nenhuma descrição disponível."}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-950/50 border-t border-white/5">
             <button 
                onClick={() => setIntelPanelOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
             >
                FECHAR RELATÓRIO
             </button>
          </div>
      </aside>

      {/* Crosshair Overlay */}
      {tool !== 'inspect' && !show3D && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="relative">
              <div className="absolute w-[200px] h-px bg-cyan-500/20 -translate-x-[100px]" />
              <div className="absolute w-px h-[200px] bg-cyan-500/20 -translate-y-[100px]" />
              <div className="absolute w-12 h-12 border border-cyan-400/50 rounded -translate-x-6 -translate-y-6 animate-pulse" />
            </div>
          </div>
      )}

      {/* Modals */}
      <Modal title="NOTIFICAR EVENTO GLOBAL" open={openEventModal} onClose={() => setOpenEventModal(false)}>
        <div className="space-y-4 p-4 text-slate-200 bg-slate-950">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Capa de Dados</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})}>
                {PROVIDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Severidade</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs" value={form.severity} onChange={e => setForm({...form, severity: Number(e.target.value)})}>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Título do Incidente</label>
            <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs" placeholder="Ex: Inundação Severa..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <button onClick={saveEvent} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded text-xs transition-colors tracking-widest uppercase">TRANSMITIR DADOS</button>
        </div>
      </Modal>

      <Modal title="REGISTRO OPERACIONAL DE CAMPO" open={openOpsModal} onClose={() => setOpenOpsModal(false)}>
        <div className="space-y-4 p-4 text-slate-200 bg-slate-950">
           <div className="grid grid-cols-2 gap-2">
              {['risk_area', 'support_point', 'missing_person'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setOpsForm({...opsForm, recordType: mode as any})}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${opsForm.recordType === mode ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  {mode === 'risk_area' ? <AlertTriangle size={20} /> : mode === 'support_point' ? <HeartHandshake size={20} /> : <Search size={20} />}
                  <span className="text-[10px] font-bold uppercase">{mode.replace('_', ' ')}</span>
                </button>
              ))}
           </div>
           <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição / Identificação</label>
              <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs" placeholder="Identificador da ocorrência..." value={opsForm.incidentTitle} onChange={e => setOpsForm({...opsForm, incidentTitle: e.target.value})} />
           </div>
           <button onClick={saveOps} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition-colors tracking-widest uppercase">GRAVAR REGISTRO</button>
        </div>
      </Modal>
    </div>
  );
}

function getSeverityColor(severity: number): string {
  if (severity >= 5) return '#f43f5e';
  if (severity >= 4) return '#f97316';
  if (severity >= 3) return '#eab308';
  return '#22d3ee';
}

function getEventIcon(type: string, isHovered: boolean) {
  const t = (type || '').toLowerCase();
  if (t.includes('flood')) return <Waves className={isHovered ? 'animate-bounce' : ''} />;
  if (t.includes('earthquake')) return <Zap className={isHovered ? 'animate-pulse' : ''} />;
  if (t.includes('wildfire') || t.includes('fire')) return <Flame className={isHovered ? 'animate-pulse' : ''} />;
  if (t.includes('storm') || t.includes('cyclone')) return <CloudRain className={isHovered ? 'animate-bounce' : ''} />;
  if (t.includes('search') || t.includes('missing')) return <Search className={isHovered ? 'animate-pulse' : ''} />;
  if (t.includes('donation') || t.includes('support')) return <HeartHandshake className={isHovered ? 'animate-pulse' : ''} />;
  return <AlertTriangle className={isHovered ? 'animate-pulse' : ''} />;
}
