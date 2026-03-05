import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const HazardOverlay: React.FC = () => {
  const { box, waterLevel, hazardType } = useSimulationStore();
  
  if (!box || waterLevel <= 0) return null;

  const x = (box.center[1] + 51.9) * 2;
  const z = -(box.center[0] + 14.2) * 2;
  const width = box.size[0] / 10000;
  const height = box.size[1] / 10000;

  // Render different abstract geometries based on hazardType
  if (hazardType === 'Flood' || hazardType === 'DamBreak') {
    return (
      <mesh position={[x, waterLevel * 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial 
           color={hazardType === 'DamBreak' ? "#8b5a2b" : "#0284c7"} // muddy water for dambreak
           transparent
           opacity={0.8}
           roughness={0.1}
           transmission={0.9}
           thickness={2}
        />
      </mesh>
    );
  }

  if (hazardType === 'Contamination') {
    return (
      <mesh position={[x, 0.5, z]}>
        <cylinderGeometry args={[width/2 * (waterLevel/15), width/2 * (waterLevel/15), 5, 32]} />
        <meshStandardMaterial color="#84cc16" transparent opacity={0.3 + (waterLevel/30)} />
      </mesh>
    );
  }

  if (hazardType === 'Earthquake') {
    return (
      <mesh position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, width * (waterLevel/15), 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5 - (waterLevel/30)} />
      </mesh>
    );
  }
  
  if (hazardType === 'Cyclone') {
     return (
        <mesh position={[x, 2, z]} rotation={[-Math.PI / 2, 0, 0]}>
           <torusGeometry args={[width * 0.5, width * 0.1 * (waterLevel/15), 16, 100]} />
           <meshStandardMaterial color="#94a3b8" transparent opacity={0.4} />
        </mesh>
     )
  }

  if (hazardType === 'Landslide') {
      return (
          <mesh position={[x + (width/4), 1, z]}>
             <coneGeometry args={[width/4, 2 * (waterLevel/10), 16]} />
             <meshStandardMaterial color="#78350f" transparent opacity={0.8} />
          </mesh>
      )
  }

  return null;
};
