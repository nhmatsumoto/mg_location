import { apiClient } from './apiClient';

export interface SupportPoint {
  id: string;
  recordType: string;
  title: string;
  lat: number;
  lng: number;
  status: string;
  metadata?: { type?: string; capacity?: number };
}

export interface RiskArea {
  id: string;
  recordType: string;
  title: string;
  severity: string;
  lat: number;
  lng: number;
  radiusMeters?: number | null;
  status: string;
  metadata?: { notes?: string };
}

export interface RescueGroup {
  id: string;
  name: string;
  members: number;
  specialty: string;
  status: string;
  lat?: number | null;
  lng?: number | null;
}

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

export interface FlowPath {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface MissingPersonLite {
  id: string;
  personName: string;
  lastSeenLocation: string;
  lat?: number | null;
  lng?: number | null;
}

export interface OperationsSnapshot {
  generatedAtUtc: string;
  kpis: {
    criticalAlerts: number;
    activeTeams: number;
    rain24hMm: number;
    suppliesInTransit: number;
  };
  layers: {
    supportPoints: SupportPoint[];
    riskAreas: RiskArea[];
    rescueGroups: RescueGroup[];
    flowPaths: FlowPath[];
    missingPersons: MissingPersonLite[];
    hotspots: Array<{ id: string; lat: number; lng: number; score: number; type: string }>;
  };
  weather: {
    summary: string;
    rain24hMm: number;
    soilSaturation: string;
  };
  logistics: Array<{ id: string; item: string; quantity: number; status: string; priority: string }>;
}

export const operationsApi = {
  async snapshot() {
    const response = await apiClient.get<OperationsSnapshot>('/api/operations/snapshot');
    return response.data;
  },

  async listSupportPoints() {
    const response = await apiClient.get<SupportPoint[]>('/api/support-points');
    return response.data;
  },
  async createSupportPoint(payload: { name: string; type: string; lat: number; lng: number; capacity?: number; status?: string }) {
    const response = await apiClient.post('/api/support-points', payload);
    return response.data;
  },
  async updateSupportPoint(id: string, payload: { name: string; type: string; lat: number; lng: number; capacity?: number; status?: string }) {
    const response = await apiClient.put(`/api/support-points?id=${id}`, payload);
    return response.data;
  },
  async deleteSupportPoint(id: string) {
    const response = await apiClient.delete(`/api/support-points?id=${id}`);
    return response.data;
  },

  async listRiskAreas() {
    const response = await apiClient.get<RiskArea[]>('/api/risk-areas');
    return response.data;
  },
  async createRiskArea(payload: { name: string; severity: string; lat: number; lng: number; radiusMeters?: number; notes?: string; status?: string }) {
    const response = await apiClient.post('/api/risk-areas', payload);
    return response.data;
  },
  async updateRiskArea(id: string, payload: { name: string; severity: string; lat: number; lng: number; radiusMeters?: number; notes?: string; status?: string }) {
    const response = await apiClient.put(`/api/risk-areas?id=${id}`, payload);
    return response.data;
  },
  async deleteRiskArea(id: string) {
    const response = await apiClient.delete(`/api/risk-areas?id=${id}`);
    return response.data;
  },


  async createMapAnnotation(payload: {
    recordType: 'support_point' | 'risk_area' | 'missing_person';
    title: string;
    lat: number;
    lng: number;
    severity?: string;
    radiusMeters?: number;
    status?: string;
    personName?: string;
    lastSeenLocation?: string;
    contactPhone?: string;
    city?: string;
    metadata?: Record<string, unknown>;
  }) {
    const response = await apiClient.post('/api/map-annotations', payload);
    return response.data;
  },

  async listRescueGroups() {
    const response = await apiClient.get<RescueGroup[]>('/api/rescue-groups');
    return response.data;
  },
  async createRescueGroup(payload: { name: string; members: number; specialty: string; status: string; lat?: number; lng?: number }) {
    const response = await apiClient.post('/api/rescue-groups', payload);
    return response.data;
  },
  async updateRescueGroup(id: string, payload: { name: string; members: number; specialty: string; status: string; lat?: number; lng?: number }) {
    const response = await apiClient.put(`/api/rescue-groups?id=${id}`, payload);
    return response.data;
  },
  async deleteRescueGroup(id: string) {
    const response = await apiClient.delete(`/api/rescue-groups?id=${id}`);
    return response.data;
  },

  async listSupplies() {
    const response = await apiClient.get<SupplyItem[]>('/api/supply-logistics');
    return response.data;
  },
  async createSupply(payload: { item: string; quantity: number; unit?: string; origin?: string; destination?: string; status?: string; priority?: string }) {
    const response = await apiClient.post('/api/supply-logistics', payload);
    return response.data;
  },
  async updateSupply(id: string, payload: { item: string; quantity: number; unit?: string; origin?: string; destination?: string; status?: string; priority?: string }) {
    const response = await apiClient.put(`/api/supply-logistics?id=${id}`, payload);
    return response.data;
  },
  async deleteSupply(id: string) {
    const response = await apiClient.delete(`/api/supply-logistics?id=${id}`);
    return response.data;
  },
};
