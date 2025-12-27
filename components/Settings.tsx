
import React from 'react';
import { UserSettings, PlanDuration } from '../types';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  onClearData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onClearData }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const testNotify = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
    } else if (Notification.permission === "granted") {
      new Notification("VapeLess Test: Keep it up!");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") new Notification("VapeLess Alerts Activated!");
      });
    }
  };

  return (
    <div className="p-4 space-y-8 bg-white pb-32">
      <div className="border-4 border-black p-2 bg-black text-white text-center font-black italic uppercase text-sm">
        System Preferences
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

      <div className="retro-border bg-white overflow-hidden">
        <div className="retro-window-header">NOTIFICATIONS.SYS</div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-bold uppercase">Mode</span>
            <select 
              value={settings.notificationMode} 
              onChange={e => handleChange('notificationMode', e.target.value)}
              className="font-black text-[10px] outline-none bg-white"
            >
              <option value="FIXED">FIXED_TIME</option>
              <option value="RANDOM">RANDOMIZED</option>
            </select>
          </div>
          <button onClick={testNotify} className="w-full py-2 border-2 border-black text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all">
            TEST_SIGNAL
          </button>
        </div>
      </div>

      <button onClick={onClearData} className="w-full py-4 bg-black text-white font-black hover:invert transition-all active:scale-95 uppercase text-xs">
        HARD_RESET_SYSTEM
      </button>

      <div className="text-center font-mono text-[8px] uppercase opacity-40">
        <p>VapeLess Retro v1.2.0-LTS</p>
        <p>BUILD_DATE: 2024-OCT-12</p>
      </div>
    </div>
  );
};
