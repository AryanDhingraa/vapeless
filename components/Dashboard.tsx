
import React, { useEffect, useState } from 'react';
import { PuffLog, UserSettings } from '../types.ts';
import { getDailyInsight } from '../services/geminiService.ts';
import { soundService } from '../services/soundService.ts';

interface DashboardProps {
  puffs: PuffLog[];
  settings: UserSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ puffs, settings }) => {
  const [insight, setInsight] = useState<string>("SYSTEM_IDLE...");
  const [showLogBook, setShowLogBook] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const planStart = settings.planStartDate || Date.now();
  const daysInPlan = settings.planDuration;
  const daysElapsed = Math.floor((Date.now() - planStart) / 86400000);
  const currentDay = Math.min(daysInPlan, Math.max(0, daysElapsed + 1));
  
  const calculateLimitForDay = (day: number) => {
    const factor = Math.max(0, 1 - (day - 1) / daysInPlan);
    return Math.floor(settings.dailyBudget * factor);
  };
  
  const todayLimit = calculateLimitForDay(currentDay);
  const todayStart = new Date(systemTime.getFullYear(), systemTime.getMonth(), systemTime.getDate()).getTime();
  const todayPuffs = puffs.filter(p => p.timestamp >= todayStart).length;

  // REFINED PATTERN ANALYSIS: Find the most active hour across entire history
  const getPeakHour = () => {
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
  };

  const peakData = getPeakHour();

  useEffect(() => {
    if (puffs.length > 0) {
      getDailyInsight(puffs, settings).then(setInsight);
    }
  }, [puffs.length]);

  const totalPuffs = puffs.length;
  const costPerPuff = settings.podCost / settings.puffsPerPod;
  const totalSpent = totalPuffs * costPerPuff;

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

  return (
    <div className="space-y-6 pb-40 px-4 pt-4">
      <div className="flex justify-between items-center text-[9px] font-black uppercase opacity-40 px-1 border-b border-black pb-1">
        <span>VAPELESS_OS_V1.2</span>
        <span>{systemTime.toLocaleTimeString([], { hour12: false })}</span>
      </div>

      {/* DANGER ZONE / PEAK USAGE */}
      <div className="retro-border bg-black text-white p-4">
        <div className="text-[9px] font-black uppercase opacity-50 mb-1">DANGER_ZONE.LOG</div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black">
            {peakData ? peakData.hour : "ANALYZING..."}
          </div>
          <div className="flex-1 text-[8px] font-bold uppercase leading-tight opacity-80">
            {peakData 
              ? `Your peak usage occurs at this time. Statistics show this is your highest risk window for relapsing. STAY ALERT.`
              : "Gathering behavior data... Continue logging to reveal your daily addiction patterns."}
          </div>
        </div>
      </div>

      <div className="retro-border bg-white overflow-hidden">
        <div className="retro-window-header flex justify-between">
          <span>PLAN_STATUS</span>
          <span>DAY_{currentDay}/{daysInPlan}</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span>Progress</span>
            <span>{Math.round((currentDay / daysInPlan) * 100)}%</span>
          </div>
          <div className="h-6 w-full border-2 border-black p-0.5 bg-white">
            <div 
              className="h-full bg-black transition-all duration-1000"
              style={{ width: `${(currentDay / daysInPlan) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase">
            <span>Limit: {todayLimit}</span>
            <span>Used: {todayPuffs}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="retro-border bg-white p-4 flex flex-col justify-between h-28">
          <div className="text-[9px] font-black uppercase opacity-50">TODAY</div>
          <div className={`text-4xl font-black ${todayPuffs > todayLimit ? 'text-red-600' : 'text-black'}`}>
            {todayPuffs}
          </div>
          <div className="text-[8px] font-bold uppercase">Puffs_Logged</div>
        </div>
        <div className="retro-border bg-black text-white p-4 flex flex-col justify-between h-28">
          <div className="text-[9px] font-black uppercase opacity-40">DRAIN</div>
          <div className="text-3xl font-black">{settings.currency}{totalSpent.toFixed(2)}</div>
          <div className="text-[8px] font-bold uppercase">Total_Burned</div>
        </div>
      </div>

      <div className="retro-border bg-white p-4 border-l-8 border-l-black">
        <div className="text-[9px] font-black uppercase mb-1">AI_COACH_TIP</div>
        <p className="text-[10px] font-bold leading-tight uppercase italic opacity-80">"{insight}"</p>
      </div>

      <div className="retro-border bg-white overflow-hidden">
        <button 
          onClick={toggleLogBook}
          className="w-full retro-window-header flex justify-between items-center px-3 py-2 cursor-pointer active:invert"
        >
          <span>HISTORY_LOG.DB</span>
          <i className={`fas ${showLogBook ? 'fa-folder-open' : 'fa-folder'}`}></i>
        </button>
        {showLogBook && (
          <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-5 font-black text-[8px] border-b-2 border-black pb-1 mb-1 text-center uppercase">
              <span>Day</span><span>Date</span><span>Puffs</span><span>Lim</span><span>Stat</span>
            </div>
            {dailyHistory.slice().reverse().map((day) => (
              <div key={day.dayNum} className={`grid grid-cols-5 py-2 border-b border-black/5 text-[9px] text-center font-mono items-center ${day.dayNum === currentDay ? 'bg-black/10 font-black' : ''}`}>
                <span>#{day.dayNum}</span>
                <span className="opacity-60">{day.date}</span>
                <span className={day.success ? '' : 'text-red-600 font-black'}>{day.count}</span>
                <span className="opacity-40">{day.limit}</span>
                <span className={`px-1 py-0.5 text-[7px] font-black mx-1 ${day.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {day.success ? 'OK' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
