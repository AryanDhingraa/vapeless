import React from 'react';
import { UserSettings, PlanDuration } from '../types';
import { soundService } from '../services/soundService';

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

  return (
    <div className="p-6 space-y-8 pb-40 animate-in fade-in duration-500 overflow-y-auto h-full scrollbar-hide">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black italic tracking-tighter italic uppercase">IDENTITY_VAULT</h1>
        <button onClick={onLogout} className="text-[10px] font-black opacity-40 uppercase underline hover:opacity-100 transition-opacity">Logout_OS</button>
      </div>

      {/* Privacy Manifesto */}
      <div className="glass-card p-6 space-y-4 border-white/20 bg-white/5">
        <div className="flex items-center gap-2 text-indigo-400">
          <i className="fas fa-user-shield text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest mono">PRIVACY_PROTOCOL.DOC</span>
        </div>
        <p className="text-[11px] font-bold opacity-50 uppercase leading-loose italic mono">
          "OS_VAPELESS stores health and location telemetry purely for quitting research and the Vape Study. Data is anonymized and encrypted."
        </p>
      </div>

      {/* Hardware Config */}
      <div className="glass-card overflow-hidden border-white/20">
        <div className="bg-white/10 px-4 py-2 text-[10px] font-black uppercase mono flex justify-between">
          <span>HARDWARE_CONFIG.SYS</span>
          <i className="fas fa-cog"></i>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-[11px] font-black uppercase">Audio Feedback</span>
            <button 
              onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
              className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all border border-white/10 ${settings.soundEnabled ? 'bg-white text-black' : 'bg-transparent text-white opacity-40'}`}
            >
              {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Params */}
      <div className="glass-card overflow-hidden border-white/20">
        <div className="bg-white/10 px-4 py-2 text-[10px] font-black uppercase mono flex justify-between">
          <span>PLAN_MODIFIER.EXE</span>
          <i className="fas fa-sliders-h"></i>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-[11px] font-black uppercase">Intensity Level</span>
            <select 
              value={settings.planDuration} 
              onChange={e => handleChange('planDuration', parseInt(e.target.value) as PlanDuration)}
              className="font-black text-[11px] outline-none bg-black text-indigo-400 p-2 rounded-lg border border-white/10"
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
              className="w-20 text-right font-black bg-transparent border-b border-white/20 outline-none text-indigo-400" 
            />
          </div>
        </div>
      </div>

      {/* Data Destruction */}
      <div className="pt-4 space-y-4">
        <button onClick={onClearData} className="w-full py-5 glass-card text-red-500/80 border-red-500/20 font-black hover:bg-red-500/10 transition-colors uppercase text-xs tracking-widest">
          <i className="fas fa-trash-alt mr-2"></i> Wipe_Account_Data
        </button>
        <div className="text-center font-mono text-[8px] uppercase opacity-20 py-4 tracking-[0.4em]">
          VapeLess_NeoRetro_OS v3.0.1-LTS<br/>
          SECURE_AUTH_LAYER_ACTIVE
        </div>
      </div>
    </div>
  );
};