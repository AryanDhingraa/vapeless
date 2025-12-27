
import React from 'react';
import { UserSettings, PlanDuration } from '../types';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  onClearData: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onClearData, onLogout }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-8 bg-white pb-32">
      <div className="border-4 border-black p-2 bg-black text-white text-center font-black italic uppercase text-sm">
        System Preferences
      </div>

      {/* IPHONE WIDGET GUIDE */}
      <div className="retro-border bg-black text-white p-4">
        <div className="text-[9px] font-black uppercase opacity-50 mb-2">IPHONE_WIDGET_GUIDE.DOC</div>
        <div className="space-y-2 text-[10px] font-bold uppercase leading-tight">
          <p>1. Open this page in Safari</p>
          <p>2. Tap the Share icon (square with arrow)</p>
          <p>3. Select "Add to Home Screen"</p>
          <p>4. Use the "WIDGET" button in header for instant logging</p>
        </div>
      </div>

      <div className="retro-border bg-white overflow-hidden">
        <div className="retro-window-header">PLAN_MODIFIER.EXE</div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-bold uppercase">Plan Type</span>
            <select 
              value={settings.planDuration} 
              onChange={e => handleChange('planDuration', parseInt(e.target.value) as PlanDuration)}
              className="font-black text-[10px] outline-none bg-white"
            >
              <option value={15}>15_DAY_HARD</option>
              <option value={20}>20_DAY_FAST</option>
              <option value={30}>30_DAY_BALANCED</option>
              <option value={60}>60_DAY_GENTLE</option>
            </select>
          </div>
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-bold uppercase">Starting Puffs</span>
            <input type="number" value={settings.dailyBudget} onChange={(e) => handleChange('dailyBudget', parseInt(e.target.value))} className="w-16 text-right font-black outline-none" />
          </div>
        </div>
      </div>
      
      <div className="retro-border bg-white overflow-hidden">
        <div className="retro-window-header">ECON_PARAMS.CFG</div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-bold uppercase">Unit Price ({settings.currency})</span>
            <input type="number" value={settings.podCost} onChange={(e) => handleChange('podCost', parseFloat(e.target.value))} className="w-16 text-right font-black outline-none" />
          </div>
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-bold uppercase">Unit Capacity</span>
            <input type="number" value={settings.puffsPerPod} onChange={(e) => handleChange('puffsPerPod', parseInt(e.target.value))} className="w-16 text-right font-black outline-none" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={onLogout} className="w-full py-4 border-4 border-black font-black hover:bg-black hover:text-white transition-all active:scale-95 uppercase text-xs">
          Logout_Session
        </button>
        <button onClick={onClearData} className="w-full py-4 bg-black text-white font-black hover:invert transition-all active:scale-95 uppercase text-xs">
          Wipe_Account_Data
        </button>
      </div>

      <div className="text-center font-mono text-[8px] uppercase opacity-40">
        <p>VapeLess Retro v1.2.1-LTS</p>
        <p>SECURE_AUTH_LAYER_ACTIVE</p>
      </div>
    </div>
  );
};
