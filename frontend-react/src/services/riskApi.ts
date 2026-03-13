import { apiClient } from './apiClient';

export interface RiskAssessment {
  model: {
    name: string;
    version: string;
  };
  riskMap: Array<{
    lat: number;
    lon: number;
    severity: string;
    riskScore: number;
  }>;
  analytics: {
    affectedPopulation: number;
    criticalInfrastructureCount: number;
  };
}

export const riskApi = {
  async getAssessment(lat: number, lon: number, radiusKm: number = 10) {
    const response = await apiClient.get<RiskAssessment>('/api/risk/assessment', {
      params: { lat, lon, radiusKm }
    });
    return response.data;
  },

  async pipelineSync() {
    const response = await apiClient.post('/risk/pipeline-sync');
    return response.data;
  }
};
