import { apiClient } from './apiClient';

export const dataHubApi = {
  weatherForecast: (lat: number, lng: number) => apiClient.get('/weather/forecast', { params: { lat, lon: lng } }),
  weatherArchive: (lat: number, lng: number) => apiClient.get('/weather/archive', { params: { lat, lon: lng } }),
  alerts: () => apiClient.get('/alerts'),
  transparencyTransfers: () => apiClient.get('/transparency/transfers'),
  transparencySearch: (term: string) => apiClient.get('/transparency/search', { params: { query: term } }),
  satelliteLayers: () => apiClient.get('/satellite/layers'),
  satelliteRecent: () => apiClient.get('/satellite/goes/recent'),
};
