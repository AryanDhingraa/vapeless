import React, { useState } from 'react';
import { UserSettings } from '../types';

export const Onboarding: React.FC<{ onComplete: (s: UserSettings) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<UserSettings>({
    username: '',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix',
    substance_preference: 'vape',
    tokens: 3,
    podCost: 15, puffsPerPod: 600, dailyBudget: 400, nicotineStrength: 20, currency: '$', quitDate: null, 
    notificationTime: '09:00', notificationMode: 'FIXED', isOnboarded: true, planDuration: 30, 
    planStartDate: Date.now(), soundEnabled: true
  });

  const next = () => setStep(step + 1);

  const avatars = [
    'Felix', 'Aneka', 'Sugar', 'Sassy', 'Cookie', 'Milo'
  ].map(seed => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`);

  const steps = [
    {
      title: "UPLINK_INITIALIZATION",
      desc: "WELCOME_USER. SYSTEM_VAPELESS REQUIRES BASELINE IDENTITY_DATA FOR ADDICTION_TRAJECTORY_STUDY.",
      content: (
        <div className="space-y-4">
          <input 
            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-black outline-none focus:border-white/40 mono uppercase text-white"
            placeholder="ASSIGN_USERNAME"
            autoFocus
            onChange={e => setData({...data, username: e.target.value.toUpperCase()})}
          />
          <button onClick={next} disabled={!data.username} className="w-full py-5 bg-white text-black rounded-2xl font-black neo-btn disabled:opacity-20 uppercase tracking-widest">INIT_PHASE_01</button>
        </div>
      )
    },
    {
      title: "IDENTITY_VISUAL",
      desc: "SELECT A SYSTEM AVATAR TO REPRESENT YOUR PROFILE IN THE VAULT.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {avatars.map(url => (
              <button 
                key={url}
                onClick={() => setData({...data, avatar: url})}
                className={`p-1 rounded-xl border-2 transition-all ${data.avatar === url ? 'border-white bg-white/10' : 'border-transparent opacity-50'}`}
              >
                <img src={url} alt="Avatar" className="w-full h-full rounded-lg" />
              </button>
            ))}
          </div>
          <button onClick={next} className="w-full py-5 bg-white text-black rounded-2xl font-black neo-btn uppercase tracking-widest">SAVE_VISUAL</button>
        </div>
      )
    },
    {
      title: "RESEARCH_PARAMETERS",
      desc: "AGE, DOB, AND GENDER INPUT REQUIRED FOR ANONYMIZED SCIENTIFIC AGGREGATION. DATA IS ENCRYPTED.",
      content: (
        <div className="space-y-4 text-white">
          <div className="space-y-2">
             <label className="text-[10px] font-black opacity-40 uppercase ml-2">Date of Birth</label>
             <input type="date" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm mono" onChange={e => {
                const birthDate = new Date(e.target.value);
                const age = new Date().getFullYear() - birthDate.getFullYear();
                setData({...data, dob: e.target.value, age});
              }}/>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black opacity-40 uppercase ml-2">Gender Identification</label>
             <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm mono uppercase text-white" onChange={e => setData({...data, gender: e.target.value})}>
                <option value="">SELECT_GENDER</option>
                <option value="M">MALE_IDENT</option>
                <option value="F">FEMALE_IDENT</option>
                <option value="X">NON_BINARY_IDENT</option>
              </select>
          </div>
          <button onClick={next} disabled={!data.dob || !data.gender} className="w-full py-5 bg-white text-black rounded-2xl font-black neo-btn uppercase tracking-widest disabled:opacity-20">CONFIRM_PARAMS</button>
        </div>
      )
    },
    {
      title: "ADDICTION_PROTOCOL",
      desc: "SELECT PRIMARY EXPOSURE SOURCE. OS INTERFACE WILL ADAPT TO YOUR SELECTION.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setData({...data, substance_preference: 'vape'}); next(); }} className="p-10 glass-card border-white/20 font-black text-xs hover:bg-white hover:text-black transition-all group text-white">
            <i className="fas fa-wind text-3xl mb-4 group-hover:scale-110 transition-transform"></i><br/>VAPE_LOGS
          </button>
          <button onClick={() => { setData({...data, substance_preference: 'tobacco'}); next(); }} className="p-10 glass-card border-white/20 font-black text-xs hover:bg-white hover:text-black transition-all group text-white">
            <i className="fas fa-smoking text-3xl mb-4 group-hover:scale-110 transition-transform"></i><br/>CIG_LOGS
          </button>
        </div>
      )
    },
    {
      title: "OS_UPLINK",
      desc: "YOU HAVE BEEN GRANTED 3 INITIAL INTEL_TOKENS. DAILY BUDGETS WILL BE CALCULATED BASED ON QUIT_VELOCITY.",
      content: (
        <button onClick={() => onComplete(data)} className="w-full py-8 bg-white text-black rounded-[30px] font-black text-2xl neo-btn shadow-2xl uppercase italic tracking-tighter">BOOT_VAPELESS_OS</button>
      )
    }
  ];

  const current = steps[step];

  return (
    <div className="h-screen flex items-center justify-center p-8 bg-black">
      <div className="glass-card w-full max-w-sm p-10 space-y-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] border-white/20">
        <div className="flex justify-between items-center">
          <h3 className="text-[#a5b4fc] font-black italic tracking-tighter text-3xl uppercase italic">{current.title}</h3>
          <span className="text-[10px] font-mono text-white/20">0{step + 1}/05</span>
        </div>
        <p className="text-[11px] font-bold opacity-40 uppercase leading-loose mono text-white">{current.desc}</p>
        <div className="animate-in slide-in-from-bottom-5 duration-500">{current.content}</div>
      </div>
    </div>
  );
};