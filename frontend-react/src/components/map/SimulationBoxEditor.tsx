import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D, invertFrom3D } from '../../utils/projection';

type TransformMode = 'translate' | 'rotate' | 'scale';

export const SimulationBoxEditor: React.FC = () => {
  const { box, setBox } = useSimulationStore();
  const [mode, setMode] = useState<TransformMode>('translate');
  const boxRef = useRef<THREE.Mesh>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'g': setMode('translate'); break;
      case 'r': setMode('rotate'); break;
      case 's': setMode('scale'); break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!box) {
      setBox({ center: [-20.91, -42.98], size: [1000, 1000] });
    }
  }, [box, setBox]);

  if (!box) return null;

  const [x, z] = projectTo3D(box.center[0], box.center[1]);
  const width = box.size[0] / 500; 
  const depth = box.size[1] / 500;

  const onTransformEnd = () => {
    if (boxRef.current) {
      const pos = boxRef.current.position;
      const scale = boxRef.current.scale;
      
      const [newLat, newLon] = invertFrom3D(pos.x, pos.z);
      const newSize: [number, number] = [width * scale.x * 500, depth * scale.z * 500];
      
      setBox({ 
        ...box, 
        center: [newLat, newLon],
        size: newSize
      });
    }
  };

  return (
    <>
      <TransformControls
        object={boxRef.current || undefined}
        mode={mode}
        onMouseUp={onTransformEnd}
        showY={mode !== 'translate'}
      >
        <mesh ref={boxRef} position={[x, 1, z]}>
          <boxGeometry args={[width, 2, depth]} />
          <meshStandardMaterial 
            color="#0ea5e9" 
            transparent 
            opacity={0.2} 
            roughness={0}
            metalness={0.8}
            emissive="#0ea5e9"
            emissiveIntensity={0.5}
          />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(width, 2, depth)]} />
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>
        </mesh>
      </TransformControls>
    </>
  );
};
