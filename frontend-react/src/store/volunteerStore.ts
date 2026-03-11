import { create } from 'zustand';
import type { VolunteerTask, VolunteerStats } from '../types/volunteer';

interface VolunteerState {
  tasks: VolunteerTask[];
  stats: VolunteerStats | null;
  loading: boolean;
  isOnline: boolean;
  setTasks: (tasks: VolunteerTask[]) => void;
  setStats: (stats: VolunteerStats) => void;
  setLoading: (loading: boolean) => void;
  toggleOnline: () => void;
}

export const useVolunteerStore = create<VolunteerState>((set) => ({
  tasks: [],
  stats: null,
  loading: false,
  isOnline: false,
  setTasks: (tasks) => set({ tasks }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
}));
