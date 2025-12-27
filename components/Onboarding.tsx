
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
    planStartDate: Date.now()
  });

  const next = () => setStep(s => s + 1);

  const steps = [
    {
      title: "VAPELESS_BOOT.EXE",
      desc: "SYSTEM INITIALIZING... PLEASE INPUT USER HABIT DATA FOR OPTIMAL PERFORMANCE.",
      content: (
        <button onClick={next} className="w-full py-6 bg-black text-white font-black uppercase text-xl retro-button">
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
              className="w-full py-3 border-2 border-black font-black hover:bg-black hover:text-white transition-all text-[10px] text-left px-4 flex justify-between items-center"
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
            <input type="number" value={data.dailyBudget} onChange={e => setData({...data, dailyBudget: parseInt(e.target.value)})} className="w-20 text-right font-black outline-none" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Pod_Cost ({data.currency})</span>
            <input type="number" value={data.podCost} onChange={e => setData({...data, podCost: parseFloat(e.target.value)})} className="w-20 text-right font-black outline-none" />
          </div>
          <button onClick={next} className="w-full py-4 bg-black text-white font-black uppercase mt-4">NEXT_MOD</button>
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
            <input type="time" value={data.notificationTime} onChange={e => setData({...data, notificationTime: e.target.value})} className="font-black outline-none" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-bold text-xs uppercase">Start_Date</span>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={e => setData({...data, planStartDate: new Date(e.target.value).getTime()})} className="font-black outline-none text-xs" />
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
            className="w-full py-6 bg-black text-white font-black uppercase text-xl mt-4"
          >
            BOOT_PLAN
          </button>
        </div>
      )
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col justify-center animate-in fade-in duration-500">
      <div className="retro-border bg-white overflow-hidden max-w-sm mx-auto w-full">
        <div className="retro-window-header flex justify-between">
          <span>{current.title}</span>
          <span>STP_0{step + 1}</span>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[10px] font-black italic uppercase leading-tight border-l-2 border-black pl-2">{current.desc}</p>
          {current.content}
        </div>
      </div>
    </div>
  );
};
