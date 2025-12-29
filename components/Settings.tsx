
import React from 'react';
import { UserSettings, PlanDuration } from '../types';
import { soundService } from '../services/soundService';
import { dbService, supabase } from '../services/dbService';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  onClearData: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onClearData, onLogout }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
    if (key === 'soundEnabled' && value === true) {
      soundService.play('success', true);
    }
  };

  const toggleTheme = async () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Optimistic UI update
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    try {
      // Fix: Use the exported supabase client directly instead of dbService.supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await dbService.updateThemePreference(user.id, newTheme);
      }
    } catch (e) {
      console.error("Theme persistent sync failed");
    }
  };

  return (
    <div className="p-6 space-y-8 pb-40 animate-in fade-in duration-500 overflow-y-auto h-full scrollbar-hide">
      <div className="flex justify-between items-end border-b border-black/10 pb-4">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">PREFERENCES</h1>
        <button onClick={onLogout} className="text-[10px] font-black opacity-40 uppercase underline hover:opacity-100 transition-opacity">Logout</button>
      </div>

      {/* Theme Toggle */}
      <div className="glass-card p-6 space-y-4 border-black/5 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase">System Visuals</span>
            <p className="text-[8px] opacity-40 uppercase">Toggle between Light/Dark OS</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-6 py-3 bg-black text-white text-[9px] font-black uppercase rounded-xl neo-btn shadow-md"
          >
            Switch Mode
          </button>
        </div>
      </div>

      {/* Hardware Config */}
      <div className="glass-card overflow-hidden border-black/5 shadow-sm bg-white">
        <div className="bg-black/5 px-4 py-2 text-[10px] font-black uppercase mono flex justify-between">
          <span>HARDWARE.SYS</span>
          <i className="fas fa-cog"></i>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <span className="text-[11px] font-black uppercase">Audio Feedback</span>
            <button 
              onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
              className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all border ${settings.soundEnabled ? 'bg-black text-white border-black' : 'bg-transparent text-black opacity-40 border-black/10'}`}
            >
              {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Params */}
      <div className="glass-card overflow-hidden border-black/5 shadow-sm bg-white">
        <div className="bg-black/5 px-4 py-2 text-[10px] font-black uppercase mono flex justify-between">
          <span>RECOVERY_PLAN.CFG</span>
          <i className="fas fa-sliders-h"></i>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <span className="text-[11px] font-black uppercase">Intensity</span>
            <select 
              value={settings.planDuration} 
              onChange={e => handleChange('planDuration', parseInt(e.target.value) as PlanDuration)}
              className="font-black text-[11px] outline-none bg-white text-black p-2 rounded-lg border border-black/10"
            >
              <option value={15}>15_DAY_HARD</option>
              <option value={20}>20_DAY_FAST</option>
              <option value={30}>30_DAY_BALANCED</option>
              <option value={60}>60_DAY_GENTLE</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase">Daily Budget</span>
            <input 
              type="number" 
              value={settings.dailyBudget} 
              onChange={(e) => handleChange('dailyBudget', parseInt(e.target.value))} 
              className="w-20 text-right font-black bg-transparent border-b border-black/20 outline-none text-black" 
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={onClearData} className="w-full py-5 glass-card text-red-500 border-red-100 font-black hover:bg-red-50 transition-colors uppercase text-xs tracking-widest shadow-sm">
          <i className="fas fa-trash-alt mr-2"></i> Wipe_OS_Data
        </button>
      </div>
    </div>
  );
};
