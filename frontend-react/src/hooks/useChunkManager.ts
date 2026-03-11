import { useState, useEffect, useMemo } from 'react';
import { projectTo3D, invertFrom3D } from 'sos-3d-engine';

export interface Chunk {
  id: string;
  x: number;
  z: number;
  bbox: [number, number, number, number]; // minLat, minLon, maxLat, maxLon
}

export const useChunkManager = (heroLatLon: [number, number], chunkSize: number = 500, radius: number = 1) => {
  const [activeChunks, setActiveChunks] = useState<Chunk[]>([]);

  const chunks = useMemo(() => {
    const [worldX, worldZ] = projectTo3D(heroLatLon[0], heroLatLon[1]);
    
    // Current chunk based on world position
    const chunkX = Math.floor(worldX / chunkSize);
    const chunkZ = Math.floor(worldZ / chunkSize);

    const newChunks: Chunk[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const cx = chunkX + dx;
        const cz = chunkZ + dz;
        const id = `${cx}_${cz}`;
        
        // World coordinates for chunk corners
        const worldMinX = cx * chunkSize;
        const worldMaxX = (cx + 1) * chunkSize;
        const worldMinZ = cz * chunkSize;
        const worldMaxZ = (cz + 1) * chunkSize;

        const [minLat, minLon] = invertFrom3D(worldMinX, worldMaxZ);
        const [maxLat, maxLon] = invertFrom3D(worldMaxX, worldMinZ);

        newChunks.push({
          id,
          x: cx,
          z: cz,
          bbox: [minLat, minLon, maxLat, maxLon]
        });
      }
    }
    return newChunks;
  }, [heroLatLon, chunkSize, radius]);

  useEffect(() => {
    setActiveChunks(chunks);
  }, [chunks]);

  return activeChunks;
};
