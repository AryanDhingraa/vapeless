
import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { SocialAuth } from './SocialAuth.tsx';
import { ForgotPassword } from './ForgotPassword.tsx';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const validatePassword = () => {
    if (password.length < 8) return "LENGTH_ERR: MIN_8_CHARS";
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "COMPLEXITY_ERR: MIX_ALPHA_NUMERIC";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!email || !password) {
      setError('FIELD_ERR: ALL_FIELDS_REQUIRED');
      setIsProcessing(false);
      return;
    }

    try {
      if (isLogin) {
        const user = await dbService.login(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError('AUTH_FAILED: SYSTEM_REJECT');
        }
      } else {
        const passErr = validatePassword();
        if (passErr) {
          setError(passErr);
          setIsProcessing(false);
          return;
        }

        // Email Availability Check
        const exists = await dbService.checkEmailExists(email);
        if (exists) {
          setError('DUPLICATE_ERR: EMAIL_TAKEN');
          setIsProcessing(false);
          return;
        }

        const newUser = await dbService.signup(email, password);
        if (newUser) {
          onLogin(newUser);
        }
      }
    } catch (err: any) {
      setError(err.message === "USER_EXISTS" ? 'USER_EXISTS: DUPLICATE_ENTRY' : 'COMM_ERR: UPLINK_FAILED');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showForgot) return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm retro-border shadow-[8px_8px_0px_#000]">
        <div className="retro-window-header uppercase flex justify-between bg-black text-white px-3 py-1 text-[10px]">
          <span>Security_Vault</span>
          <i className="fas fa-key"></i>
        </div>
        <ForgotPassword onBack={() => setShowForgot(false)} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 font-mono overflow-y-auto">
      <div className="w-full max-w-sm space-y-8 py-10">
        <div className="text-center space-y-3">
          <div className="inline-block bg-black text-white px-6 py-4 text-4xl font-black italic shadow-[8px_8px_0px_#ccc] border-4 border-black tracking-tighter">
            VAPELESS_OS
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">
            Entry_Protocol_v2.5
          </p>
        </div>

        <div className="retro-border bg-white overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          <div className="retro-window-header flex justify-between items-center px-4 py-2 bg-black text-white text-[11px] font-black">
            <span className="tracking-widest">{isLogin ? 'SYSTEM_AUTHENTICATION' : 'USER_REGISTRATION'}</span>
            <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-lock'}`}></i>
          </div>
          
          <div className="p-6 space-y-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-4 border-black text-red-600 p-3 text-[10px] font-black text-center animate-shake uppercase leading-tight">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tight flex justify-between">
                  <span>Network_ID (Email)</span>
                  {isProcessing && <span className="opacity-40 animate-pulse">CONNECTING...</span>}
                </label>
                <input 
                  type="email" 
                  value={email}
                  autoComplete="email"
                  disabled={isProcessing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-black p-3 text-sm outline-none focus:bg-gray-100 font-black"
                  placeholder="USER@DOMAIN.COM"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tight">Access_Token (Pass)</label>
                <input 
                  type="password" 
                  value={password}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={isProcessing}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-black p-3 text-sm outline-none focus:bg-gray-100 font-black"
                  placeholder="********"
                />
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                      <span>Entropy_Strength</span>
                      <span className={passwordStrength < 50 ? 'text-red-600' : 'text-green-600'}>{passwordStrength}%</span>
                    </div>
                    <div className="h-3 w-full border-2 border-black p-[2px] bg-white">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          passwordStrength < 50 ? 'bg-red-500' : 
                          passwordStrength < 100 ? 'bg-yellow-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[9px] font-black uppercase underline hover:text-red-600 transition-colors opacity-70"
                  >
                    Lost_Credentials?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full bg-black text-white py-5 font-black uppercase text-sm shadow-[6px_6px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${isProcessing ? 'opacity-50' : 'hover:invert'}`}
              >
                {isProcessing ? 'INITIALIZING...' : (isLogin ? 'ENTER_ENVIRONMENT' : 'CREATE_IDENTITY')}
              </button>
            </form>

            <SocialAuth />
          </div>
        </div>

        <button 
          onClick={() => !isProcessing && setIsLogin(!isLogin)}
          className="w-full text-center text-[10px] font-black underline uppercase tracking-widest hover:bg-black hover:text-white py-3 transition-all"
        >
          {isLogin ? '>> Switch to Registration Protocol' : '>> Return to Entry Portal'}
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};
