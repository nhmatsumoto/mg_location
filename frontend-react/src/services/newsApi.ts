import { apiClient } from './apiClient';

export interface NewsNotification {
  id: string;
  title: string;
  content: string;
  source: string;
  country: string;
  location: string;
  publishedAt: string;
  category: string;
  externalUrl?: string;
  latitude?: number;
  longitude?: number;
  climateInfo?: string;
  riskScore: number;
}

export const newsApi = {
  getNews: async (country?: string, location?: string, timeWindow?: string) => {
    try {
      const response = await apiClient.get(`/v1/news`, {
        params: { country, location, timeWindow }
      });
      // apiClient interceptor already unwraps Result<T>.data → response.data is ListResponseDto
      const payload = response.data;
      // ListResponseDto has .items; but interceptor may have unwrapped further
      if (Array.isArray(payload)) return payload as NewsNotification[];
      if (payload?.items) return payload.items as NewsNotification[];
      return [];
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
  },
  
  getNewsById: async (id: string) => {
    try {
      const response = await apiClient.get(`/v1/news/${id}`);
      return response.data as NewsNotification;
    } catch (error) {
      console.error(`Failed to fetch news with id ${id}:`, error);
      return null;
    }
  }
};
