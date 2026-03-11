export const PROJECTION_CONFIG = {
  LAT_REF: -20.91,
  LON_REF: -42.98,
  SCALE: 1113.2,
};

export const projectTo3D = (lat: number, lon: number): [number, number] => {
  const x = (lon - PROJECTION_CONFIG.LON_REF) * PROJECTION_CONFIG.SCALE * Math.cos(PROJECTION_CONFIG.LAT_REF * Math.PI / 180);
  const z = -(lat - PROJECTION_CONFIG.LAT_REF) * PROJECTION_CONFIG.SCALE;
  return [x, z];
};

export const invertFrom3D = (x: number, z: number): [number, number] => {
  const lon = (x / (PROJECTION_CONFIG.SCALE * Math.cos(PROJECTION_CONFIG.LAT_REF * Math.PI / 180))) + PROJECTION_CONFIG.LON_REF;
  const lat = -(z / PROJECTION_CONFIG.SCALE) + PROJECTION_CONFIG.LAT_REF;
  return [lat, lon];
};
