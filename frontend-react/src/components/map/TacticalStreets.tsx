import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { fetchOSMData } from '../../utils/osmFetcher';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from '../../utils/projection';

interface StreetData {
  id: string;
  points: [number, number][]; // lon, lat
  type: string;
}

export const TacticalStreets: React.FC = () => {
  const [streets, setStreets] = useState<StreetData[]>([]);
  const dynamicBounds = useSimulationStore((state: any) => state.dynamicBounds);
  const simulationBox = useSimulationStore((state: any) => state.box);
  const lastFetchedBbox = useRef<string | null>(null);

  const defaultBbox = "-20.94,-43.01,-20.88,-42.95";

  useEffect(() => {
    const activeBbox = dynamicBounds || (simulationBox ? 
      `${simulationBox.center[0] - 0.02},${simulationBox.center[1] - 0.02},${simulationBox.center[0] + 0.02},${simulationBox.center[1] + 0.02}` 
      : defaultBbox);

    if (activeBbox === lastFetchedBbox.current) return;
    lastFetchedBbox.current = activeBbox;

    const fetchStreets = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            way["highway"](${activeBbox});
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

        const parsedStreets: StreetData[] = data.elements
          .filter((el: any) => el.type === 'way' && el.nodes)
          .map((way: any) => ({
            id: way.id,
            points: way.nodes.map((nodeId: string) => nodes[nodeId]).filter(Boolean),
            type: way.tags?.highway || 'residential'
          }));
        
        setStreets(parsedStreets);
      } catch (error) {
        console.error("OSM Streets Error:", error);
      }
    };

    void fetchStreets();
  }, [dynamicBounds, simulationBox]);

  const renderedStreets = useMemo(() => {
    return streets.map((s) => {
      if (s.points.length < 2) return null;

      const project = (lon: number, lat: number) => projectTo3D(lat, lon);

      const points = s.points.map(p => {
        const [x, z] = project(p[0], p[1]);
        return new THREE.Vector3(x, -0.38, z);
      });

      const curve = new THREE.CatmullRomCurve3(points);
      
      let width = 0.05;
      if (s.type === 'primary' || s.type === 'trunk') width = 0.15;
      if (s.type === 'secondary') width = 0.1;

      return (
        <mesh key={s.id}>
          <tubeGeometry args={[curve, 64, width, 8, false]} />
          <meshStandardMaterial 
            color="#334155" 
            emissive="#1e293b"
            emissiveIntensity={0.5}
            roughness={0.5}
          />
        </mesh>
      );
    });
  }, [streets]);

  return <group>{renderedStreets}</group>;
};
