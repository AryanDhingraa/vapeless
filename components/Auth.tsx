import React, { useState } from 'react';
import { User } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { Provider } from '@supabase/supabase-js';

export const Auth: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (authMethod === 'phone') {
        // Simple mock for phone auth logic if not fully setup in supabase
        setError('PHONE_AUTH_PROTOCOL: SYSTEM_SETUP_IN_PROGRESS');
      } else {
        const user = isLogin 
          ? await dbService.login(email, password)
          : await dbService.signup(email, password);
        
        if (user) onLogin(user);
        else setError('SYSTEM_REJECTED_CREDENTIALS');
      }
    } catch (err: any) {
      setError(err.message || 'COMM_UPLINK_FAILURE');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocial = async (provider: Provider) => {
    try {
      await dbService.signInWithOAuth(provider);
    } catch (e: any) {
      setError(`OAUTH_ERR: ${e.message}`);
    }
  };

  return (
    <div className="h-screen bg-[#fdfcf7] flex flex-col items-center justify-center p-8 font-mono">
      <div className="glass-card w-full max-w-sm p-10 space-y-8 border-black/10 shadow-xl">
        <div className="text-center space-y-2">
          <div className="text-5xl font-black italic tracking-tighter text-black">VELOBANK</div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic text-black">Secure_Quitting_OS</p>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSocial('google')} className="flex items-center justify-center h-12 rounded-xl bg-white border-2 border-black/5 hover:border-black transition-all">
            <i className="fab fa-google text-lg"></i>
          </button>
          <button onClick={() => handleSocial('apple')} className="flex items-center justify-center h-12 rounded-xl bg-white border-2 border-black/5 hover:border-black transition-all">
            <i className="fab fa-apple text-lg"></i>
          </button>
          <button onClick={() => handleSocial('azure')} className="flex items-center justify-center h-12 rounded-xl bg-white border-2 border-black/5 hover:border-black transition-all">
            <i className="fab fa-microsoft text-lg"></i>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-black/10"></div>
          <span className="text-[10px] font-black opacity-30">OR</span>
          <div className="flex-1 h-px bg-black/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded-xl text-[10px] font-black text-center uppercase animate-pulse">{error}</div>}
          
          <div className="flex bg-black/5 p-1 rounded-xl">
            <button 
              type="button" 
              onClick={() => setAuthMethod('email')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${authMethod === 'email' ? 'bg-white shadow-sm' : 'opacity-40'}`}
            >Email</button>
            <button 
              type="button" 
              onClick={() => setAuthMethod('phone')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${authMethod === 'phone' ? 'bg-white shadow-sm' : 'opacity-40'}`}
            >Phone</button>
          </div>

          <div className="space-y-4">
            {authMethod === 'email' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">Email Address</label>
                <input 
                  className="w-full bg-white border-2 border-black/5 rounded-2xl p-4 text-sm outline-none focus:border-black transition-all font-black"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-white border-2 border-black/5 rounded-2xl p-4 text-xs font-black outline-none"
                  >
                    <option value="+1">+1 US</option>
                    <option value="+44">+44 UK</option>
                    <option value="+91">+91 IN</option>
                  </select>
                  <input 
                    className="flex-1 bg-white border-2 border-black/5 rounded-2xl p-4 text-sm outline-none focus:border-black transition-all font-black"
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="555-0199"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black opacity-30 uppercase">Access Token</label>
              <input 
                className="w-full bg-white border-2 border-black/5 rounded-2xl p-4 text-sm outline-none focus:border-black transition-all font-black"
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          </div>

          <button className="w-full py-5 bg-black text-white rounded-2xl font-black text-sm neo-btn uppercase tracking-widest shadow-xl">
            {isProcessing ? 'UPLINKING...' : (isLogin ? 'LOG_IN' : 'CREATE_ACCOUNT')}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase underline opacity-30 hover:opacity-100 transition-opacity">
            {isLogin ? 'Register New User' : 'Existing Registry Login'}
          </button>
        </div>
      </div>
    </div>
  );
};