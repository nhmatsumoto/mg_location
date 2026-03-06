import React, { useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationBoxEditor } from './SimulationBoxEditor';
import { HazardOverlay } from './HazardOverlay';
import { SnapshotVolume } from './SnapshotVolume';
import type { SituationalSnapshot } from '../../types';
import { AnimatedBarrier } from './AnimatedBarrier';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D, invertFrom3D } from '../../utils/projection';
import { TacticalEnvironment } from './TacticalEnvironment';
import { DayNightCycle } from './DayNightCycle';
import { MapZoneLayer } from './MapZoneLayer';
import { Tactical3DMarkers } from './Tactical3DMarkers';

interface BarrierData {
  id: string;
  points: [number, number, number][];
  color?: string;
  type: 'containment' | 'restricted' | 'hazard';
}

const ScanningRay: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 50;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
      <planeGeometry args={[100, 2]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} />
    </mesh>
  );
};

const CameraBoundsTracker: React.FC = () => {
  const setDynamicBounds = useSimulationStore(state => state.setDynamicBounds);
  const setFocalPoint = useSimulationStore(state => state.setFocalPoint);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.4), []);
  const lastUpdate = useRef(0);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (now - lastUpdate.current < 1) return;
    lastUpdate.current = now;

    const corners = [
      new THREE.Vector2(-1, -1),
      new THREE.Vector2(1, -1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(-1, 1),
    ];

    const intersections: THREE.Vector3[] = [];
    corners.forEach(c => {
      raycaster.setFromCamera(c, state.camera);
      const target = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, target)) {
        intersections.push(target);
      }
    });

    if (intersections.length < 4) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    intersections.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z);
      maxZ = Math.max(maxZ, p.z);
    });

    const [minLat, minLon] = invertFrom3D(minX, maxZ);
    const [maxLat, maxLon] = invertFrom3D(maxX, minZ);

    const bbox = `${minLat.toFixed(4)},${minLon.toFixed(4)},${maxLat.toFixed(4)},${maxLon.toFixed(4)}`;
    setDynamicBounds(bbox);

    // Update Focal Point (Center of screen intersection)
    raycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera);
    const focalTarget = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, focalTarget)) {
      const [fLat, fLon] = invertFrom3D(focalTarget.x, focalTarget.z);
      setFocalPoint([fLat, fLon]);
    }
  });

  return null;
};

const FocalIntelligence: React.FC = () => {
  const focalPoint = useSimulationStore(state => state.focalPoint);
  const setFocalWeather = useSimulationStore(state => state.setFocalWeather);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (!focalPoint) return;
    
    const now = Date.now();
    if (now - lastUpdate.current < 3000) return;
    lastUpdate.current = now;

    const fetchFocalData = async () => {
      setFocalWeather({ loading: true });
      await new Promise(r => setTimeout(r, 800));
      const [lat, lon] = focalPoint;
      const baseTemp = 22 + Math.sin(lat * 10) * 5;
      const humidity = 40 + Math.cos(lon * 10) * 30;
      
      setFocalWeather({
        temp: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(humidity),
        windSpeed: Math.round(5 + Math.random() * 15),
        description: baseTemp > 25 ? 'Céu Limpo' : 'Parcialmente Nublado',
        loading: false
      });
    };

    void fetchFocalData();
  }, [focalPoint, setFocalWeather]);

  return null;
};

interface Event3DProps {
  id: string;
  position: [number, number, number];
  color: string;
  label: string;
  severity: number;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

const EventBeacon: React.FC<Event3DProps> = ({ 
  id, position, color, label, severity, isSelected, onHover, onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      }
    }
  });

  return (
    <group position={position}>
      {isSelected && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text position={[0, severity * 0.2 + 1, 0]} fontSize={0.3} color="white">
            {label}
          </Text>
        </Float>
      )}
      <mesh ref={meshRef} onPointerOver={() => onHover(id)} onPointerOut={() => onHover(null)} onClick={() => onClick(id)}>
        <cylinderGeometry args={[0.1, 0.2, severity * 0.3, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 5 : 1} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -severity * 0.15, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

interface Tactical3DMapProps {
  events: any[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onClick: (p: any) => void;
  enableSimulationBox?: boolean;
  activeSnapshots?: SituationalSnapshot[];
  barriers?: BarrierData[];
  initialCenter?: [number, number];
}

export const Tactical3DMap: React.FC<Tactical3DMapProps> = ({ 
  events, hoveredId, onHover, onClick, enableSimulationBox = false, activeSnapshots = [], barriers = [], initialCenter = [-20.91, -42.98]
}) => {
  const { environment, isSimulating, timeOfDay, box: simulationBox } = useSimulationStore();
  
  const focusPoint = useMemo(() => {
    if (simulationBox) return simulationBox.center;
    return initialCenter;
  }, [simulationBox, initialCenter]);

  const [centerX, centerZ] = projectTo3D(focusPoint[0], focusPoint[1]);

  const coords = useMemo(() => {
    return events.map(e => {
        const [x, z] = projectTo3D(e.lat, e.lon);
        const color = getEventColor(e.event_type || e.type, e.severity);
        return {
            ...e,
            pos3d: [x, e.severity * 0.15, z] as [number, number, number],
            color
        };
    });
  }, [events]);

  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
      <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
        <CameraBoundsTracker />
        <FocalIntelligence />
        <PerspectiveCamera makeDefault position={[centerX + 5, 5, centerZ + 5]} fov={50} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} minDistance={2} maxDistance={200} target={[centerX, 0, centerZ]} />
        
        <DayNightCycle timeOfDay={timeOfDay} />
        <gridHelper args={[100, 50, 0x1e293b, 0x0f172a]} position={[0, -0.1, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#020617" roughness={0} metalness={0.8} />
        </mesh>
        <gridHelper args={[100, 10, 0x06b6d4, 0x06b6d4]} position={[0, -0.19, 0]} />

        <TacticalEnvironment />
        <MapZoneLayer />
        
        <Tactical3DMarkers markers={[
            { lat: focusPoint[0] + 0.002, lon: focusPoint[1] + 0.002, type: 'risk', label: 'Zona de Inundação Alpha', severity: 4 },
            { lat: focusPoint[0] - 0.001, lon: focusPoint[1] + 0.003, type: 'hospital', label: 'Centro Médico Regional' },
            { lat: focusPoint[1], lon: focusPoint[1], type: 'base', label: 'Posto de Comando' }
        ]} />

        <ScanningRay />

        {coords.map((e) => (
          <EventBeacon
            key={e.id || `${e.provider}-${e.provider_event_id}`}
            id={e.id || `${e.provider}-${e.provider_event_id}`}
            position={e.pos3d}
            color={e.color}
            label={e.title || e.label || "Evento"}
            severity={e.severity}
            isSelected={hoveredId === (e.id || `${e.provider}-${e.provider_event_id}`)}
            onHover={onHover}
            onClick={() => onClick(e)}
          />
        ))}

        <fog attach="fog" args={[timeOfDay < 6 || timeOfDay > 18 ? '#020617' : '#94a3b8', 10, 60 - environment.fog * 40]} />

        {activeSnapshots.map((snap) => (
          <SnapshotVolume key={snap.id} snapshot={snap} />
        ))}

        {barriers.map((barrier) => (
          <AnimatedBarrier 
            key={barrier.id} 
            points={barrier.points} 
            color={barrier.color || (barrier.type === 'hazard' ? '#ef4444' : '#22d3ee')}
            height={barrier.type === 'containment' ? 1.5 : 2.5}
          />
        ))}

        {enableSimulationBox && <SimulationBoxEditor />}
        {enableSimulationBox && <HazardOverlay />}

        <WeatherParticles intensity={environment.rain} isSimulating={isSimulating} />
      </Canvas>

      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-bold">
           Situation Room 3D v1.0 // Real-time Uplink Active {isSimulating && " // PROJECTION_ACTIVE"}
        </div>
      </div>
    </div>
  );
};

const WeatherParticles: React.FC<{ intensity: number; isSimulating: boolean }> = ({ intensity, isSimulating }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = Math.random() * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, []);

  useFrame(() => {
    if (!pointsRef.current || intensity <= 0) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (0.1 + intensity * 0.2) * (isSimulating ? 1.5 : 1);
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 20;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (intensity <= 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#93c5fd" transparent opacity={0.3 * intensity} blending={THREE.AdditiveBlending} />
    </points>
  );
};

function getEventColor(type: string, severity: number): string {
  if (!type) return '#22d3ee';
  if (type.includes('Rescue')) return '#f87171';
  if (type.includes('Donation')) return '#4ade80';
  if (type.includes('Search')) return '#fbbf24';
  if (type.includes('Assignment')) return '#818cf8';
  if (type.includes('Expense')) return '#f472b6';
  if (severity >= 4) return '#ef4444';
  return '#22d3ee';
}
