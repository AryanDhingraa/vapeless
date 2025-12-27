
export interface PuffLog {
  id: string;
  timestamp: number;
  count: number;
}

export type PlanDuration = 15 | 20 | 30 | 60;

export interface UserSettings {
  podCost: number;
  puffsPerPod: number;
  dailyBudget: number; // This becomes the "Starting Limit"
  nicotineStrength: number; // mg/mL
  currency: string;
  quitDate: number | null;
  notificationTime: string; // HH:mm
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
