import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { fetchOSMData } from '../../utils/osmFetcher';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from '../../utils/projection';

interface VegetationData {
  id: string;
  points: [number, number][]; // lon, lat
}

export const TacticalVegetation: React.FC = () => {
  const [forests, setForests] = useState<VegetationData[]>([]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const { dynamicBounds, box: simulationBox, rainIntensity } = useSimulationStore();
  const lastFetchedBbox = useRef<string | null>(null);

  const defaultBbox = "-20.94,-43.01,-20.88,-42.95";

  useEffect(() => {
    const activeBbox = dynamicBounds || (simulationBox ? 
      `${simulationBox.center[0] - 0.02},${simulationBox.center[1] - 0.02},${simulationBox.center[0] + 0.02},${simulationBox.center[1] + 0.02}` 
      : defaultBbox);

    if (activeBbox === lastFetchedBbox.current) return;
    lastFetchedBbox.current = activeBbox;

    const fetchVegetation = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            way["natural"="forest"](${activeBbox});
            way["landuse"="forest"](${activeBbox});
            way["natural"="wood"](${activeBbox});
          );
          out body;
          >;
          out skel qt;
        `;
        const data = await fetchOSMData(query);
        
        const nodes: Record<string, [number, number]> = {};
        data.elements.filter((el: any) => el.type === 'node').forEach((node: any) => {
          nodes[node.id] = [node.lon, node.lat];
        });

        const parsedForests: VegetationData[] = data.elements
          .filter((el: any) => el.type === 'way' && el.nodes)
          .map((way: any) => ({
            id: way.id,
            points: way.nodes.map((nodeId: string) => nodes[nodeId]).filter(Boolean)
          }));
        
        setForests(parsedForests);
      } catch (error) {
        console.error("OSM Vegetation Fetch Error:", error);
      }
    };

    void fetchVegetation();
  }, [dynamicBounds, simulationBox]);

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
      const density = 25; 
      const count = Math.min(200, Math.floor(area * density)); 

      for (let i = 0; i < count; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const z = minZ + Math.random() * (maxZ - minZ);
        
        tempPosition.set(x, -0.45, z);
        tempRotation.set(0, Math.random() * Math.PI, 0);
        tempQuaternion.setFromEuler(tempRotation);
        const scaleBy = 0.5 + Math.random() * 0.5;
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

  if (treeMatrices.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined as any, undefined as any, treeMatrices.length]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.2, 8]} />
        <meshStandardMaterial color="#3f2b1d" />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined as any, undefined as any, treeMatrices.length]} castShadow>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial 
          color={new THREE.Color("#064e3b").multiplyScalar(1 - (rainIntensity / 400))} 
          roughness={1 - (rainIntensity / 200)} 
        />
      </instancedMesh>
    </group>
  );
};
