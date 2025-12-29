import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { AICoach } from './components/AICoach.tsx';
import { Settings } from './components/Settings.tsx';
import { HealthProgress } from './components/HealthProgress.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { Achievements } from './components/Achievements.tsx';
import { Auth } from './components/Auth.tsx';
import { PuffLog, UserSettings, User, Location } from './types.ts';
import { dbService, supabase } from './services/dbService.ts';
import { soundService } from './services/soundService.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'health' | 'coach' | 'social' | 'settings'>('dash');
  const [puffs, setPuffs] = useState<PuffLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const initialized = useRef(false);

  const fetchUserData = useCallback(async (user: User) => {
    try {
      const data = await dbService.getUserData(user);
      setPuffs(data.puffs);
      
      // PERSISTENCE CHECK: If preference and onboarding exist, stay in HUB
      if (data.settings && data.settings.substance_preference && data.settings.isOnboarded) {
        setSettings(data.settings);
      } else if (data.settings) {
         setSettings(data.settings);
      }
    } catch (e) {
      console.error("Uplink Failure", e);
    } finally {
      // Small delay to appreciate the booting animation
      setTimeout(() => setIsBooting(false), 1500);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email || "" };
        setCurrentUser(u);
        await fetchUserData(u);
      } else {
        setIsBooting(false);
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email || "" };
          setCurrentUser(u);
          if (event === 'SIGNED_IN') await fetchUserData(u);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setSettings(null);
          setPuffs([]);
        }
      });
    };
    init();
  }, [fetchUserData]);

  // THE SAD REWARD: Monitor for "Negative Streak" (10 puffs in 1 hour)
  useEffect(() => {
    if (!puffs.length) return;
    const hourAgo = Date.now() - 3600000;
    const recentPuffs = puffs.filter(p => p.timestamp > hourAgo).length;
    if (recentPuffs >= 10) {
      setIsGlitching(true);
      soundService.play('error', settings?.soundEnabled ?? true);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500, 100, 500]);
      
      const timer = setTimeout(() => setIsGlitching(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [puffs, settings]);

  const addLog = useCallback((type: 'vape' | 'tobacco') => {
    const handleLog = (location?: Location) => {
      const newLog: PuffLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        count: 1,
        type,
        location
      };
      setPuffs(prev => [...prev, newLog]);
      if (currentUser) dbService.saveLog(currentUser, newLog);
      soundService.play('puff', settings?.soundEnabled ?? true);
      if (navigator.vibrate) navigator.vibrate(50);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLog({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => handleLog(),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      handleLog();
    }
  }, [currentUser, settings]);

  if (isBooting) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center mono p-10">
      <div className="w-full max-w-xs space-y-4">
        <div className="text-2xl font-black animate-pulse text-white italic tracking-tighter">VAPELESS_OS_BOOTING...</div>
        <div className="h-1 bg-white/10 overflow-hidden rounded-full">
          <div className="h-full bg-white animate-[loading_2s_infinite]"></div>
        </div>
        <div className="text-[10px] opacity-40 text-white mono uppercase tracking-widest">Establishing_Secure_Satellite_Link</div>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;
  
  if (!settings || !settings.substance_preference || !settings.isOnboarded) return (
    <Onboarding onComplete={(s) => { 
      setSettings(s); 
      if (currentUser) dbService.syncData(currentUser, puffs, s);
    }} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <Dashboard puffs={puffs} settings={settings} addLog={addLog} />;
      case 'health': return <HealthProgress quitDate={settings.quitDate} />;
      case 'coach': return <AICoach settings={settings} puffs={puffs} onUpdateSettings={setSettings} user={currentUser} />;
      case 'social': return <Achievements puffs={puffs} settings={settings} />;
      case 'settings': return <Settings settings={settings} setSettings={setSettings} onLogout={() => supabase.auth.signOut()} onClearData={() => {}} />;
    }
  };

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden transition-all duration-300 ${isGlitching ? 'glitch-active shake-active' : ''}`}>
      {isGlitching && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-red-900/90 text-white font-black text-center p-10 animate-in fade-in duration-500 backdrop-blur-xl">
          <i className="fas fa-exclamation-triangle text-8xl mb-8 animate-bounce"></i>
          <h2 className="text-6xl italic tracking-tighter mb-6">SYSTEM_FAILURE</h2>
          <div className="bg-black/40 border border-white/20 p-6 rounded-2xl space-y-4">
            <p className="mono text-xs uppercase opacity-90 leading-relaxed px-6">
              CRITICAL: ADDICTION_STREAK_DETECTED. 10_UNITS LOGGED WITHIN 60_MINUTE WINDOW. OS INTERLOCK ENGAGED. SEEK FRESH AIR.
            </p>
            <div className="h-1 bg-white/20 overflow-hidden rounded-full">
               <div className="h-full bg-red-500 animate-[loading_5s_linear]"></div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto scrollbar-hide">{renderContent()}</main>

      <nav className="glass-card m-4 mb-8 p-3 flex justify-around items-center absolute bottom-0 left-0 right-0 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <NavBtn active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon="fa-th-large" label="HUB" />
        <NavBtn active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon="fa-terminal" label="COACH" />
        <NavBtn active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon="fa-trophy" label="VAULT" />
        <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="fa-user-circle" label="IDENT" />
      </nav>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-95 ${active ? 'bg-white text-black scale-110 shadow-[0_10px_20px_rgba(255,255,255,0.2)]' : 'text-white opacity-40 hover:opacity-100'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;