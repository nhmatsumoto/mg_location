import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import axios from 'axios';

interface StreetData {
  id: string;
  points: [number, number][]; // lon, lat
  type: string;
}

export const TacticalStreets: React.FC = () => {
  const [streets, setStreets] = useState<StreetData[]>([]);

  const bbox = "-20.94,-43.01,-20.88,-42.95";

  useEffect(() => {
    const fetchStreets = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            way["highway"](${bbox});
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

        const parsedStreets: StreetData[] = response.data.elements
          .filter((el: any) => el.type === 'way' && el.nodes)
          .map((way: any) => ({
            id: way.id,
            points: way.nodes.map((nodeId: string) => nodes[nodeId]).filter(Boolean),
            type: way.tags?.highway || 'residential'
          }));
        
        setStreets(parsedStreets);
      } catch (error) {
        console.error("OSM Streets Fetch Error:", error);
      }
    };

    void fetchStreets();
  }, []);

  const renderedStreets = useMemo(() => {
    return streets.map((s) => {
      if (s.points.length < 2) return null;

      const project = (lon: number, lat: number) => [
        (lon + 51.9) * 2,
        -(lat + 14.2) * 2
      ];

      const points = s.points.map(p => {
        const [x, z] = project(p[0], p[1]);
        return new THREE.Vector3(x, -0.38, z); // Slightly above terrain
      });

      const curve = new THREE.CatmullRomCurve3(points);
      
      // Determine width based on type
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
