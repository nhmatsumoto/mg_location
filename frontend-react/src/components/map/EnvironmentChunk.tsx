import React, { useMemo } from 'react';
import { TerrainMesh } from './TerrainMesh';
import { TacticalStreets } from './TacticalStreets';
import { OSMBuildings } from './OSMBuildings';
import { TacticalVegetation } from './TacticalVegetation';
import { MapZoneLayer } from './MapZoneLayer';

interface EnvironmentChunkProps {
  bbox: [number, number, number, number]; // minLat, minLon, maxLat, maxLon
  chunkId: string;
}

export const EnvironmentChunk: React.FC<EnvironmentChunkProps> = ({ bbox, chunkId }) => {
  const localSimulationBox = useMemo(() => {
    const minLat = bbox[0];
    const minLon = bbox[1];
    const maxLat = bbox[2];
    const maxLon = bbox[3];
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    const width = (maxLon - minLon) * (40075000 * Math.cos(centerLat * Math.PI / 180) / 360);
    const height = (maxLat - minLat) * 111320;
    
    return {
      center: [centerLat, centerLon] as [number, number],
      size: [width, height] as [number, number]
    };
  }, [bbox]);

  return (
    <group key={chunkId}>
      <TerrainMesh clippingPlanes={[]} overrideBox={localSimulationBox} /> 
      <TacticalStreets clippingPlanes={[] } overrideBox={localSimulationBox} />
      <OSMBuildings clippingPlanes={[]} overrideBox={localSimulationBox} />
      <TacticalVegetation clippingPlanes={[]} overrideBox={localSimulationBox} />
      <MapZoneLayer clippingPlanes={[]} overrideBox={localSimulationBox} />
    </group>
  );
};
