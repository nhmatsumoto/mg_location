import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { projectTo3D } from 'sos-3d-engine';

interface StreetData {
  id: string;
  points: [number, number][]; // lon, lat
  type: string;
}

interface TacticalStreetsProps {
  clippingPlanes?: THREE.Plane[];
  overrideBox?: any;
  data?: StreetData[];
}

export const TacticalStreets: React.FC<TacticalStreetsProps> = ({ clippingPlanes, data }) => {
  const [streets, setStreets] = useState<StreetData[]>([]);
  const store = useSimulationStore();
  const { activeLayers } = store;

  useEffect(() => {
    if (data) {
      setStreets(data);
    }
  }, [data]);

  const renderedStreets = useMemo(() => {
    if (!activeLayers.streets) return null;
    return streets.map((s) => {
      if (s.points.length < 2) return null;

      const project = (lon: number, lat: number) => projectTo3D(lat, lon);

      const points = s.points.map(p => {
        const [x, z] = project(p[0], p[1]);
        return new THREE.Vector3(x, 0.02, z); // slight offset to prevent Z-fighting
      });

      const curve = new THREE.CatmullRomCurve3(points);
      
      let width = 0.05;
      if (s.type === 'primary' || s.type === 'trunk') width = 0.15;
      if (s.type === 'secondary') width = 0.1;

      return (
        <mesh key={s.id} scale={[1, 0.02, 1]}>
          <tubeGeometry args={[curve, 64, width, 8, false]} />
          <meshStandardMaterial 
            color="#475569" 
            emissive="#000000"
            emissiveIntensity={0}
            roughness={0.9}
            flatShading
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      );
    });
  }, [streets, clippingPlanes]);

  return <group>{renderedStreets}</group>;
};
