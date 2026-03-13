import { apiClient } from './apiClient';

export interface SupplyItem {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: string;
  priority: string;
}

export const logisticsApi = {
  async getAll() {
    const response = await apiClient.get<SupplyItem[]>('/api/Logistics');
    return response.data;
  },

  async create(payload: Partial<SupplyItem>) {
    const response = await apiClient.post('/Logistics', payload);
    return response.data;
  }
};
