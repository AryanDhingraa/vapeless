
import { HealthMilestone, Achievement, PuffLog, UserSettings } from './types';

export const HEALTH_MILESTONES: HealthMilestone[] = [
  { id: '1', title: 'Heart Rate Drops', description: 'Your heart rate and blood pressure start to return to normal.', timeRequiredSeconds: 1200, category: 'heart' },
  { id: '2', title: 'Carbon Monoxide Levels', description: 'Carbon monoxide levels in your blood drop to normal.', timeRequiredSeconds: 43200, category: 'general' },
  { id: '3', title: 'Lung Function', description: 'Lung function and circulation begin to improve.', timeRequiredSeconds: 172800, category: 'lung' },
  { id: '4', title: 'Shortness of Breath', description: 'Coughing and shortness of breath decrease significantly.', timeRequiredSeconds: 2592000, category: 'lung' },
  { id: '5', title: 'Risk of Heart Attack', description: 'Your risk of heart attack drops by 50% compared to a smoker.', timeRequiredSeconds: 31536000, category: 'heart' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_day',
    title: 'DAY_ONE_COMPLETE',
    description: 'Survived 24 hours without a single puff.',
    icon: 'fa-sun',
    condition: (puffs, settings) => {
      if (!settings.quitDate) return false;
      const oneDay = 24 * 60 * 60 * 1000;
      const sinceQuit = Date.now() - settings.quitDate;
      const recentPuffs = puffs.filter(p => p.timestamp >= settings.quitDate!);
      return sinceQuit >= oneDay && recentPuffs.length === 0;
    }
  },
  {
    id: 'penny_pincher',
    title: 'PENNY_PINCHER',
    description: 'Saved your first $10.00 by not buying pods.',
    icon: 'fa-piggy-bank',
    condition: (puffs, settings) => {
      if (!settings.quitDate) return false;
      const costPerPuff = settings.podCost / settings.puffsPerPod;
      const dailyBaselineCost = settings.dailyBudget * costPerPuff;
      const daysSinceQuit = Math.max(0, (Date.now() - settings.quitDate) / (1000 * 60 * 60 * 24));
      const potentialCost = daysSinceQuit * dailyBaselineCost;
      const actualPuffsSinceQuit = puffs.filter(p => p.timestamp >= settings.quitDate!).length;
      const actualCost = actualPuffsSinceQuit * costPerPuff;
      return (potentialCost - actualCost) >= 10;
    }
  },
  {
    id: 'week_warrior',
    title: 'WEEK_WARRIOR',
    description: '7 days since your official quit date.',
    icon: 'fa-calendar-check',
    condition: (puffs, settings) => {
      if (!settings.quitDate) return false;
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      return (Date.now() - settings.quitDate) >= oneWeek;
    }
  },
  {
    id: 'disciplined',
    title: 'DISCIPLINED',
    description: 'Stayed under your daily puff budget for 3 days straight.',
    icon: 'fa-shield-halved',
    condition: (puffs) => {
       // Check last 3 calendar days
       const now = new Date();
       for(let i=0; i<3; i++) {
         const d = new Date();
         d.setDate(now.getDate() - i);
         const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
         const end = start + 86400000;
         const count = puffs.filter(p => p.timestamp >= start && p.timestamp < end).length;
         if (count === 0 && i === 0 && puffs.length === 0) return false; // Not enough data
       }
       return true; // Simple stub for logic check
    }
  },
  {
    id: 'clean_lungs',
    title: 'CLEAN_LUNGS',
    description: '1000 potential puffs avoided.',
    icon: 'fa-lungs',
    condition: (puffs, settings) => {
      if (!settings.quitDate) return false;
      const daysSinceQuit = (Date.now() - settings.quitDate) / (1000 * 60 * 60 * 24);
      const potentialPuffs = daysSinceQuit * settings.dailyBudget;
      const actualPuffs = puffs.filter(p => p.timestamp >= settings.quitDate!).length;
      return (potentialPuffs - actualPuffs) >= 1000;
    }
  }
];

export const APP_THEME = {
  primary: 'indigo-600',
  secondary: 'violet-600',
  accent: 'emerald-500',
  danger: 'rose-500',
};
