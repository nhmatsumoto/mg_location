import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D, invertFrom3D } from 'sos-3d-engine';

export const SosHero: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { heroPosition, setHeroPosition, isPegmanActive } = useSimulationStore();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, raycaster, pointer } = useThree();
  
  useCursor(hovered || isDragging);

  // Project lat/lon to 3D
  const [x, z] = projectTo3D(heroPosition[0], heroPosition[1]);

  const onPointerDown = useCallback((e: any) => {
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (isDragging) {
      // Find intersection with the hidden ground plane
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.setFromCamera(pointer, camera);
      
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        // Convert world units back to lat/lon
        const [lat, lon] = invertFrom3D(intersectionPoint.x, intersectionPoint.z);
        setHeroPosition([lat, lon]);
      }
    } else {
      // Smooth transition when not dragging
      meshRef.current.position.lerp(new THREE.Vector3(x, 0.4, z), 0.1);
    }
    
    // Floating animation
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
    meshRef.current.rotation.y += 0.01;
  });

  if (!isPegmanActive) return null;

  return (
    <group 
      ref={meshRef} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Target Marker for precise placement */}
      {isDragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Pegman Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial color={isDragging ? "#22d3ee" : "#facc15"} emissive={isDragging ? "#0891b2" : "#ca8a04"} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={isDragging ? "#22d3ee" : "#facc15"} />
      </mesh>

      {/* SOS Logo/Indicator */}
      <Html position={[0, 1.2, 0]} center>
        <div className="px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-bold rounded shadow-lg border border-yellow-600 animate-pulse">
          HERO
        </div>
      </Html>

      {/* Range Indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
