import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from 'sos-3d-engine';

interface VegetationData {
  id: string;
  points: [number, number][]; // lon, lat
}

interface TacticalVegetationProps {
  clippingPlanes?: THREE.Plane[];
  data?: VegetationData[];
}

export const TacticalVegetation: React.FC<TacticalVegetationProps> = ({ clippingPlanes, data }) => {
  const [forests, setForests] = useState<VegetationData[]>([]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const store = useSimulationStore();
  const { rainIntensity, activeLayers } = store;

  useEffect(() => {
    if (data) {
      setForests(data);
    }
  }, [data]);

  const treeMatrices = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const project = (lon: number, lat: number) => projectTo3D(lat, lon);

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempRotation = new THREE.Euler();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    forests.forEach((f) => {
      if (f.points.length < 3) return;

      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      f.points.forEach(p => {
        const [x, z] = project(p[0], p[1]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });

      const area = (maxX - minX) * (maxZ - minZ);
      const density = 400; // Trees per square unit
      const count = Math.min(300, Math.floor(area * density)); 

      for (let i = 0; i < count; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const z = minZ + Math.random() * (maxZ - minZ);
        
        tempPosition.set(x, 0, z); // sit on terrain at Y=0
        tempRotation.set(0, Math.random() * Math.PI, 0);
        tempQuaternion.setFromEuler(tempRotation);
        const scaleBy = 0.6 + Math.random() * 0.4;
        tempScale.set(scaleBy, scaleBy, scaleBy);
        
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        matrices.push(tempMatrix.clone());
      }
    });

    return matrices;
  }, [forests]);

  useEffect(() => {
    if (!trunkRef.current || !foliageRef.current || treeMatrices.length === 0) return;

    treeMatrices.forEach((matrix, i) => {
      trunkRef.current!.setMatrixAt(i, matrix);
      foliageRef.current!.setMatrixAt(i, matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
  }, [treeMatrices]);

  const trunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.01, 0.015, 0.05, 8);
    geo.translate(0, 0.025, 0);
    return geo;
  }, []);

  const foliageGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.08, 0.15, 8);
    geo.translate(0, 0.125, 0);
    return geo;
  }, []);

  if (treeMatrices.length === 0 || !activeLayers.vegetation) return null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined as any, undefined as any, treeMatrices.length]} castShadow>
        <primitive object={trunkGeo} attach="geometry" />
        <meshStandardMaterial color="#3f2b1d" clippingPlanes={clippingPlanes} />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined as any, undefined as any, treeMatrices.length]} castShadow>
        <primitive object={foliageGeo} attach="geometry" />
        <meshStandardMaterial 
          color={new THREE.Color("#064e3b").multiplyScalar(1 - (rainIntensity / 400))} 
          roughness={1 - (rainIntensity / 200)} 
          clippingPlanes={clippingPlanes}
        />
      </instancedMesh>
    </group>
  );
};
