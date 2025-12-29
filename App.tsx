import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { AICoach } from './components/AICoach.tsx';
import { Settings } from './components/Settings.tsx';
import { HealthProgress } from './components/HealthProgress.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { Achievements } from './components/Achievements.tsx';
import { Auth } from './components/Auth.tsx';
import { AdminPanel } from './pages/AdminPanel.tsx';
import { PuffLog, UserSettings, User, Location } from './types.ts';
import { dbService, supabase } from './services/dbService.ts';
import { soundService } from './services/soundService.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'health' | 'coach' | 'social' | 'settings' | 'admin'>('dash');
  const [puffs, setPuffs] = useState<PuffLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isBooting, setIsBooting] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const initialized = useRef(false);

  const applyTheme = (t: 'light' | 'dark') => {
    setTheme(t);
    if (t === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const fetchUserData = useCallback(async (user: User) => {
    try {
      const data = await dbService.getUserData(user);
      setPuffs(data.puffs);
      applyTheme(data.themePreference);
      
      // Update admin status if fetched
      if (data.isAdmin !== user.isAdmin) {
        setCurrentUser(prev => prev ? { ...prev, isAdmin: data.isAdmin } : null);
      }

      if (data.settings && data.settings.substance_preference && data.settings.isOnboarded) {
        setSettings(data.settings);
      } else if (data.settings) {
         setSettings(data.settings);
      }
    } catch (e) {
      console.error("Uplink Failure", e);
    } finally {
      setTimeout(() => setIsBooting(false), 1000);
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
          if (event === 'SIGNED_IN') {
             await fetchUserData(u);
             // Ensure redirection to onboarding for new signups
             // We'll let the settings null check handle the transition to <Onboarding />
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setSettings(null);
          setPuffs([]);
          applyTheme('light');
        }
      });
    };
    init();
  }, [fetchUserData]);

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
    <div className="h-screen bg-[#fdfcf7] flex flex-col items-center justify-center mono p-10">
      <div className="w-full max-w-xs space-y-4">
        <div className="text-2xl font-black text-black italic tracking-tighter text-center">VELOBANK_OS_INIT</div>
        <div className="h-1 bg-black/10 overflow-hidden rounded-full">
          <div className="h-full bg-black animate-[loading_2s_infinite]"></div>
        </div>
        <div className="text-[10px] opacity-40 text-black mono uppercase tracking-widest text-center">Loading_Assets</div>
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
      case 'admin': return <AdminPanel />;
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
              STREAK_INTERLOCK: 10_PUFFS_LOGGED. OS_SECURE_LOCKOUT.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto scrollbar-hide">{renderContent()}</main>

      <nav className="glass-card m-4 mb-8 p-3 flex justify-around items-center absolute bottom-0 left-0 right-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
        <NavBtn active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon="fa-th-large" label="HUB" />
        <NavBtn active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon="fa-terminal" label="COACH" />
        <NavBtn active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon="fa-trophy" label="VAULT" />
        <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="fa-user-circle" label="IDENT" />
        {currentUser.isAdmin && (
          <NavBtn active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon="fa-microchip" label="ADMIN" />
        )}
      </nav>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-95 ${active ? 'bg-black text-white scale-110 shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'text-black opacity-30 hover:opacity-100'}`}>
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;