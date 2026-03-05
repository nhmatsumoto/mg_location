import React, { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const SimulationBoxEditor: React.FC = () => {
  const { box, setBox } = useSimulationStore();
  const boxRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!box) {
      setBox({ center: [-23.5, -46.6], size: [50000, 50000] });
    }
  }, [box, setBox]);

  if (!box) return null;

  const x = (box.center[1] + 51.9) * 2;
  const z = -(box.center[0] + 14.2) * 2;
  const width = box.size[0] / 10000;
  const height = box.size[1] / 10000;

  return (
    <TransformControls
      object={boxRef.current || undefined}
      mode="translate"
      showY={false}
      onMouseUp={() => {
        if (boxRef.current) {
           const newX = boxRef.current.position.x;
           const newZ = boxRef.current.position.z;
           const newLon = (newX / 2) - 51.9;
           const newLat = -(newZ / 2) - 14.2;
           setBox({ ...box, center: [newLat, newLon] });
        }
      }}
    >
      <mesh ref={boxRef} position={[x, 0.5, z]}>
        <boxGeometry args={[width, 5, height]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
      </mesh>
    </TransformControls>
  );
};
