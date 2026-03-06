import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

const PARTICLE_COUNT = 1500;

export const FluidSimulation: React.FC = () => {
  const { isSimulating, rainIntensity, soilSaturation, soilType, waterLevel, box } = useSimulationStore();
  
  // Particle system for fluid simulation
  const pointsRef = useRef<THREE.Points>(null);

  // Absorption logic based on soil type
  const absorptionRate = useMemo(() => {
    const base = (100 - soilSaturation) / 1000;
    switch (soilType) {
      case 'clay': return base * 0.2; // Slow absorption
      case 'sandy': return base * 2.5; // Fast absorption
      case 'rocky': return base * 0.1; // Almost no absorption
      default: return base; 
    }
  }, [soilSaturation, soilType]);

  // Initial particle positions within the simulation box
  const [initialPositions] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    
    if (!box) return [pos];

    const xPos = (box.center[1] + 51.9) * 2;
    const zPos = -(box.center[0] + 14.2) * 2;
    const width = box.size[0] / 10000;
    const height = box.size[1] / 10000;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3] = xPos + (Math.random() - 0.5) * width;
        pos[i * 3 + 1] = 5 + Math.random() * 10;
        pos[i * 3 + 2] = zPos + (Math.random() - 0.5) * height;
    }
    return [pos];
  }, [box]);

  useFrame((_state, delta) => {
    if (!pointsRef.current || !isSimulating || rainIntensity <= 0) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Simulate gravity and flow
      positions[i * 3 + 1] -= delta * 5; // Gravity

      const groundLevel = 0.2 + (waterLevel * 0.05);
      
      if (positions[i * 3 + 1] < groundLevel) {
        if (Math.random() > absorptionRate) {
           positions[i * 3] += (Math.random() - 0.5) * 0.1;
           positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
           positions[i * 3 + 1] = groundLevel;
        } else {
           positions[i * 3 + 1] = 10 + Math.random() * 5;
        }
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!box || rainIntensity <= 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#38bdf8" 
        size={0.15} 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};
