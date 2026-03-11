import { apiClient } from './apiClient';

export interface Campaign {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
}

export interface Donation {
  id: string;
  incidentId: string;
  donorName: string;
  amount: number;
  donatedAtUtc: string;
}

export interface Expense {
  id: string;
  incidentId: string;
  description: string;
  amount: number;
  spentAtUtc: string;
  category: string;
}

export const supportApi = {
  async getCampaigns(incidentId: string) {
    const response = await apiClient.get<Campaign[]>(`/api/incidents/${incidentId}/support/campaigns`);
    return response.data;
  },

  async getDonations(incidentId: string) {
    const response = await apiClient.get<Donation[]>(`/api/incidents/${incidentId}/support/donations`);
    return response.data;
  },

  async getExpenses(incidentId: string) {
    const response = await apiClient.get<Expense[]>(`/api/incidents/${incidentId}/support/expenses`);
    return response.data;
  }
};
