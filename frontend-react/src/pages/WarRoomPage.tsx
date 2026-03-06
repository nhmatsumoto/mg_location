import { useEffect, useMemo, useState, memo, useCallback, lazy, Suspense } from 'react';
import { latToMeters, lonToMeters } from '../utils/projection';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Rectangle } from 'react-leaflet';
import { Modal } from '../components/ui/Modal';
import { getEvents } from '../services/disastersApi';
import { operationsApi, type MapAnnotationDto, type OperationsSnapshot } from '../services/operationsApi';
import { eventsApi, type DomainEvent } from '../services/eventsApi';
import { integrationsApi, type AlertDto } from '../services/integrationsApi';
import { useNotifications } from '../context/NotificationsContext';
import { DraggablePanel } from '../components/map/DraggablePanel';
import { KpiCard } from '../components/ui/KpiCard';
import { QuickActions } from '../components/ui/QuickActions';
import { useSimulationStore } from '../store/useSimulationStore';

import { useNavigate } from 'react-router-dom';
import { TacticalLoadingScreen } from '../components/ui/TacticalLoadingScreen';
const Tactical3DMap = lazy(() => import('../components/map/Tactical3DMap').then(m => ({ default: m.Tactical3DMap })));
import type { SituationalSnapshot } from '../types';
import { 
  CloudRain, 
  MapPin,
  Globe,
  AlertTriangle,
  Users,
  PackageOpen,
  MousePointer2,
  Box,
  Camera,
  Settings2,
  Crosshair
} from 'lucide-react';
import L from 'leaflet';
import { CountryDropdown } from '../components/ui/CountryDropdown';

type ToolMode = 'inspect' | 'point' | 'area' | 'filter_area' | 'simulation_box' | 'snapshot';

interface WeatherSnapshot {
  temp?: number;
  pressure?: number;
  humidity?: number;
  wind_speed?: number;
  rain?: { '1h'?: number };
}

interface WeatherResponse {
  current?: WeatherSnapshot;
}

function MapInteractions({
  tool,
  onPickPoint,
  onHover,
  areaDraft,
  setAreaDraft,
  spatialFilter,
  setSpatialFilter,
  onFilterComplete,
  onSnapshotComplete,
  show3D
}: {
  tool: ToolMode;
  onPickPoint: (lat: number, lon: number) => void;
  onHover: (lat: number, lon: number) => void;
  areaDraft: Array<[number, number]>;
  setAreaDraft: (next: Array<[number, number]>) => void;
  spatialFilter: { center: [number, number], radius: number } | null;
  setSpatialFilter: (next: { center: [number, number], radius: number } | null) => void;
  onFilterComplete: (filter: { center: [number, number], radius: number }) => void;
  onSnapshotComplete: (bounds: Array<[number, number]>) => void;
  show3D: boolean;
}) {
  const map = useMap();
  useMapEvents({
    mousemove(e) {
      if (show3D) return;
      onHover(e.latlng.lat, e.latlng.lng);
      if (tool === 'filter_area' && spatialFilter && !spatialFilter.radius) {
        setSpatialFilter({ ...spatialFilter, radius: map.distance(spatialFilter.center, e.latlng) });
      }
      if ((tool === 'snapshot' || tool === 'simulation_box') && areaDraft.length === 1) {
        setAreaDraft([areaDraft[0], [e.latlng.lat, e.latlng.lng]]);
      }
    },
    click(e) {
      if (show3D) return;
      if (tool === 'point') {
        onPickPoint(e.latlng.lat, e.latlng.lng);
        return;
      }
      if (tool === 'area') {
        setAreaDraft([...areaDraft, [e.latlng.lat, e.latlng.lng]]);
        return;
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
    mousedown(e) {
      if (show3D) return;
      if (tool === 'snapshot' || tool === 'simulation_box') {
        setAreaDraft([[e.latlng.lat, e.latlng.lng]]);
      }
    },
    mouseup(e) {
      if (show3D) return;
      if ((tool === 'snapshot' || tool === 'simulation_box') && areaDraft.length === 1) {
        onSnapshotComplete([areaDraft[0], [e.latlng.lat, e.latlng.lng]]);
        setAreaDraft([]);
      }
    },
    contextmenu() {
      if (show3D) return;
      if (tool === 'area' && areaDraft.length > 2) {
        const [lat, lon] = areaDraft[0];
        onPickPoint(lat, lon);
      }
    },
  });

  return (
    <>
      {!show3D && (tool === 'snapshot' || tool === 'simulation_box') && areaDraft.length === 2 && (
        <Rectangle 
          bounds={[areaDraft[0], areaDraft[1]]} 
          pathOptions={{ color: tool === 'snapshot' ? '#22d3ee' : '#f59e0b', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }} 
        />
      )}
    </>
  );
}

function ToolButton({ active, onClick, icon, label, disabled }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }) {
  return (
    <button 
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300
        ${active 
          ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] translate-x-1' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
        ${disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className={active ? "animate-pulse" : ""}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MapListener({ onMove }: { onMove: (center: [number, number], zoom: number) => void }) {
  const map = useMap();
  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    },
    zoomend() {
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    }
  });
  return null;
}

const MemoizedEventMarker = memo(({ e, isHovered, onHover, onUnhover }: { e: any, isHovered: boolean, onHover: (id: string) => void, onUnhover: () => void }) => {
  const id = `${e.provider}-${e.provider_event_id}`;
  return (
    <Marker 
      position={[e.lat, e.lon]} 
      icon={L.divIcon({
        html: `<div class="tactical-marker ${isHovered ? 'hovered' : ''}" style="color: ${isHovered ? '#22d3ee' : getSeverityColor(e.severity)}"></div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })}
      eventHandlers={{
        mouseover: () => onHover(id),
        mouseout: onUnhover
      }}
    >
    </Marker>
  );
});

export function WarRoomPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [domainEvents, setDomainEvents] = useState<DomainEvent[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [mapAnnotations, setMapAnnotations] = useState<MapAnnotationDto[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-20.91, -42.98]); // Start at Ubá
  const [mapZoom, setMapZoom] = useState(13);
  const [lastClickedCoords, setLastClickedCoords] = useState<[number, number] | null>(null);
  const [show3D, setShow3D] = useState(false);
  
  const [country, setCountry] = useState('BR');
  const [minSeverity] = useState(1);
  const [tool, setTool] = useState<ToolMode>('inspect');
  const [areaDraft, setAreaDraft] = useState<Array<[number, number]>>([]);
  const [spatialFilter, setSpatialFilter] = useState<any>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => setIsGlitching(false), 500);
    return () => clearTimeout(timer);
  }, [show3D]);
  const [activeSnapshots, setActiveSnapshots] = useState<SituationalSnapshot[]>([]);
  const [intelPanelOpen, setIntelPanelOpen] = useState(false);
  const [simulationPanelOpen, setSimulationPanelOpen] = useState(false);

  // War Room Specific State
  const [opsSnapshot, setOpsSnapshot] = useState<OperationsSnapshot | null>(null);

  const { pushNotice } = useNotifications();

  const selectTool = (t: ToolMode) => {
    setTool(t);
    if (t !== 'area' && t !== 'snapshot' && t !== 'simulation_box') setAreaDraft([]);
    if (t !== 'filter_area') setSpatialFilter(null);
    if (t === 'simulation_box') setSimulationPanelOpen(true);
  };

  const [openOpsModal, setOpenOpsModal] = useState(false);
  const [opsForm, setOpsForm] = useState({ 
    recordType: 'risk_area' as 'risk_area' | 'support_point' | 'missing_person', 
    personName: '', 
    lastSeenLocation: '', 
    incidentTitle: '', 
    severity: 'high' 
  });

  const loadData = async () => {
    try {
      const all: any[] = [];
      const resp = await getEvents({ country: country || undefined, minSeverity, page: 1, pageSize: 500 });
      all.push(...resp.items);
      setEvents(all);
      
      const dEvents = await eventsApi.list();
      setDomainEvents(dEvents);
      
      const fetchedAlerts = await integrationsApi.getAlerts();
      setAlerts(fetchedAlerts?.items || []);
      
      const fetchedAnnotations = await operationsApi.listMapAnnotations();
      setMapAnnotations(fetchedAnnotations || []);

      const opSnap = await operationsApi.snapshot();
      setOpsSnapshot(opSnap);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => void loadData(), 15000);
    return () => clearInterval(interval);
  }, [country, minSeverity]);

  const handleMarkerHover = useCallback((id: string) => setHoveredId(id), []);
  const handleMarkerUnhover = useCallback(() => setHoveredId(null), []);
  const handleMapHover = useCallback((_lat: number, _lon: number) => {}, []);

  const currentDisplayEvents = useMemo(() => {
    return country ? events.filter(e => e.country_code === country) : events;
  }, [events, country]);

  const selectedEvent = useMemo(() => {
    if (!hoveredId) return null;
    return (events as any[]).find(e => `${e.provider}-${e.provider_event_id}` === hoveredId) || 
           domainEvents.find(e => e.id === hoveredId) ||
           (alerts as any[]).find(a => `alert-${a.id}` === hoveredId) ||
           (mapAnnotations as any[]).find(m => `ann-${m.id}` === hoveredId);
  }, [hoveredId, events, domainEvents, alerts, mapAnnotations]);

  const handleReset = () => {
    setShow3D(false);
    setMapCenter([-14.2, -51.9]);
    setHoveredId(null);
    setTool('inspect');
  };

  const captureSnapshot = async (bounds: Array<[number, number]>) => {
    try {
      const latMin = Math.min(bounds[0][0], bounds[1][0]);
      const latMax = Math.max(bounds[0][0], bounds[1][0]);
      const lonMin = Math.min(bounds[0][1], bounds[1][1]);
      const lonMax = Math.max(bounds[0][1], bounds[1][1]);

      const centerLat = (latMin + latMax) / 2;
      const centerLon = (lonMin + lonMax) / 2;
      
      // Calculate size in meters using standardized utility
      const latDistance = latToMeters(latMax - latMin);
      const lonDistance = lonToMeters(lonMax - lonMin, centerLat);

      // Update Simulation Box
      useSimulationStore.getState().setBox({
        center: [centerLat, centerLon],
        size: [lonDistance, latDistance]
      });

      // Generate static map URL for satellite texture
      const zoom = 15;
      const x = Math.floor((centerLon + 180) / 360 * Math.pow(2, zoom));
      const y = Math.floor((1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      const textureUrl = `https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/${zoom}/${x}/${y}.png`;
      useSimulationStore.getState().setSatelliteTextureUrl(textureUrl);

      const weather = await integrationsApi.getWeatherForecast(centerLat, centerLon) as WeatherResponse;
      const newSnapshot: SituationalSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        center: [centerLat, centerLon],
        bounds,
        environmentalData: {
          temp: weather.current?.temp,
          pressure: weather.current?.pressure,
          humidity: weather.current?.humidity,
          windSpeed: weather.current?.wind_speed,
          rainfall: weather.current?.rain?.['1h'] || 0,
          soilSaturaion: Math.random() * 100
        }
      };
      setActiveSnapshots(prev => [...prev, newSnapshot]);
      setShow3D(true);
    } catch (err) {
      pushNotice({ type: 'error', title: 'Falha na Captura', message: 'Erro ao processar dados.' });
    }
  };

  const saveOps = async () => {
    if (!lastClickedCoords) {
      pushNotice({ type: 'warning', title: 'Coordenadas ausentes', message: 'Clique no mapa para selecionar o local.' });
      return;
    }

    try {
      await operationsApi.createMapAnnotation({
        recordType: opsForm.recordType,
        title: opsForm.incidentTitle || (opsForm.recordType === 'missing_person' ? `Busca: ${opsForm.personName}` : 'Solicitação de Campo'),
        lat: lastClickedCoords[0],
        lng: lastClickedCoords[1],
        severity: opsForm.severity,
        ...(opsForm.recordType === 'risk_area' ? { radiusMeters: 300 } : {}),
      });
      setOpenOpsModal(false);
      setLastClickedCoords(null);
      await loadData();
      pushNotice({ type: 'success', title: 'Sucesso', message: 'Registro efetuado com sucesso.' });
    } catch {
      pushNotice({ type: 'error', title: 'Falha no cadastro', message: 'Erro de comunicação com o servidor.' });
    }
  };


  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-950">
      {/* HUD - Floating HUD for high level context */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between pointer-events-none">
        <div className="flex gap-4 items-center bg-slate-900/80 border border-white/10 p-2 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-2xl">
          <Globe className="h-5 w-5 text-cyan-400" />
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">WAR ROOM COMMAND</h1>
            <span className="text-[8px] text-cyan-500/70 font-mono">STATUS: OPERATIONAL_v4</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <CountryDropdown value={country} onChange={setCountry} />
        </div>

        <div className="flex gap-2 pointer-events-auto">
           <button onClick={() => setShow3D(!show3D)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl transition-all ${show3D ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'}`}>
             <Box size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">TACTICAL 3D</span>
           </button>
           <button 
             onClick={handleReset} 
             className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 text-slate-400 hover:text-white backdrop-blur-xl transition-all"
             title="Reset View"
           >
             <Crosshair size={16} />
           </button>
        </div>
      </div>

      {/* Map Tools Sidebar - Moved to bottom-right to avoid overlap with Simulation/Intel panels */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col gap-2">
        <div className="bg-slate-900/90 border border-white/5 backdrop-blur-md p-1 rounded-xl shadow-2xl flex flex-col gap-1">
          <ToolButton active={tool === 'inspect'} onClick={() => selectTool('inspect')} icon={<MousePointer2 size={18} />} label="Inspecionar" />
          <ToolButton active={tool === 'point'} onClick={() => selectTool('point')} icon={<MapPin size={18} />} label="Reg. Evento" />
          <ToolButton active={tool === 'area'} onClick={() => selectTool('area')} icon={<Box size={18} />} label="Área Crítica" />
          <div className="h-px bg-white/10 mx-1 my-1" />
          <ToolButton active={tool === 'snapshot'} onClick={() => selectTool('snapshot')} icon={<Camera size={18} />} label="Snapshot" />
          <ToolButton 
            active={simulationPanelOpen} 
            onClick={() => { if (show3D) setSimulationPanelOpen(!simulationPanelOpen); }} 
            icon={<Settings2 size={18} className={!show3D ? "opacity-20" : ""} />} 
            label="Simulação" 
            disabled={!show3D}
          />
        </div>
      </div>

      {/* Top Center: War Room Identity */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <div className="px-6 py-2 bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-full shadow-2xl flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Tactical Operation Center</span>
           </div>
           <div className="h-4 w-px bg-white/10"></div>
           <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest">MG-LOCATION Alpha</span>
        </div>
      </div>

      {/* Top Left: Operational KPIs - Vertical Stack - Pushed down to avoid HUD overlap */}
      {!show3D && (
        <div className="absolute top-28 left-4 z-40 flex flex-col gap-2 w-[180px]">
           <div className="flex items-center gap-2 mb-1 px-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Live Monitor</span>
           </div>
           <KpiCard title="EQUIPES" value={opsSnapshot?.kpis.activeTeams ?? '12'} icon={<Users size={16} />} trend="+2" />
           <KpiCard title="ALERTAS" value={opsSnapshot?.kpis.criticalAlerts ?? '08'} icon={<AlertTriangle size={16} />} trend="CRÍTICO" color="text-amber-400" />
           <KpiCard title="LOGÍSTICA" value={opsSnapshot?.kpis.suppliesInTransit ?? '92'} icon={<PackageOpen size={16} />} trend="-4" />
        </div>
      )}

      {/* 3D Tactical HUD: Meteorological Intelligence */}
      {show3D && (
        <div className="absolute top-28 left-4 z-40 flex flex-col gap-2 w-[220px] animate-in fade-in slide-in-from-left-4 duration-500">
           <div className="flex items-center gap-2 mb-1 px-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Regional Intelligence</span>
           </div>
           
           <div className="bg-slate-950/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CloudRain className="text-cyan-400" size={24} />
                    <div className="flex flex-col">
                       <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Weather</span>
                       <span className="text-lg font-black text-white leading-none tracking-tight text-glow">
                         {useSimulationStore(state => state.focalWeather).temp}°c
                       </span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-mono text-cyan-500/80 uppercase">
                      {useSimulationStore(state => state.focalWeather).description}
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Umidade</span>
                    <span className="text-xs font-black text-slate-200">{useSimulationStore(state => state.focalWeather).humidity}%</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Vento</span>
                    <span className="text-xs font-black text-slate-200">{useSimulationStore(state => state.focalWeather).windSpeed} km/h</span>
                 </div>
              </div>

              <div className="pt-1 flex items-center gap-2 group cursor-help">
                 <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[65%]" />
                 </div>
                 <span className="text-[8px] text-cyan-500 font-black">SOLO_SAT: 65%</span>
              </div>
           </div>
        </div>
      )}

      {/* Bottom Center: Quick Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 group">
        <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 p-2.5 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all group-hover:scale-105 group-hover:border-white/20">
           <QuickActions />
        </div>
      </div>

      {intelPanelOpen && selectedEvent && (
        <DraggablePanel 
          title="SITUATION INTEL" 
          position={{ top: 112, left: 340 }} 
          onDragStart={() => {}} 
          onToggleDock={() => setIntelPanelOpen(false)}
        >
          <div className="p-4 bg-slate-900/90 space-y-4 text-slate-200">
             <div className="space-y-1">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><Crosshair size={10} /> DETALHES</div>
                <h4 className="text-sm font-bold text-slate-100 italic">{(selectedEvent as any).title || (selectedEvent as any).id}</h4>
             </div>
             <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-[10px] font-mono leading-relaxed">
                {(selectedEvent as any).description || "Nenhuma análise adicional disponível."}
             </div>
              <div className="flex justify-between items-center text-[10px]">
                 <span className="text-slate-500 uppercase font-bold">Severidade</span>
                 <span className="text-cyan-400 font-black">LVL_{(selectedEvent as any).severity || 1}</span>
              </div>
              <div className="pt-2">
                 <button 
                   onClick={() => navigate(`/app/splat-scenes/demo-${selectedEvent.id}`)}
                   className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                 >
                   <Box size={14} /> Ver Reconstrução 3D
                 </button>
              </div>
          </div>
        </DraggablePanel>
      )}
      {simulationPanelOpen && show3D && (
        <SimulationCommandPanel onClose={() => setSimulationPanelOpen(false)} />
      )}

      {/* Main Map Content */}
      <div className="absolute inset-0 z-0">
        {show3D ? (
          <Suspense fallback={<TacticalLoadingScreen />}>
            <Tactical3DMap 
              events={events.concat(domainEvents)} 
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(p: any) => {
                setHoveredId(p.id || `${p.provider}-${p.provider_event_id}`);
                setIntelPanelOpen(true);
              }}
              activeSnapshots={activeSnapshots}
              enableSimulationBox={tool === 'simulation_box'}
              initialCenter={mapCenter}
            />
          </Suspense>
        ) : (
          <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%' }} className="tactical-map-container">
            <TileLayer attribution='&copy; CARTO' url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' />
            <MapListener onMove={(c, z) => { setMapCenter(c); setMapZoom(z); }} />
            <MapInteractions 
              tool={tool} 
              onPickPoint={(lat, lon) => { 
                setLastClickedCoords([lat, lon]);
                setOpenOpsModal(true); 
              }} 
              onHover={handleMapHover} 
              areaDraft={areaDraft} 
              setAreaDraft={setAreaDraft} 
              spatialFilter={spatialFilter} 
              setSpatialFilter={setSpatialFilter} 
              onFilterComplete={() => {}} 
              onSnapshotComplete={captureSnapshot}
              show3D={show3D}
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
              {currentDisplayEvents.map((e) => (
                <MemoizedEventMarker key={e.id || `${e.provider}-${e.provider_event_id}`} e={e} isHovered={hoveredId === (e.id || `${e.provider}-${e.provider_event_id}`)} onHover={handleMarkerHover} onUnhover={handleMarkerUnhover} />
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      <Modal title="CADASTRO DE CAMPO" open={openOpsModal} onClose={() => setOpenOpsModal(false)}>
         <div className="space-y-4 p-4 text-slate-200 bg-slate-950">
           <div className="grid grid-cols-2 gap-2">
              {['risk_area', 'support_point', 'missing_person'].map(mode => (
                <button key={mode} onClick={() => setOpsForm({...opsForm, recordType: mode as any})} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${opsForm.recordType === mode ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <span className="text-[10px] font-bold uppercase">{mode.replace('_', ' ')}</span>
                </button>
              ))}
           </div>
           <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs" placeholder="Título..." value={opsForm.incidentTitle} onChange={e => setOpsForm({...opsForm, incidentTitle: e.target.value})} />
           <button onClick={saveOps} className="w-full bg-emerald-600 font-bold py-2 rounded text-xs uppercase tracking-widest">REGISTRAR</button>
         </div>
      </Modal>

       {/* Glitch Overlay Effect */}
       {isGlitching && (
         <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden bg-cyan-500/5 backdrop-blur-[1px] animate-pulse">
            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/20 animate-scan-fast" />
            <div className="absolute top-3/4 left-0 w-full h-[1px] bg-white/20 animate-scan-fast" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[10px] text-white font-black uppercase tracking-[1em] opacity-40">CALIBRATING_OPTICS...</span>
            </div>
         </div>
       )}
    </div>
  );
}

function getSeverityColor(severity: number): string {
  if (severity >= 5) return '#f43f5e';
  if (severity >= 4) return '#f97316';
  if (severity >= 3) return '#eab308';
  return '#22d3ee';
}

function SimulationCommandPanel({ onClose }: { onClose: () => void }) {
  const { 
    hazardType, setHazardType, 
    waterLevel, setWaterLevel,
    isSimulating, setIsSimulating,
    environment, setEnvironment,
    timeOfDay, setTimeOfDay,
    showStreets, setShowStreets,
    showVegetation, setShowVegetation,
    showGEE, setShowGEE,
    geeAnalysisType, setGeeAnalysisType,
    simulationDate, setSimulationDate,
    rainIntensity, setRainIntensity,
    soilSaturation, setSoilSaturation,
    soilType, setSoilType
  } = useSimulationStore();

  return (
    <DraggablePanel 
      title="SIMULATION COMMAND" 
      position={{ top: 112, right: 20 }} 
      onDragStart={() => {}} 
      onToggleDock={onClose}
    >
      <div className="p-4 bg-slate-900/95 space-y-6 w-[280px]">
        {/* Hazard Category */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Risco</label>
          <div className="grid grid-cols-2 gap-2">
            {['Flood', 'DamBreak', 'Contamination', 'Landslide'].map((t) => (
              <button
                key={t}
                onClick={() => setHazardType(t)}
                className={`py-2 rounded-lg border text-[10px] font-bold transition-all uppercase ${hazardType === t ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity / Level Control */}
        <div className="space-y-3 border-t border-white/5 pt-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensidade / Nível</label>
            <span className="text-xs font-mono text-cyan-400">{waterLevel}m</span>
          </div>
          <input 
            type="range" min="0" max="50" step="1" 
            value={waterLevel} 
            onChange={(e) => setWaterLevel(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Environment Control */}
        <div className="space-y-4 border-t border-white/5 pt-4">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmosfera Operacional</label>
           
           <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-mono">
               <span className="text-slate-400 uppercase">Neblina</span>
               <span className="text-slate-100">{Math.round(environment.fog * 100)}%</span>
             </div>
             <input type="range" min="0" max="1" step="0.01" value={environment.fog} onChange={e => setEnvironment({ fog: Number(e.target.value) })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500" />
           </div>

           <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-mono">
               <span className="text-slate-400 uppercase">Chuva (Simulada)</span>
               <span className="text-slate-100">{Math.round(environment.rain * 100)}%</span>
             </div>
             <input type="range" min="0" max="1" step="0.01" value={environment.rain} onChange={e => setEnvironment({ rain: Number(e.target.value) })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
           </div>

           <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">Ciclo Dia/Noite</span>
                <span className="text-slate-100">{Math.floor(timeOfDay)}:00</span>
              </div>
              <input 
                type="range" min="0" max="23" step="1" 
                value={timeOfDay} 
                onChange={e => setTimeOfDay(Number(e.target.value))} 
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400" 
              />
           </div>

           <div className="space-y-3 border-t border-white/5 pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Camadas Táticas</label>
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center justify-between text-[10px] cursor-pointer group">
                  <span className="text-slate-400 uppercase font-mono group-hover:text-cyan-400 transition-colors">Arvores / Mata</span>
                  <input type="checkbox" checked={showVegetation} onChange={e => setShowVegetation(e.target.checked)} className="h-3 w-3 rounded border-slate-700 bg-slate-800 accent-cyan-500" />
                </label>
                <label className="flex items-center justify-between text-[10px] cursor-pointer group">
                  <span className="text-slate-400 uppercase font-mono group-hover:text-cyan-400 transition-colors">Rede Viária</span>
                  <input type="checkbox" checked={showStreets} onChange={e => setShowStreets(e.target.checked)} className="h-3 w-3 rounded border-slate-700 bg-slate-800 accent-cyan-500" />
                </label>
              </div>
           </div>

           <div className="space-y-3 border-t border-white/5 pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-emerald-500" /> Google Earth Engine
              </label>
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center justify-between text-[10px] cursor-pointer group">
                  <span className="text-slate-400 uppercase font-mono group-hover:text-emerald-400 transition-colors">Ativar Análise GEE</span>
                  <input type="checkbox" checked={showGEE} onChange={e => setShowGEE(e.target.checked)} className="h-3 w-3 rounded border-slate-700 bg-slate-800 accent-emerald-500" />
                </label>
                
                {showGEE && (
                  <select 
                    value={geeAnalysisType} 
                    onChange={e => setGeeAnalysisType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-white/5 rounded px-2 py-1.5 text-[10px] font-mono text-emerald-400 outline-none"
                  >
                    <option value="ndvi">NDVI (Vegetação)</option>
                    <option value="moisture">Soil Moisture (Umidade)</option>
                    <option value="thermal">Thermal (Calor)</option>
                  </select>
                )}
              </div>
           </div>

           <div className="space-y-4 border-t border-white/5 pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CloudRain size={12} className="text-cyan-400" /> Clima & Solo
              </label>
              
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Data da Simulação</span>
                  <input 
                    type="date" 
                    value={simulationDate}
                    onChange={e => setSimulationDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Intensidade Chuva</span>
                    <span className="text-[10px] font-mono text-cyan-400">{rainIntensity}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={rainIntensity} 
                    onChange={e => setRainIntensity(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Saturação do Solo</span>
                    <span className="text-[10px] font-mono text-cyan-400">{soilSaturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={soilSaturation} 
                    onChange={e => setSoilSaturation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Tipo de Solo</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['clay', 'sandy', 'loam', 'rocky'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSoilType(type)}
                        className={`px-2 py-1 text-[9px] uppercase font-mono rounded border transition-all ${
                          soilType === type 
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-800 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                      >
                        {type === 'clay' ? 'Argiloso' : type === 'sandy' ? 'Arenoso' : type === 'loam' ? 'Franco' : 'Rochoso'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Simulation Lock */}
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
            ${isSimulating 
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]' 
              : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
        >
          {isSimulating ? 'DETENER SIMULAÇÃO' : 'INICIAR PROJEÇÃO'}
        </button>
      </div>
    </DraggablePanel>
  );
}
