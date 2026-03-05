import { create } from 'zustand';

export type QualityPreset = 'LOW' | 'MEDIUM' | 'HIGH';

interface SplatAsset {
  id: string;
  title: string;
  file_url: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  heading?: number;
  scale?: number;
  event_id?: string;
}

interface SplatState {
  activeSplatId: string | null;
  quality: QualityPreset;
  splats: SplatAsset[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveSplat: (id: string | null) => void;
  setQuality: (quality: QualityPreset) => void;
  fetchSplats: () => Promise<void>;
}

export const useSplatStore = create<SplatState>((set) => ({
  activeSplatId: null,
  quality: 'MEDIUM',
  splats: [],
  isLoading: false,
  error: null,

  setActiveSplat: (id) => set({ activeSplatId: id }),
  setQuality: (quality) => set({ quality }),
  fetchSplats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/splats/');
      if (!response.ok) throw new Error('Failed to fetch splat assets');
      const data = await response.json();
      set({ splats: data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
