import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from '../../utils/projection';

export const TerrainMesh: React.FC = () => {
  const { 
    satelliteTextureUrl, 
    dynamicBounds, 
    box: simulationBox, 
    soilType, 
    soilSaturation 
  } = useSimulationStore();

  const center = useMemo(() => {
    if (dynamicBounds) {
      const parts = dynamicBounds.split(',').map(Number);
      const lat = (parts[0] + parts[2]) / 2;
      const lon = (parts[1] + parts[3]) / 2;
      return { lat, lon };
    }
    if (simulationBox) {
      return { lat: simulationBox.center[0], lon: simulationBox.center[1] };
    }
    return { lat: -20.91, lon: -42.98 }; 
  }, [dynamicBounds, simulationBox]);

  const [centerX, centerZ] = useMemo(() => projectTo3D(center.lat, center.lon), [center]);
  
  const texture = useLoader(
    THREE.TextureLoader, 
    satelliteTextureUrl || 'https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/0/0/0.png',
    (loader) => {
      loader.setCrossOrigin('anonymous');
    }
  );
  
  const { geometry, wireframeGeometry } = useMemo(() => {
    const size = simulationBox ? Math.max(simulationBox.size[0] / 500, simulationBox.size[1] / 500) * 1.5 : 200;
    const segments = 128; 
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const vertices = geo.attributes.position.array as Float32Array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] + centerX;
      const y = vertices[i + 1] - centerZ; 
      
      const h1 = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 3;
      const h2 = Math.sin(x * 0.2) * Math.sin(y * 0.2) * 1.5;
      const h3 = (Math.random() - 0.5) * 0.1; 
      
      vertices[i + 2] = h1 + h2 + h3;
    }
    
    geo.computeVertexNormals();
    return { 
      geometry: geo,
      wireframeGeometry: new THREE.WireframeGeometry(geo)
    };
  }, [centerX, centerZ, simulationBox]);

  const terrainColor = useMemo(() => {
    if (satelliteTextureUrl) return "#ffffff";
    
    const color = new THREE.Color();
    if (soilType === 'clay') color.set("#9a3412");
    else if (soilType === 'sandy') color.set("#a16207");
    else if (soilType === 'rocky') color.set("#4b5563");
    else color.set("#3f3f46"); // Loam
    
    // Darken based on saturation
    const darken = (soilSaturation / 100) * 0.4;
    color.multiplyScalar(1 - darken);
    
    return color;
  }, [soilType, satelliteTextureUrl, soilSaturation]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.6, centerZ]}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial 
          color={terrainColor} 
          map={satelliteTextureUrl ? texture : null}
          roughness={0.9} 
          metalness={0.1 - (soilSaturation / 1000)} // Wetter = slightly more reflective
          transparent
          opacity={0.9}
        />
      </mesh>
      
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#06b6d4" transparent opacity={0.08} />
      </lineSegments>

      <points geometry={geometry}>
        <pointsMaterial size={0.03} color="#22d3ee" transparent opacity={0.15} />
      </points>
    </group>
  );
};
