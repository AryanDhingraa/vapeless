export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface PuffLog {
  id: string;
  timestamp: number;
  count: number;
  user_id?: string;
  type: 'vape' | 'tobacco';
  location?: Location;
}

export type PlanDuration = 15 | 20 | 30 | 60;

export interface UserSettings {
  username: string;
  avatar?: string;
  dob?: string;
  age?: number;
  gender?: string;
  substance_preference: 'vape' | 'tobacco' | 'dual';
  tokens: number;
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
  isAdmin?: boolean;
  soundEnabled: boolean;
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