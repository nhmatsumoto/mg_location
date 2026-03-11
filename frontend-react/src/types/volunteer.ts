export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'available' | 'assigned' | 'completed';
  category: 'rescue' | 'delivery' | 'first-aid' | 'logistics';
  createdAt: string;
  assignedTo?: string;
}

export interface VolunteerStats {
  activeTasks: number;
  completedTasks: number;
  impactScore: number;
  hoursContributed: number;
}
