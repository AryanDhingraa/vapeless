import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { ChatMessage, UserSettings, PuffLog, User } from '../types';

interface AICoachProps {
  settings: UserSettings;
  puffs: PuffLog[];
  onUpdateSettings: (s: UserSettings) => void;
  user: User;
}

export const AICoach: React.FC<AICoachProps> = ({ settings, puffs, onUpdateSettings, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "> VELO_COACH_SYSTEM_V3.0\n> STATUS: SECURE_UPLINK_ACTIVE\n> AVAILABLE_INTEL_TOKENS: " + settings.tokens + "\n> SELECT QUERY PROTOCOL BELOW OR ENTER MANUAL OVERRIDE:", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = [
    "IMPACT_ON_HEART_RATE",
    "CRAVING_DETOUR_STRATEGY",
    "HEALTH_RECOVERY_TIMELINE",
    "NICOTINE_HALF_LIFE_DATA",
    "SAVINGS_PROJECTION_MODEL"
  ];

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (settings.tokens <= 0) {
      setShowStore(true);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: text.toUpperCase(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const success = await dbService.useToken(user.id, settings);
      if (!success) throw new Error("TOKEN_SYNC_ERR");
      onUpdateSettings({ ...settings, tokens: settings.tokens - 1 });

      const response = await getCoachResponse(text, settings, puffs.slice(-20));
      setMessages(prev => [...prev, { role: 'model', text: `> ${response?.toUpperCase() || "UNABLE TO ANALYZE"}`, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "> ERROR: COGNITIVE_UPLINK_TIMEOUT. CHECK TOKEN BALANCE.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] p-6 space-y-5 animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b border-white/10 pb-5">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase italic">COACH_INTERFACE</h1>
        <button 
          onClick={() => setShowStore(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
        >
          {settings.tokens} INTEL_TOKENS / TOP_UP
        </button>
      </div>

      <div className="flex-1 glass-card p-6 overflow-y-auto space-y-6 mono text-[12px] border-white/20">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-indigo-300 border-l-2 border-indigo-500/50 pl-5 py-2' : 'text-white/90 py-2'}>
            <div className="opacity-30 mb-3 text-[9px] tracking-widest uppercase">[{m.role === 'user' ? 'USER_INPUT' : 'SYS_OUTPUT'}]</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
          </div>
        ))}
        {isLoading && <div className="text-indigo-400 animate-pulse tracking-[0.3em] uppercase font-black text-[10px]">_PROCESSING_NEURAL_TELEMETRY...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {presets.map(p => (
          <button 
            key={p} 
            onClick={() => handleSend(p)}
            className="flex-shrink-0 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black opacity-60 hover:opacity-100 hover:border-white/50 transition-all uppercase mono"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <input 
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:bg-white/10 focus:border-white/40 transition-all uppercase mono"
          placeholder="SEND_INQUIRY..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(input)}
        />
        <button onClick={() => handleSend(input)} className="bg-white text-black px-10 rounded-2xl font-black text-xs neo-btn shadow-2xl">SUBMIT</button>
      </div>

      {showStore && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm p-12 space-y-10 text-center border-white/20 shadow-[0_0_100px_rgba(79,70,229,0.3)]">
            <div className="w-24 h-24 bg-indigo-600 rounded-[35%] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/50">
              <i className="fas fa-bolt text-5xl"></i>
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase italic">INTEL_UPGRADE</h2>
              <p className="text-[12px] opacity-60 uppercase mono leading-loose px-6">
                EXPAND ANALYTICAL CAPACITY. 10 INTEL_TOKENS GRANT ADVANCED RECOVERY PREDICTIONS AND BEHAVIORAL PATTERN MAPPING.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[30px] flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
              <span className="font-black text-sm mono">X10_TOKENS</span>
              <span className="text-3xl font-black tracking-tighter italic">$10.00</span>
            </div>
            <button className="w-full py-6 bg-indigo-600 rounded-3xl font-black text-sm neo-btn shadow-3xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all uppercase tracking-widest">
              INITIALIZE_TRANSACTION
            </button>
            <button onClick={() => setShowStore(false)} className="text-[12px] font-black opacity-30 uppercase underline tracking-widest hover:opacity-100 transition-opacity">
              Abort_Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};