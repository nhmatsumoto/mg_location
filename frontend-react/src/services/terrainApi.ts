import { apiClient } from './apiClient';

export const terrainApi = {
  async getContext(bbox: string) {
    const response = await apiClient.get('/api/terrain/context', {
      params: { bbox }
    });
    return response.data;
  }
};
