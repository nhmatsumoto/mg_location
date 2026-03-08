import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from '../../utils/projection';

interface BuildingData {
  id: string;
  points: [number, number][]; // lon, lat
  height: number;
  type: string;
}

interface OSMBuildingsProps {
  clippingPlanes?: THREE.Plane[];
  data?: BuildingData[];
}

export const OSMBuildings: React.FC<OSMBuildingsProps> = ({ clippingPlanes, data }) => {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const store = useSimulationStore();
  
  const { rainIntensity, activeLayers } = store;

  useEffect(() => {
    if (data) {
      setBuildings(data);
    }
  }, [data]);

  const renderedBuildings = useMemo(() => {
    if (buildings.length === 0 || !activeLayers.buildings) return null;

    const project = (lon: number, lat: number) => projectTo3D(lat, lon);

    const gearsByType: Record<string, THREE.BufferGeometry[]> = {
      industrial: [],
      residential: [],
      commercial: [],
      hospital: [],
      default: []
    };

    buildings.forEach((b) => {
      if (b.points.length < 3) return;

      const shape = new THREE.Shape();
      const [startX, startZ] = project(b.points[0][0], b.points[0][1]);
      shape.moveTo(startX, startZ);
      
      for (let i = 1; i < b.points.length; i++) {
        const [px, pz] = project(b.points[i][0], b.points[i][1]);
        shape.lineTo(px, pz);
      }

      const geometry = new THREE.ExtrudeGeometry(shape, { depth: b.height, bevelEnabled: false });
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, 0, 0); // rest on the ground at Y=0

      const isIndustrial = b.type === 'industrial' || b.type === 'warehouse';
      const isResidential = b.type === 'house' || b.type === 'apartments';
      const isCommercial = b.type === 'retail' || b.type === 'commercial' || b.type === 'office';
      const isHospital = b.type === 'hospital';
      
      if (isIndustrial) gearsByType.industrial.push(geometry);
      else if (isResidential) gearsByType.residential.push(geometry);
      else if (isCommercial) gearsByType.commercial.push(geometry);
      else if (isHospital) gearsByType.hospital.push(geometry);
      else gearsByType.default.push(geometry);
    });

    return (
      <group>
        {Object.entries(gearsByType).map(([type, geos]) => {
          if (geos.length === 0) return null;
          
          const merged = mergeGeometries(geos);
          let color = "#475569"; 
          let metalness = 0.6;
          
          if (type === 'industrial') color = "#64748b";
          if (type === 'residential') { color = "#94a3b8"; metalness = 0.2; }
          if (type === 'commercial') { color = "#334155"; metalness = 0.8; }
          if (type === 'hospital') color = "#f8fafc";

          return (
            <group key={type}>
              <mesh geometry={merged} castShadow receiveShadow>
                <meshStandardMaterial 
                  color={color} 
                  roughness={0.4 - (rainIntensity / 400)} // More "wet" = smoother
                  metalness={metalness + (rainIntensity / 250)} // More "wet" = more reflective
                  emissive={color}
                  emissiveIntensity={0.05}
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
              <mesh geometry={merged}>
                <meshStandardMaterial 
                  color="#22d3ee" 
                  transparent 
                  opacity={0.03} 
                  wireframe
                  clippingPlanes={clippingPlanes}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }, [buildings, clippingPlanes, rainIntensity]);

  return <group>{renderedBuildings}</group>;
};
