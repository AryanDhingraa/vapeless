
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { AICoach } from './components/AICoach';
import { Settings } from './components/Settings';
import { HealthProgress } from './components/HealthProgress';
import { Onboarding } from './components/Onboarding';
import { Achievements } from './components/Achievements';
import { Auth } from './components/Auth';
import { PuffLog, UserSettings, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'health' | 'coach' | 'settings' | 'badges'>('dash');
  const [puffs, setPuffs] = useState<PuffLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isAnimatePuff, setIsAnimatePuff] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  // Load user from session if exists
  useEffect(() => {
    const savedUser = sessionStorage.getItem('vapeless_session');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
    }
  }, []);

  // Load User Specific Data
  useEffect(() => {
    if (currentUser) {
      const userKey = `data_${currentUser.email}`;
      const savedData = localStorage.getItem(userKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPuffs(parsed.puffs || []);
        setSettings(parsed.settings || null);
      } else {
        setPuffs([]);
        setSettings(null);
      }
    }
  }, [currentUser]);

  // Sync data to mock backend (localStorage) whenever it changes
  useEffect(() => {
    if (currentUser) {
      const userKey = `data_${currentUser.email}`;
      const dataToSave = { puffs, settings };
      localStorage.setItem(userKey, JSON.stringify(dataToSave));
    }
  }, [puffs, settings, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('vapeless_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('vapeless_session');
    setPuffs([]);
    setSettings(null);
  };

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
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
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }
  }, []);

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!settings) {
    return <Onboarding onComplete={saveSettings} />;
  }

  if (isWidgetMode) {
    const today = new Date().setHours(0,0,0,0);
    const todayCount = puffs.filter(p => p.timestamp >= today).length;
    
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 z-[1000] animate-in fade-in duration-300">
        <button 
          onClick={() => setIsWidgetMode(false)}
          className="absolute top-12 right-6 text-white/50 font-black text-xs border border-white/20 px-3 py-1 rounded-full uppercase"
        >
          Exit_Widget
        </button>
        
        <div className="text-center space-y-2 mb-12">
          <div className="text-[10px] font-black tracking-widest opacity-50 uppercase">Today_Puffs</div>
          <div className="text-9xl font-black tracking-tighter leading-none">{todayCount}</div>
          <div className="text-[10px] font-black bg-white text-black px-2 py-0.5 uppercase tracking-widest">
            {currentUser.email.split('@')[0]}
          </div>
        </div>

        <button 
          onClick={addPuff}
          className={`
            w-64 h-64 rounded-full border-8 border-white bg-transparent
            flex items-center justify-center transition-all duration-75
            active:bg-white active:scale-95
            ${isAnimatePuff ? 'bg-white shadow-[0_0_50px_rgba(255,255,255,0.5)]' : ''}
          `}
        >
          <span className={`text-5xl font-black uppercase ${isAnimatePuff ? 'text-black' : 'text-white'}`}>
            {isAnimatePuff ? 'OK' : 'PUFF'}
          </span>
        </button>

        <div className="mt-12 text-[9px] font-black opacity-30 text-center italic uppercase leading-tight">
          Double-tap lock screen shortcut<br/>to open this view instantly.
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <Dashboard puffs={puffs} settings={settings} />;
      case 'health': return <div className="p-4 space-y-4"><HealthProgress quitDate={settings.quitDate} /></div>;
      case 'badges': return <Achievements puffs={puffs} settings={settings} />;
      case 'coach': return <AICoach settings={settings} puffs={puffs} />;
      case 'settings': return <Settings settings={settings} setSettings={saveSettings} onClearData={() => {
        if(confirm('WIPE ALL ACCOUNT DATA?')) { setPuffs([]); setSettings(null); }
      }} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black select-none safe-bottom flex flex-col items-center">
      <div className="w-full max-w-md h-screen relative flex flex-col overflow-hidden shadow-2xl">
        <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between shadow-[0px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black">V</div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">VapeLess</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsWidgetMode(true)} 
              className="text-[9px] font-black border-2 border-black px-2 py-1 active:bg-black active:text-white uppercase"
            >
              Widget
            </button>
            <button onClick={() => setActiveTab('settings')} className="text-xl active:scale-90 transition-transform">
              <i className={`fas ${activeTab === 'settings' ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          {renderContent()}
        </main>

        {activeTab === 'dash' && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <button 
              onClick={addPuff}
              className={`
                w-24 h-24 rounded-full bg-white border-4 border-black 
                text-black shadow-[6px_6px_0px_rgba(0,0,0,1)]
                flex flex-col items-center justify-center transition-all duration-75
                active:shadow-none active:translate-x-1 active:translate-y-1
                ${isAnimatePuff ? 'bg-black text-white' : ''}
              `}
            >
              <i className="fas fa-plus text-2xl mb-1"></i>
              <span className="text-[9px] font-black uppercase">LOG</span>
            </button>
          </div>
        )}

        <nav className="sticky bottom-0 left-0 right-0 bg-white border-t-4 border-black px-2 py-2 flex items-center justify-between z-50 safe-bottom shadow-[0px_-4px_0px_rgba(0,0,0,1)]">
          <NavBtn active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon="fa-th-large" label="STATUS" />
          <NavBtn active={activeTab === 'health'} onClick={() => setActiveTab('health')} icon="fa-heartbeat" label="HEALTH" />
          <div className="w-16"></div>
          <NavBtn active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} icon="fa-award" label="AWARDS" />
          <NavBtn active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon="fa-terminal" label="COACH" />
        </nav>
      </div>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 h-14 rounded transition-all ${active ? 'bg-black text-white' : 'text-black active:bg-gray-100'}`}
  >
    <i className={`fas ${icon} text-lg`}></i>
    <span className="text-[7px] font-black mt-1 tracking-wider uppercase">{label}</span>
  </button>
);

export default App;
