import React, { useState } from 'react';
import { User } from '../types.ts';
import { dbService } from '../services/dbService.ts';

export const Auth: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to signup for new users
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const user = isLogin 
        ? await dbService.login(email, password)
        : await dbService.signup(email, password);
      
      if (user) onLogin(user);
      else setError('SYSTEM_REJECTED_CREDENTIALS');
    } catch (err: any) {
      setError(err.message || 'COMM_UPLINK_FAILURE');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-8 font-mono">
      <div className="glass-card w-full max-w-sm p-10 space-y-10 border-white/20">
        <div className="text-center space-y-3">
          <div className="text-5xl font-black italic tracking-tighter italic">VAPELESS_OS</div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">System_Access_Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl text-[10px] font-black text-center uppercase animate-pulse">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black opacity-30 uppercase">Network_ID (Email)</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-white/40 transition-all font-black uppercase"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="USER@DOMAIN.COM"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black opacity-30 uppercase">Access_Token (Pass)</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-white/40 transition-all font-black"
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm neo-btn uppercase tracking-widest shadow-2xl">
            {isProcessing ? 'PROCESSING...' : (isLogin ? 'INIT_SESSION' : 'REGISTER_IDENTITY')}
          </button>
        </form>

        <div className="flex flex-col gap-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase underline opacity-30 hover:opacity-100 transition-opacity">
            {isLogin ? 'Need New System Identity?' : 'Existing User Login'}
          </button>
        </div>
      </div>
    </div>
  );
};