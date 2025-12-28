
import React, { useEffect, useState, useMemo } from 'react';
import { PuffLog, UserSettings } from '../types.ts';
import { getDailyInsight } from '../services/geminiService.ts';
import { soundService } from '../services/soundService.ts';

interface DashboardProps {
  puffs: PuffLog[];
  settings: UserSettings;
  isAnimatePuff?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ puffs, settings, isAnimatePuff }) => {
  const [insight, setInsight] = useState<string>("SYSTEM_IDLE...");
  const [showLogBook, setShowLogBook] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(true);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const planStart = settings.planStartDate || Date.now();
  const daysInPlan = settings.planDuration;
  const daysElapsed = Math.max(0, Math.floor((Date.now() - planStart) / 86400000));
  const currentDay = Math.min(daysInPlan, daysElapsed + 1);
  
  const calculateLimitForDay = (day: number) => {
    const factor = Math.max(0, 1 - (day - 1) / daysInPlan);
    return Math.floor(settings.dailyBudget * factor);
  };
  
  const todayLimit = calculateLimitForDay(currentDay);
  const todayStart = new Date(systemTime.getFullYear(), systemTime.getMonth(), systemTime.getDate()).getTime();
  const todayPuffs = puffs.filter(p => p.timestamp >= todayStart).length;
  const budgetLeft = Math.max(0, todayLimit - todayPuffs);
  const batteryPercent = Math.round((budgetLeft / todayLimit) * 100);

  // Stats derivation
  const stats = useMemo(() => {
    const rolling7Sum = puffs
      .filter(p => p.timestamp >= (Date.now() - 7 * 86400000))
      .length;
    const avg7 = Math.round(rolling7Sum / 7);

    // Streak calculation (consecutive days under limit)
    let streak = 0;
    for (let i = 0; i <= daysElapsed; i++) {
      const dStart = planStart + (i * 86400000);
      const dEnd = dStart + 86400000;
      const dayNum = i + 1;
      const dayLimit = calculateLimitForDay(dayNum);
      const dayCount = puffs.filter(p => p.timestamp >= dStart && p.timestamp < dEnd).length;
      
      if (dayCount <= dayLimit) {
        streak++;
      } else {
        streak = 0;
      }
    }

    // Hearts (Life): Last 3 days performance
    const hearts = [true, true, true];
    for (let i = 0; i < 3; i++) {
      const dayIndex = daysElapsed - i;
      if (dayIndex < 0) continue;
      const dStart = planStart + (dayIndex * 86400000);
      const dEnd = dStart + 86400000;
      const dayNum = dayIndex + 1;
      const dayLimit = calculateLimitForDay(dayNum);
      const dayCount = puffs.filter(p => p.timestamp >= dStart && p.timestamp < dEnd).length;
      hearts[i] = dayCount <= dayLimit;
    }

    // XP & Level: (Days Since Start * 10) + (Budget Left * 5)
    // Actually XP is a cumulative concept. Let's make it more persistent.
    const baseXP = daysElapsed * 100;
    const performanceXP = streak * 50;
    const totalXP = baseXP + performanceXP + (budgetLeft * 2);
    const level = Math.floor(Math.sqrt(totalXP / 10));

    return { avg7, streak, hearts, totalXP, level };
  }, [puffs, settings, daysElapsed, budgetLeft]);

  // REFINED PATTERN ANALYSIS
  const peakData = useMemo(() => {
    if (puffs.length === 0) return null;
    const hourCounts = new Array(24).fill(0);
    puffs.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      hourCounts[hour]++;
    });
    const maxVal = Math.max(...hourCounts);
    if (maxVal === 0) return null;
    const peakHour = hourCounts.indexOf(maxVal);
    const ampm = peakHour >= 12 ? 'PM' : 'AM';
    const hour12 = peakHour % 12 || 12;
    return { hour: `${hour12}:00 ${ampm}`, count: maxVal };
  }, [puffs]);

  useEffect(() => {
    if (puffs.length > 0) {
      getDailyInsight(puffs, settings).then(setInsight);
    }
  }, [puffs.length]);

  const dailyHistory = Array.from({ length: currentDay }).map((_, i) => {
    const dayNum = i + 1;
    const dayTimestamp = planStart + (i * 86400000);
    const d = new Date(dayTimestamp);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    const count = puffs.filter(p => p.timestamp >= start && p.timestamp < end).length;
    const limit = calculateLimitForDay(dayNum);
    return { dayNum, date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count, limit, success: count <= limit };
  });

  const toggleLogBook = () => {
    soundService.play('click', settings.soundEnabled);
    setShowLogBook(!showLogBook);
  };

  const toggleAdvancedStats = () => {
    soundService.play('click', settings.soundEnabled);
    setShowAdvancedStats(!showAdvancedStats);
  };

  return (
    <div className={`space-y-6 pb-40 px-4 pt-4 font-mono transition-all ${isAnimatePuff ? 'animate-shake' : ''}`}>
      {/* HUD HEADER */}
      <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-60 px-1 border-b-2 border-black pb-1">
        <span>VAPELESS_OS_V2.0_HUD</span>
        <div className="flex gap-4">
          <span className="animate-pulse">LATENCY: 12ms</span>
          <span>{systemTime.toLocaleTimeString([], { hour12: false })}</span>
        </div>
      </div>

      {/* MISSION CONTROL */}
      <div className="retro-border bg-black text-[#00ff41] p-3 border-l-8 border-l-[#00ff41]">
        <div className="text-[8px] font-black opacity-50 mb-1">CURRENT_MISSION</div>
        <div className="text-[12px] font-black tracking-tighter uppercase italic">
          STAY UNDER {todayLimit} PUFFS TO LEVEL UP
        </div>
      </div>

      {/* LIFE & LEVEL HUD */}
      <div className="grid grid-cols-2 gap-4">
        <div className="retro-border bg-white p-3 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] font-black uppercase">LIFE_STATUS</span>
            <div className="flex gap-1">
              {stats.hearts.map((alive, i) => (
                <i key={i} className={`fas fa-heart text-[10px] ${alive ? 'text-red-500' : 'text-gray-200'}`}></i>
              ))}
            </div>
          </div>
          <div className="text-2xl font-black italic">LEVEL {stats.level}</div>
          <div className="text-[8px] font-bold opacity-50 uppercase">XP: {stats.totalXP}</div>
          <div className="h-2 w-full border border-black p-0.5 mt-1 bg-gray-100 overflow-hidden">
             <div className="h-full bg-blue-500" style={{ width: `${(stats.totalXP % 100)}%` }} />
          </div>
        </div>

        <div className="retro-border bg-white p-3 flex flex-col justify-between overflow-hidden">
           <div className="flex justify-between items-center mb-1">
             <span className="text-[8px] font-black uppercase">BATTERY_BUDGET</span>
             <span className={`text-[8px] font-black ${batteryPercent < 10 ? 'animate-flicker text-red-600' : ''}`}>
               {batteryPercent}%
             </span>
           </div>
           <div className="flex items-end gap-1 h-8">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 ${i < batteryPercent / 10 ? (batteryPercent < 20 ? 'bg-red-500' : 'bg-black') : 'bg-gray-100'} ${batteryPercent < 10 ? 'animate-flicker' : ''}`}
                  style={{ height: `${(i+1)*10}%` }}
                />
              ))}
           </div>
           <div className="text-[8px] font-bold opacity-50 uppercase mt-1">CAPACITY: {budgetLeft} / {todayLimit}</div>
        </div>
      </div>

      {/* MAIN TRACKER */}
      <div className="retro-border bg-white overflow-hidden shadow-[8px_8px_0px_#000]">
        <div className="retro-window-header flex justify-between bg-black text-white px-2 py-1">
          <span>REALTIME_TRACKER</span>
          <div className="flex items-center gap-2">
            <span className="text-[8px] animate-pulse">RECORDING...</span>
            <i className="fas fa-circle text-red-500 text-[6px]"></i>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
           <div className="text-[10px] font-black tracking-widest opacity-40 uppercase">Total_Today</div>
           <div className={`text-8xl font-black tracking-tighter ${todayPuffs > todayLimit ? 'text-red-600' : 'text-black'}`}>
             {todayPuffs}
           </div>
           <div className="text-[10px] font-black bg-black text-white px-3 py-1 uppercase tracking-tighter">
             LIMIT: {todayLimit} PUFFS
           </div>
        </div>
      </div>

      {/* ADVANCED STATS (COLLAPSIBLE) */}
      <div className="retro-border bg-white overflow-hidden">
        <button 
          onClick={toggleAdvancedStats}
          className="w-full bg-[#eee] border-b-2 border-black flex justify-between items-center px-3 py-2 text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all"
        >
          <span>METRICS_OVERRIDE.SYS</span>
          <i className={`fas ${showAdvancedStats ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
        </button>
        {showAdvancedStats && (
          <div className="grid grid-cols-2 divide-x-2 divide-y-2 divide-black border-b-2 border-black animate-in slide-in-from-top duration-300">
             <div className="p-4 flex flex-col items-center">
                <i className="fas fa-fire text-orange-500 text-xl mb-2 drop-shadow-[0_0_5px_rgba(255,165,0,0.5)]"></i>
                <div className="text-2xl font-black">{stats.streak}</div>
                <div className="text-[8px] font-black uppercase opacity-50">STREAK_DAYS</div>
             </div>
             <div className="p-4 flex flex-col items-center">
                <i className="fas fa-chart-line text-blue-500 text-xl mb-2"></i>
                <div className="text-2xl font-black">{stats.avg7}</div>
                <div className="text-[8px] font-black uppercase opacity-50">7D_ROLLING_AVG</div>
             </div>
             <div className="p-4 flex flex-col items-center">
                <i className="fas fa-skull text-red-600 text-xl mb-2"></i>
                <div className="text-2xl font-black">{peakData?.hour || 'N/A'}</div>
                <div className="text-[8px] font-black uppercase opacity-50">DANGER_HOUR</div>
             </div>
             <div className="p-4 flex flex-col items-center">
                <i className="fas fa-coins text-yellow-600 text-xl mb-2"></i>
                <div className="text-2xl font-black">{settings.currency}{ (puffs.length * (settings.podCost / settings.puffsPerPod)).toFixed(2) }</div>
                <div className="text-[8px] font-black uppercase opacity-50">DRAIN_AMOUNT</div>
             </div>
          </div>
        )}
      </div>

      {/* AI INSIGHT */}
      <div className="retro-border bg-[#ffff00] p-4 border-l-8 border-l-black shadow-[4px_4px_0px_#000]">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[9px] font-black uppercase">SYSTEM_INSIGHT.LOG</div>
          <i className="fas fa-microchip text-[10px]"></i>
        </div>
        <p className="text-[11px] font-black leading-tight uppercase italic text-black">"{insight}"</p>
      </div>

      {/* LOG BOOK (COLLAPSIBLE) */}
      <div className="retro-border bg-white overflow-hidden">
        <button 
          onClick={toggleLogBook}
          className="w-full retro-window-header flex justify-between items-center px-3 py-3 cursor-pointer active:invert bg-black text-white"
        >
          <span>HISTORY_LOG.DB</span>
          <i className={`fas ${showLogBook ? 'fa-folder-open' : 'fa-folder'}`}></i>
        </button>
        {showLogBook && (
          <div className="p-2 space-y-1 max-h-80 overflow-y-auto bg-white">
            <div className="grid grid-cols-5 font-black text-[8px] border-b-2 border-black pb-1 mb-1 text-center uppercase">
              <span>Day</span><span>Date</span><span>Puffs</span><span>Lim</span><span>Stat</span>
            </div>
            {dailyHistory.slice().reverse().map((day) => (
              <div key={day.dayNum} className={`grid grid-cols-5 py-2 border-b border-black/5 text-[9px] text-center font-mono items-center ${day.dayNum === currentDay ? 'bg-black/10 font-black' : ''}`}>
                <span>#{day.dayNum}</span>
                <span className="opacity-60">{day.date}</span>
                <span className={day.success ? '' : 'text-red-600 font-black'}>{day.count}</span>
                <span className="opacity-40">{day.limit}</span>
                <span className={`px-1 py-0.5 text-[7px] font-black mx-1 ${day.success ? 'bg-green-100 text-green-800 border border-green-800' : 'bg-red-100 text-red-800 border border-red-800'}`}>
                  {day.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes flicker-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-flicker {
          animation: flicker-red 0.5s infinite;
        }
      `}</style>
    </div>
  );
};
