import React from 'react';
import * as THREE from 'three';
import { EnvironmentChunk } from './EnvironmentChunk';
import { useChunkManager } from '../../hooks/useChunkManager';
import { useSimulationStore } from '../../store/useSimulationStore';

interface TacticalEnvironmentProps {
  clippingPlanes?: THREE.Plane[];
}

export const TacticalEnvironment: React.FC<TacticalEnvironmentProps> = () => {
  const { heroPosition } = useSimulationStore();
  
  // Manage chunks based on hero position
  // radius 1 = 3x3 grid (9 chunks)
  const chunks = useChunkManager(heroPosition, 500, 1);
  
  return (
    <group>
      {chunks.map(chunk => (
        <EnvironmentChunk 
          key={chunk.id} 
          bbox={chunk.bbox} 
          chunkId={chunk.id} 
        />
      ))}
      <ambientLight intensity={0.2} />
    </group>
  );
};
