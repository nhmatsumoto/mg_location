import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { useSimulationStore } from '../../store/useSimulationStore';

export const TerrainMesh: React.FC = () => {
  const { satelliteTextureUrl } = useSimulationStore();
  
  // Load texture if available
  const texture = useLoader(
    THREE.TextureLoader, 
    satelliteTextureUrl || 'https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/0/0/0.png'
  );
  
  // Enhanced Procedural Terrain (Ubá-inspired topography)
  const { geometry, wireframeGeometry } = useMemo(() => {
    const size = 150;
    const segments = 128; // Increased for better detail
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const vertices = geo.attributes.position.array as Float32Array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // Multi-frequency noise simulation
      const h1 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 4;
      const h2 = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 2;
      const h3 = Math.cos(x * 0.2) * Math.cos(y * 0.2) * 1;
      
      const height = h1 + h2 + h3;
      vertices[i + 2] = height;
    }
    
    geo.computeVertexNormals();
    return { 
      geometry: geo,
      wireframeGeometry: new THREE.WireframeGeometry(geo)
    };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      {/* Base Terrain Surface - Dark Navy / Forest Blend or Satellite */}
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial 
          color={satelliteTextureUrl ? "#ffffff" : "#1e293b"} 
          map={satelliteTextureUrl ? texture : null}
          roughness={0.9} 
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Tactical Wireframe Overlay - Cyan pulse */}
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#06b6d4" transparent opacity={0.08} />
      </lineSegments>

      {/* Grid Intersections for Digital Twin feel */}
      <points geometry={geometry}>
        <pointsMaterial 
          size={0.03} 
          color="#22d3ee" 
          transparent 
          opacity={0.15} 
        />
      </points>
    </group>
  );
};
