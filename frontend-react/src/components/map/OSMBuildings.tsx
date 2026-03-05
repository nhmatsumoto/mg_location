import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import axios from 'axios';

interface BuildingData {
  id: string;
  points: [number, number][]; // lon, lat
  height: number;
  type: string;
}

export const OSMBuildings: React.FC = () => {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);

  // Bounding box for Ubá, MG (Tactical simulation area)
  // Expanded slightly for better context
  const bbox = "-20.94,-43.01,-20.88,-42.95";

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["building"](${bbox});
            way["building"](${bbox});
            relation["building"](${bbox});
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

        const parsedBuildings: BuildingData[] = response.data.elements
          .filter((el: any) => el.type === 'way' && el.nodes)
          .map((way: any) => {
            const points = way.nodes.map((nodeId: string) => nodes[nodeId]).filter(Boolean);
            const height = way.tags?.height 
              ? parseFloat(way.tags.height) 
              : way.tags?.['building:levels'] 
                ? parseFloat(way.tags['building:levels']) * 3.5 
                : 4 + Math.random() * 6;
            
            return {
              id: way.id,
              points,
              height: height * 0.15, // Scaled for tactical map
              type: way.tags?.building || 'yes'
            };
          });
        
        setBuildings(parsedBuildings);
      } catch (error) {
        console.error("OSM Fetch Error:", error);
      }
    };

    void fetchBuildings();
  }, []);

  const renderedBuildings = useMemo(() => {
    return buildings.map((b) => {
      if (b.points.length < 3) return null;

      const shape = new THREE.Shape();
      const project = (lon: number, lat: number) => [
        (lon + 51.9) * 2,
        -(lat + 14.2) * 2
      ];

      const start = project(b.points[0][0], b.points[0][1]);
      shape.moveTo(start[0], start[1]);
      
      for (let i = 1; i < b.points.length; i++) {
        const p = project(b.points[i][0], b.points[i][1]);
        shape.lineTo(p[0], p[1]);
      }

      // Material based on building type
      const isIndustrial = b.type === 'industrial' || b.type === 'warehouse';
      const isResidential = b.type === 'house' || b.type === 'apartments';
      
      let color = "#475569"; // Default Slate
      if (isIndustrial) color = "#64748b";
      if (isResidential) color = "#94a3b8";

      return (
        <group key={b.id}>
          {/* Main Building Volume */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} castShadow receiveShadow>
            <extrudeGeometry 
              args={[shape, { depth: b.height, bevelEnabled: false }]} 
            />
            <meshStandardMaterial 
              color={color} 
              roughness={0.4}
              metalness={0.3}
              emissive={color}
              emissiveIntensity={0.05}
            />
          </mesh>
          
          {/* Windows / Detail Overlay (Glowing at night check would be better but let's do a subtle texture feel) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
             <extrudeGeometry 
              args={[shape, { depth: b.height, bevelEnabled: false }]} 
            />
            <meshStandardMaterial 
              color="#22d3ee" 
              transparent 
              opacity={0.1} 
              wireframe
            />
          </mesh>
        </group>
      );
    });
  }, [buildings]);

  return <group>{renderedBuildings}</group>;
};
