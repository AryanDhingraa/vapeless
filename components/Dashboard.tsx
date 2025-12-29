import React, { useState, useMemo } from 'react';
import { PuffLog, UserSettings } from '../types.ts';

interface DashboardProps {
  puffs: PuffLog[];
  settings: UserSettings;
  addLog: (type: 'vape' | 'tobacco') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ puffs, settings, addLog }) => {
  const [activeSubstance, setActiveSubstance] = useState<'vape' | 'tobacco'>(settings.substance_preference === 'tobacco' ? 'tobacco' : 'vape');

  const today = new Date().setHours(0,0,0,0);
  const todayLogs = puffs.filter(p => p.timestamp >= today && p.type === activeSubstance);
  const totalCount = todayLogs.length;

  const heatmapPoints = useMemo(() => {
    return puffs.filter(p => p.location && p.type === activeSubstance).map(p => ({
      x: (p.location!.lng + 180) * (100 / 360),
      y: (90 - p.location!.lat) * (100 / 180)
    }));
  }, [puffs, activeSubstance]);

  return (
    <div className="p-6 space-y-6 pb-48 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img src={settings.avatar} alt="Avatar" className="w-12 h-12 rounded-xl border-2 border-white/20 bg-white/5" />
          <div className="space-y-1">
            <h2 className="text-[10px] font-black opacity-40 mono uppercase tracking-widest">Operator: @{settings.username}</h2>
            <h1 className="text-3xl font-black italic tracking-tighter italic text-white">VAPELESS_HUB</h1>
          </div>
        </div>
        <div className="text-right glass-card px-4 py-2 border-white/20 flex items-center gap-2">
          <i className="fas fa-bolt text-indigo-400 text-xs"></i>
          <span className="text-lg font-black mono text-white">{settings.tokens}</span>
        </div>
      </div>

      {/* Mode Switcher - Distinct Substance Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
        <button 
          onClick={() => setActiveSubstance('vape')}
          className={`flex-1 py-4 rounded-xl font-black text-[10px] transition-all duration-300 ${activeSubstance === 'vape' ? 'vape-gradient shadow-[0_0_25px_rgba(165,180,252,0.4)] scale-100' : 'opacity-30 hover:opacity-50 text-white'}`}
        >VAPE_SYSTEM</button>
        <button 
          onClick={() => setActiveSubstance('tobacco')}
          className={`flex-1 py-4 rounded-xl font-black text-[10px] transition-all duration-300 ${activeSubstance === 'tobacco' ? 'tobacco-gradient shadow-[0_0_25px_rgba(251,191,36,0.4)] scale-100' : 'opacity-30 hover:opacity-50 text-white'}`}
        >TOBACCO_CORE</button>
      </div>

      {/* Hero Analytics with Sleek Neo-Retro Progress */}
      <div className="glass-card p-10 flex flex-col items-center justify-center space-y-4 relative overflow-hidden border-white/20">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <div className={`h-full transition-all duration-1000 ${activeSubstance === 'vape' ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'}`} style={{ width: `${Math.min(100, (totalCount/settings.dailyBudget)*100)}%` }}></div>
        </div>
        <div className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em] mono text-white">DAILY_EXPOSURE_LEVEL</div>
        <div className="text-[10rem] font-black italic tracking-tighter leading-none animate-in zoom-in duration-700 text-white">{totalCount}</div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60 text-white">
           THRESHOLD: {settings.dailyBudget} UNITS
           <i className="fas fa-exclamation-circle text-[8px] animate-pulse"></i>
        </div>
      </div>

      {/* Spatial Distribution Map (Hotspots) */}
      <div className="glass-card p-6 space-y-5 border-white/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <i className={`fas fa-map-marker-alt text-[10px] ${activeSubstance === 'vape' ? 'text-indigo-400' : 'text-amber-400'}`}></i>
            <span className="text-[11px] font-black opacity-40 uppercase tracking-widest mono text-white">Hazard_Heatmap_Telemetry</span>
          </div>
          <span className="text-[9px] bg-white/10 px-2 py-1 rounded mono animate-pulse text-white">MONITORING_GEO</span>
        </div>
        <div className="h-52 w-full bg-black/60 relative border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-inner">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          {heatmapPoints.map((p, i) => (
            <div 
              key={i} 
              className={`absolute w-10 h-10 rounded-full blur-2xl opacity-60 animate-pulse ${activeSubstance === 'vape' ? 'bg-indigo-500' : 'bg-amber-500'}`} 
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
            ></div>
          ))}
          {heatmapPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] opacity-20 uppercase font-black text-center px-14 mono leading-relaxed italic text-white">
              AWAITING SPATIAL DATA... LOG ENTRIES TO MAP EXPOSURE PATTERNS.
            </div>
          )}
        </div>
      </div>

      {/* Deployment Link */}
      <button 
        onClick={() => {
          const url = window.location.origin;
          const msg = `Connection Link: ${url}. Join me in VapeLess_OS. System encryption ready. Let's quit together.`;
          navigator.clipboard.writeText(msg);
          alert("UPLINK_COPIED_TO_CLIPBOARD");
        }}
        className="w-full glass-card py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-colors border-dashed border-white/30 italic text-white"
      >
        <i className="fas fa-satellite-dish mr-3 animate-bounce"></i> DEPLOY_INVITE_SEQUENCE
      </button>

      {/* Physical Logging Trigger */}
      <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40 group">
        <button 
          onClick={() => addLog(activeSubstance)}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center neo-btn border-[14px] border-black shadow-[0_40px_80px_rgba(0,0,0,1)] ${activeSubstance === 'vape' ? 'vape-gradient' : 'tobacco-gradient'}`}
        >
          <i className="fas fa-plus text-6xl mb-2 group-active:rotate-90 transition-transform"></i>
          <span className="text-[11px] font-black uppercase tracking-tighter">LOG_{activeSubstance.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
};