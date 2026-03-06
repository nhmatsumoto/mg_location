import React from 'react';
import { Html } from '@react-three/drei';
import { projectTo3D } from '../../utils/projection';
import { MapPin, AlertCircle, Home, Hospital, TreePine } from 'lucide-react';

interface MarkerProps {
  lat: number;
  lon: number;
  type: 'risk' | 'hospital' | 'base' | 'incident' | 'vegetation';
  label: string;
  severity?: number;
}

const MarkerIcon = ({ type }: { type: MarkerProps['type'] }) => {
  switch (type) {
    case 'risk': return <AlertCircle className="text-red-500" size={16} />;
    case 'hospital': return <Hospital className="text-blue-400" size={16} />;
    case 'base': return <Home className="text-emerald-400" size={16} />;
    case 'vegetation': return <TreePine className="text-green-500" size={16} />;
    default: return <MapPin className="text-cyan-400" size={16} />;
  }
};

export const Tactical3DMarkers: React.FC<{ markers: MarkerProps[] }> = ({ markers }) => {
  return (
    <group>
      {markers.map((m, i) => {
        const [x, z] = projectTo3D(m.lat, m.lon);
        return (
          <group key={`${m.lat}-${m.lon}-${i}`} position={[x, 0.5, z]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.01, 0.02, 1, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            
            <Html distanceFactor={15} position={[0, 1.2, 0]} transform occlude>
              <div className="flex flex-col items-center group pointer-events-auto cursor-pointer">
                <div className={`p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border animate-bounce ${
                  m.type === 'risk' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  m.type === 'hospital' ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                  'border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                }`}>
                  <MarkerIcon type={m.type} />
                </div>
                
                <div className="mt-2 px-3 py-1 bg-slate-950/90 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-[10px] font-black text-white whitespace-nowrap uppercase tracking-widest">{m.label}</span>
                  {m.severity && (
                    <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${m.severity > 3 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${m.severity * 20}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </Html>
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
              <ringGeometry args={[0.2, 0.3, 32]} />
              <meshBasicMaterial color={m.type === 'risk' ? '#ef4444' : '#22d3ee'} transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
