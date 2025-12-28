
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { AICoach } from './components/AICoach.tsx';
import { Settings } from './components/Settings.tsx';
import { HealthProgress } from './components/HealthProgress.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { Achievements } from './components/Achievements.tsx';
import { Auth } from './components/Auth.tsx';
import { AdminPanel } from './pages/AdminPanel.tsx';
import { PuffLog, UserSettings, User } from './types.ts';
import { dbService, supabase } from './services/dbService.ts';
import { soundService } from './services/soundService.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'health' | 'coach' | 'settings' | 'badges' | 'admin'>('dash');
  const [puffs, setPuffs] = useState<PuffLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAnimatePuff, setIsAnimatePuff] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fetchUserData = useCallback(async (user: User) => {
    setIsLoadingData(true);
    try {
      const data = await dbService.getUserData(user);
      setPuffs(data.puffs);
      setSettings(data.settings);
      setIsAdmin(data.isAdmin);
    } catch (e) {
      console.error("Critical: Data Uplink Failure", e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const query = new URLSearchParams(window.location.search);
      if (query.get('type') === 'recovery') {
        setIsUpdatingPassword(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
        };
        setCurrentUser(user);
        await fetchUserData(user);
      }

      setIsBooting(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
          };
          setCurrentUser(user);
          if (event === 'SIGNED_IN') {
            await fetchUserData(user);
          }
        } else {
          setCurrentUser(null);
          setPuffs([]);
          setSettings(null);
          setIsAdmin(false);
        }
      });

      return subscription;
    };

    const authSubPromise = initializeAuth();
    return () => {
      authSubPromise.then(sub => sub?.unsubscribe());
    };
  }, [fetchUserData]);

  useEffect(() => {
    if (currentUser) {
      const channel = dbService.subscribeToLogs(currentUser.id, () => fetchUserData(currentUser));
      return () => { channel.unsubscribe(); };
    }
  }, [currentUser, fetchUserData]);

  useEffect(() => {
    if (currentUser && !isBooting && !isLoadingData && settings) {
      dbService.syncData(currentUser, puffs, settings);
    }
  }, [settings, currentUser, isBooting, isLoadingData, puffs]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    soundService.play('success', true);
  };

  const handleLogout = async () => {
    soundService.play('error', settings?.soundEnabled ?? true);
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    soundService.play('tab', settings?.soundEnabled ?? true);
  };

  const saveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    if (currentUser) {
      await dbService.syncData(currentUser, puffs, newSettings);
    }
  };

  const addPuff = useCallback(() => {
    const newPuff: PuffLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      count: 1
    };
    setPuffs(prev => [...prev, newPuff]);
    setIsAnimatePuff(true);
    setTimeout(() => setIsAnimatePuff(false), 200);
    soundService.play('puff', settings?.soundEnabled ?? true);
    if (currentUser) { dbService.savePuff(currentUser, newPuff); }
    if (window.navigator.vibrate) { window.navigator.vibrate(60); }
  }, [currentUser, settings]);

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 font-mono text-center">
        <div className="retro-border bg-black text-white p-8 max-w-xs space-y-6 shadow-[10px_10px_0px_#ccc]">
          <div className="text-2xl font-black italic tracking-tighter uppercase animate-pulse">BOOTING_OS...</div>
          <div className="h-[4px] w-full bg-white/20 overflow-hidden border border-white">
            <div className="h-full bg-white animate-loading-bar"></div>
          </div>
          <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Initialising Secure Vault</p>
        </div>
        <style>{`
          @keyframes loading { 0% { width: 0%; } 50% { width: 100%; } 100% { width: 0%; } }
          .animate-loading-bar { animation: loading 2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  if (isUpdatingPassword) {
    return (
      <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-full max-w-sm retro-border bg-white shadow-[12px_12px_0px_#000]">
          <div className="retro-window-header bg-black text-white px-3 py-2 uppercase font-black text-xs">Security_Patch.exe</div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const pass = (e.currentTarget.elements.namedItem('new-password') as HTMLInputElement).value;
            try {
              await dbService.updatePassword(pass);
              alert('SUCCESS: SECURITY_TOKEN_UPDATED');
              setIsUpdatingPassword(false);
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch { alert('FAILURE: SYSTEM_REJECT'); }
          }} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase">New_Access_Token</label>
              <input name="new-password" type="password" required className="w-full border-4 border-black p-4 text-sm font-black outline-none" placeholder="********" />
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 font-black uppercase hover:invert transition-all">Apply_Override</button>
            <button type="button" onClick={() => setIsUpdatingPassword(false)} className="w-full text-center text-[10px] font-black underline uppercase opacity-60">Abort</button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={handleLogin} />;
  if (isLoadingData && !settings) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center font-mono">
      <div className="text-xl font-black animate-pulse uppercase tracking-widest">SYNC_MODE_ACTIVE...</div>
    </div>
  );
  if (!settings) return <Onboarding onComplete={saveSettings} />;

  if (isWidgetMode) {
    const today = new Date().setHours(0,0,0,0);
    const todayCount = puffs.filter(p => p.timestamp >= today).reduce((acc, p) => acc + p.count, 0);
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 z-[1000] font-mono">
        <button onClick={() => { soundService.play('click', settings.soundEnabled); setIsWidgetMode(false); }} className="absolute top-12 right-6 text-white border-2 border-white px-4 py-2 text-[10px] font-black uppercase">Close_HUD</button>
        <div className="text-center space-y-4 mb-16">
          <div className="text-[12px] font-black tracking-widest opacity-50 uppercase italic">Uplink_Identity: {currentUser.email.split('@')[0]}</div>
          <div className="text-[120px] font-black leading-none tracking-tighter animate-pulse">{todayCount}</div>
          <div className="text-xs font-black uppercase bg-white text-black px-4 py-1">Daily_Exposure_Count</div>
        </div>
        <button onClick={addPuff} className={`w-64 h-64 rounded-full border-8 border-white bg-transparent flex items-center justify-center active:bg-white active:scale-95 transition-all ${isAnimatePuff ? 'bg-white shadow-[0_0_80px_rgba(255,255,255,0.7)]' : ''}`}>
          <span className={`text-6xl font-black ${isAnimatePuff ? 'text-black' : 'text-white'}`}>LOG</span>
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <Dashboard puffs={puffs} settings={settings} isAnimatePuff={isAnimatePuff} />;
      case 'health': return <HealthProgress quitDate={settings.quitDate} />;
      case 'badges': return <Achievements puffs={puffs} settings={settings} />;
      case 'coach': return <AICoach settings={settings} puffs={puffs} />;
      case 'admin': return <AdminPanel />;
      case 'settings': return <Settings settings={settings} setSettings={saveSettings} onClearData={() => { if(confirm('WIPE_ALL_REGISTRY_DATA?')) { setPuffs([]); setSettings(null); } }} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black select-none flex flex-col items-center font-mono">
      <div className="w-full max-w-md h-screen relative flex flex-col overflow-hidden shadow-2xl bg-white border-x-4 border-black">
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl italic">V</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">VapeLess</h1>
          </div>
          <div className="flex gap-4 items-center">
            {isAdmin && <button onClick={() => handleTabChange('admin')} className={`text-[9px] font-black border-2 border-black px-2 py-1 uppercase ${activeTab === 'admin' ? 'bg-black text-white' : ''}`}>Admin</button>}
            <button onClick={() => { soundService.play('click', settings.soundEnabled); setIsWidgetMode(true); }} className="text-[9px] font-black border-2 border-black px-2 py-1 uppercase hover:bg-black hover:text-white transition-all">Widget</button>
            <button onClick={() => handleTabChange(activeTab === 'settings' ? 'dash' : 'settings')} className="text-2xl hover:scale-110 transition-transform"><i className={`fas ${activeTab === 'settings' ? 'fa-times' : 'fa-bars'}`}></i></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{renderContent()}</main>

        {activeTab === 'dash' && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40">
            <button onClick={addPuff} className={`w-28 h-28 rounded-full bg-white border-4 border-black text-black shadow-[8px_8px_0px_#000] flex flex-col items-center justify-center active:shadow-none active:translate-x-2 active:translate-y-2 transition-all ${isAnimatePuff ? 'bg-black text-white' : ''}`}>
              <i className="fas fa-plus text-3xl mb-1"></i>
              <span className="text-[10px] font-black uppercase">Log_Puff</span>
            </button>
          </div>
        )}

        <nav className="sticky bottom-0 left-0 right-0 bg-white border-t-4 border-black px-4 py-3 flex items-center justify-between z-50 safe-bottom">
          <NavBtn active={activeTab === 'dash'} onClick={() => handleTabChange('dash')} icon="fa-th-large" label="STATUS" />
          <NavBtn active={activeTab === 'health'} onClick={() => handleTabChange('health')} icon="fa-heartbeat" label="HEALTH" />
          <div className="w-16"></div>
          <NavBtn active={activeTab === 'badges'} onClick={() => handleTabChange('badges')} icon="fa-award" label="AWARDS" />
          <NavBtn active={activeTab === 'coach'} onClick={() => handleTabChange('coach')} icon="fa-terminal" label="COACH" />
        </nav>
      </div>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 h-14 transition-all ${active ? 'bg-black text-white border-2 border-black' : 'text-black grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}>
    <i className={`fas ${icon} text-xl`}></i>
    <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
