import { useState, useCallback, useMemo } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Modal } from '../components/ui/Modal';
import { QuickActions } from '../components/ui/QuickActions';

import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { MapInteractions, MapListener, type ToolMode } from '../components/map/MapInteractions';
import { MemoizedEventMarker } from '../components/map/EventMarker';
import { LiveOpsPanel } from '../components/map/LiveOpsPanel';
import { CursorCoordinates } from '../components/map/CursorCoordinates';
import { MapContextMenu } from '../components/map/MapContextMenu';

import { useSOSPageData } from '../hooks/useSOSPageData';
import { SOSHeaderHUD } from '../components/ui/SOSHeaderHUD';
import { AlertSidebar } from '../components/ui/AlertSidebar';
import { MissionsPanel } from '../components/gamification/MissionsPanel';
import { GamificationHud } from '../components/gamification/GamificationHud';
import { SituationIntelPanel } from '../components/ui/SituationIntelPanel';
import { TacticalOpsForm } from '../components/ui/TacticalOpsForm';
import {
  Box,
  VStack,
  Center,
  Spinner,
  Text
} from '@chakra-ui/react';

export function SOSPage() {
  const {
    events, domainEvents, alerts, mapAnnotations, opsSnapshot,
    country, setCountry, initialLoading, savingOps,
    currentDisplayEvents,
    saveOps, sidebarAlerts
  } = useSOSPageData();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-20.91, -42.98]);
  const [mapZoom, setMapZoom] = useState(13);
  const [lastClickedCoords, setLastClickedCoords] = useState<[number, number] | null>(null);
  const [tool, setTool] = useState<ToolMode>('inspect');
  const [areaDraft, setAreaDraft] = useState<Array<[number, number]>>([]);
  const [spatialFilter, setSpatialFilter] = useState<any>(null);

  const [openOpsModal, setOpenOpsModal] = useState(false);
  const [opsForm, setOpsForm] = useState({
    recordType: 'risk_area' as any,
    personName: '',
    lastSeenLocation: '',
    incidentTitle: '',
    severity: 'high'
  });

  const [intelPanelOpen, setIntelPanelOpen] = useState(false);
  const [liveOpsPanelOpen, setLiveOpsPanelOpen] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, lat: number, lon: number } | null>(null);

  const handleMarkerHover = useCallback((id: string) => setHoveredId(id), []);
  const handleMarkerUnhover = useCallback(() => setHoveredId(null), []);
  const handleMapHover = useCallback((lat: number, lon: number) => setCursorCoords([lat, lon]), []);

  const handleQuickAction = useCallback((label: string) => {
    if (label === 'LIVE OPERATIONS') {
      setLiveOpsPanelOpen(!liveOpsPanelOpen);
    } else if (label === 'Relato') {
      setOpsForm(prev => ({ ...prev, recordType: 'risk_area' }));
      setOpenOpsModal(true);
    } else if (['Voluntários', 'Doações', 'Resgate', 'Bombeiros', 'Exército'].includes(label)) {
      const typeMap: Record<string, string> = {
        'Voluntários': 'voluntario',
        'Doações': 'doacao',
        'Resgate': 'resgate',
        'Bombeiros': 'bombeiros',
        'Exército': 'exercito'
      };
      setOpsForm(prev => ({ ...prev, recordType: typeMap[label] }));
      setOpenOpsModal(true);
    }
  }, [liveOpsPanelOpen]);

  const selectedEvent = useMemo(() => {
    if (!hoveredId) return null;
    return (events as any[]).find(e => `${e.provider}-${e.provider_event_id}` === hoveredId) ||
      domainEvents.find(e => e.id === hoveredId) ||
      (alerts as any[]).find(a => `alert-${a.id}` === hoveredId) ||
      (mapAnnotations as any[]).find(m => `ann-${m.id}` === hoveredId) ||
      (sidebarAlerts as any[]).find((a: any) => a.id === hoveredId);
  }, [hoveredId, events, domainEvents, alerts, mapAnnotations, sidebarAlerts]);

  const handleReset = () => {
    setMapCenter([-14.2, -51.9]);
    setHoveredId(null);
    setTool('inspect');
  };

  const handleSaveOps = () => {
    saveOps(opsForm, lastClickedCoords, setOpenOpsModal, setLastClickedCoords);
  };

  return (
    <Box h="100vh" w="100vw" position="relative" overflow="hidden" bg="sos.dark">
      {initialLoading && <LoadingOverlay message="Inicializando Guardian Terminal..." />}
      {savingOps && <LoadingOverlay message="Sincronizando Dados de Campo..." />}

      {/* Floating Header */}
      <SOSHeaderHUD
        country={country}
        setCountry={setCountry}
        onReset={handleReset}
        activeTool={tool}
        setTool={setTool}
        onSearchSelect={(lat, lon) => {
          setMapCenter([lat, lon]);
          setMapZoom(14);
        }}
        stats={{
          activeTeams: opsSnapshot?.kpis?.activeTeams ?? '0',
          criticalAlerts: opsSnapshot?.kpis?.criticalAlerts ?? '0',
          supplies: opsSnapshot?.kpis?.suppliesInTransit ?? '0',
          missingPersons: opsSnapshot?.layers?.missingPersons?.length ?? '0'
        }}
      />

      <AlertSidebar
        alerts={sidebarAlerts.map((a: any) => ({
          ...a,
          description: a.description || `Alerta de ${a.source || 'sistema'}`,
          lat: a.lat,
          lon: a.lon
        }))}
        kpis={{
          criticalAlerts: opsSnapshot?.kpis?.criticalAlerts || 0,
          activeTeams: opsSnapshot?.kpis?.activeTeams || 0,
          missingPersons: opsSnapshot?.layers?.missingPersons?.length || 0
        }}
        onAlertClick={(alert) => {
          if (alert.lat && alert.lon) {
            setMapCenter([alert.lat, alert.lon]);
            setMapZoom(15);
          }
        }}
      />

      {/* Experimental Missions HUD Section (Right Sidebar) */}
      <VStack position="absolute" top="120px" right={6} bottom={6} zIndex={40} display={{ base: 'none', xl: 'flex' }} spacing={6} align="stretch">
         <GamificationHud
           xp={3420}
           level={42}
           rank="Sentinel III"
           nextLevelXp={5000}
           w="340px"
         />
         <MissionsPanel />
      </VStack>

      {/* Bottom Center: Quick Action Bar */}
      <Box position="absolute" bottom={6} left="50%" transform="translateX(-50%)" zIndex={40}>
        <QuickActions onToggleLiveOps={() => setLiveOpsPanelOpen(!liveOpsPanelOpen)} onAction={handleQuickAction} />
      </Box>

      {intelPanelOpen && selectedEvent && (
        <SituationIntelPanel 
          event={selectedEvent} 
          onClose={() => setIntelPanelOpen(false)} 
        />
      )}

      {liveOpsPanelOpen && (
        <LiveOpsPanel onClose={() => setLiveOpsPanelOpen(false)} />
      )}

      <Box position="absolute" inset={0} zIndex={0}>
        {mapCenter && mapCenter[0] !== undefined && (
          <MapContainer center={mapCenter} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
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
              onFilterComplete={() => { }}
              onSnapshotComplete={() => { }}
              onContextMenu={(x, y, lat, lon) => setContextMenu({ x, y, lat, lon })}
              show3D={false}
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
              {(currentDisplayEvents || []).map((e) => (
                <MemoizedEventMarker key={e.id || `${e.provider}-${e.provider_event_id}`} e={e} isHovered={hoveredId === (e.id || `${e.provider}-${e.provider_event_id}`)} onHover={handleMarkerHover} onUnhover={handleMarkerUnhover} />
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
        {!mapCenter && (
          <Center h="full" bg="sos.dark">
            <VStack spacing={4}>
              <Spinner color="sos.blue.500" size="xl" />
              <Text fontSize="10px" fontWeight="black" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="widest">
                Sincronizando com Satélites Guardian...
              </Text>
            </VStack>
          </Center>
        )}
      </Box>

      <Modal title="CADASTRO TÁTICO DE CAMPO" open={openOpsModal} onClose={() => setOpenOpsModal(false)}>
        <TacticalOpsForm 
          opsForm={opsForm} 
          setOpsForm={setOpsForm} 
          onSave={handleSaveOps} 
        />
      </Modal>

      <CursorCoordinates coords={cursorCoords} />
      {contextMenu && (
        <MapContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lat={contextMenu.lat}
          lon={contextMenu.lon}
          onClose={() => setContextMenu(null)}
          onMarkRiskArea={(lat, lon) => {
            setLastClickedCoords([lat, lon]);
            setOpsForm(prev => ({ ...prev, recordType: 'risk_area' }));
            setOpenOpsModal(true);
          }}
        />
      )}
    </Box>
  );
}

