
import React, { useState } from 'react';
import { UserSettings, PlanDuration } from '../types';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<UserSettings>({
    podCost: 15.00,
    puffsPerPod: 600,
    dailyBudget: 400, // This is the "Starting Puffs"
    nicotineStrength: 20,
    currency: '$',
    quitDate: null,
    notificationTime: '09:00',
    notificationMode: 'FIXED',
    isOnboarded: true,
    planDuration: 30,
    planStartDate: Date.now(),
    soundEnabled: true
  });

  const next = () => setStep(s => s + 1);

  const steps = [
    {
      title: "VAPELESS_BOOT.EXE",
      desc: "SYSTEM INITIALIZING... PLEASE INPUT USER HABIT DATA FOR OPTIMAL PERFORMANCE.",
      content: (
        <button onClick={next} className="w-full py-6 bg-black text-white font-black uppercase text-xl hover:invert transition-all shadow-[6px_6px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none">
          LOAD_DATA
        </button>
      )
    },
    {
      title: "PLAN_STRATEGY",
      desc: "SELECT YOUR QUITTING VELOCITY. THE SYSTEM WILL CALCULATE A DAILY TAPERING LIMIT.",
      content: (
        <div className="grid grid-cols-1 gap-2">
          {[
            { d: 15, label: '15_DAYS (AGGRESSIVE)' },
            { d: 20, label: '20_DAYS (FAST)' },
            { d: 30, label: '30_DAYS (BALANCED)' },
            { d: 60, label: '60_DAYS (GENTLE)' }
          ].map((plan) => (
            <button 
              key={plan.d}
              onClick={() => { setData({...data, planDuration: plan.d as PlanDuration}); next(); }}
              className="w-full py-3 border-2 border-black font-black hover:bg-black hover:text-white transition-all text-[10px] text-left px-4 flex justify-between items-center active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span>{plan.label}</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "BASELINE_HABITS",
      desc: "HOW MANY PUFFS DO YOU TAKE PER DAY CURRENTLY?",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Initial_Puffs</span>
            <input type="number" value={data.dailyBudget} onChange={e => setData({...data, dailyBudget: parseInt(e.target.value)})} className="w-20 text-right font-black outline-none bg-transparent" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Pod_Cost ({data.currency})</span>
            <input type="number" value={data.podCost} onChange={e => setData({...data, podCost: parseFloat(e.target.value)})} className="w-20 text-right font-black outline-none bg-transparent" />
          </div>
          <button onClick={next} className="w-full py-4 bg-black text-white font-black uppercase mt-4 hover:invert transition-all shadow-[4px_4px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none">NEXT_MOD</button>
        </div>
      )
    },
    {
      title: "FINAL_SYNC",
      desc: "SCHEDULE DAILY ALERTS AND SET YOUR STARTING TIMESTAMP.",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Start_Time</span>
            <input type="time" value={data.notificationTime} onChange={e => setData({...data, notificationTime: e.target.value})} className="font-black outline-none bg-transparent" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Start_Date</span>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={e => setData({...data, planStartDate: new Date(e.target.value).getTime()})} className="font-black outline-none text-xs bg-transparent" />
          </div>
          <button 
            onClick={() => {
              const startDate = data.planStartDate || Date.now();
              onComplete({
                ...data, 
                planStartDate: startDate,
                quitDate: startDate + (data.planDuration * 86400000) 
              });
            }} 
            className="w-full py-6 bg-black text-white font-black uppercase text-xl mt-4 hover:invert transition-all shadow-[6px_6px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            BOOT_PLAN
          </button>
        </div>
      )
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col justify-center animate-in fade-in duration-500 font-mono">
      <div className="retro-border bg-white overflow-hidden max-w-sm mx-auto w-full shadow-[12px_12px_0px_#000]">
        <div className="retro-window-header flex justify-between px-3 py-2 bg-black text-white text-[11px] font-black uppercase">
          <span>{current.title}</span>
          <span className="opacity-70">STEP {step + 1} OF {steps.length}</span>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="flex gap-1 p-1 bg-black/10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-1 transition-all duration-300 ${i <= step ? 'bg-black' : 'bg-black/10'}`}
            />
          ))}
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-black italic uppercase leading-tight border-l-4 border-black pl-3 py-1">
              {current.desc}
            </p>
          </div>
          
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {current.content}
          </div>
        </div>

        {/* Status Bar Footer */}
        <div className="bg-black text-white px-3 py-1 text-[8px] font-bold uppercase flex justify-between opacity-80">
          <span>STATUS: INITIALIZING</span>
          <span>BUFFER_READY</span>
        </div>
      </div>
    </div>
  );
};
