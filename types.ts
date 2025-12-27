
export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, this would be hashed on the server
}

export interface PuffLog {
  id: string;
  timestamp: number;
  count: number;
}

export type PlanDuration = 15 | 20 | 30 | 60;

export interface UserSettings {
  podCost: number;
  puffsPerPod: number;
  dailyBudget: number;
  nicotineStrength: number;
  currency: string;
  quitDate: number | null;
  notificationTime: string;
  notificationMode: 'FIXED' | 'RANDOM';
  isOnboarded: boolean;
  planDuration: PlanDuration;
  planStartDate: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (puffs: PuffLog[], settings: UserSettings) => boolean;
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeRequiredSeconds: number;
  category: 'lung' | 'heart' | 'brain' | 'general';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
