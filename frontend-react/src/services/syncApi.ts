import { apiClient } from './apiClient';

export interface SyncStatus {
  lastEventId: number;
  syncedAt: string;
}

export interface SyncEvent {
  id: number;
  type: string;
  timestamp: string;
}

export const syncApi = {
  async getStatus() {
    const response = await apiClient.get<SyncStatus>('/api/sync');
    return response.data;
  },

  async listEvents() {
    const response = await apiClient.get<SyncEvent[]>('/api/events');
    return response.data;
  }
};
