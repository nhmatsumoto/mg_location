import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import axios from 'axios';

interface VegetationData {
  id: string;
  points: [number, number][]; // lon, lat
}

export const TacticalVegetation: React.FC = () => {
  const [forests, setForests] = useState<VegetationData[]>([]);

  const bbox = "-20.94,-43.01,-20.88,-42.95";

  useEffect(() => {
    const fetchVegetation = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            way["natural"="forest"](${bbox});
            way["landuse"="forest"](${bbox});
            way["natural"="wood"](${bbox});
          );
          out body;
          >;
          out skel qt;
        `;
        const response = await axios.post('https://overpass-api.de/api/interpreter', query);
        
        const nodes: Record<string, [number, number]> = {};
        response.data.elements.filter((el: any) => el.type === 'node').forEach((node: any) => {
          nodes[node.id] = [node.lon, node.lat];
        });

        const parsedForests: VegetationData[] = response.data.elements
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
  }, []);

  const treeInstances = useMemo(() => {
    if (forests.length === 0) return null;

    const trees: THREE.Vector3[] = [];
    const project = (lon: number, lat: number) => [
      (lon + 51.9) * 2,
      -(lat + 14.2) * 2
    ];

    forests.forEach((f) => {
      if (f.points.length < 3) return;

      // Simple bounding box for the forest area to scatter trees
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      f.points.forEach(p => {
        const [x, z] = project(p[0], p[1]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });

      // Scatter trees within the bounding box (simplified density)
      const area = (maxX - minX) * (maxZ - minZ);
      const count = Math.min(50, Math.floor(area * 5)); 

      for (let i = 0; i < count; i++) {
        trees.push(new THREE.Vector3(
          minX + Math.random() * (maxX - minX),
          -0.4,
          minZ + Math.random() * (maxZ - minZ)
        ));
      }
    });

    return trees;
  }, [forests]);

  if (!treeInstances || treeInstances.length === 0) return null;

  return (
    <group>
      {treeInstances.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Simple low-poly tree: Trunk */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 0.2, 8]} />
            <meshStandardMaterial color="#3f2b1d" />
          </mesh>
          {/* Simple low-poly tree: Foliage */}
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial color="#064e3b" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
