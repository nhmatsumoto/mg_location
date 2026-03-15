import axios from 'axios';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  soil: {
    type: string;
    stabilityIndex: number;
    moistureContent: number;
  };
  climate: {
    temperature: number;
    precipitationRate: number;
    moistureContent: number;
  };
  topography: {
    elevation: number;
    slope: number;
    aspect: number;
  };
}

export const geoCentralApi = {
  getTacticalData: async (lat: number, lng: number): Promise<GeoPoint> => {
    const response = await axios.get<GeoPoint>(`/api/v1/GeoCentral/tactical?lat=${lat}&lng=${lng}`);
    return response.data;
  },
  
  getCityScaleData: async (minLat: number, minLng: number, maxLat: number, maxLng: number): Promise<GeoPoint[]> => {
    const response = await axios.get<GeoPoint[]>(`/api/v1/GeoCentral/city-scale?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}`);
    return response.data;
  }
};
