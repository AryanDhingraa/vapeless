
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
    // Basic password strength logic
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
    if (password.length < 8) return "MINIMUM_8_CHARS_REQUIRED";
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "MIX_OF_ALPHA_NUMERIC_REQUIRED";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!email || !password) {
      setError('FIELD_REQUIRED.ERR');
      setIsProcessing(false);
      return;
    }

    try {
      if (isLogin) {
        const user = await dbService.login(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError('AUTH_FAILED. SYSTEM_REJECT.');
        }
      } else {
        const passErr = validatePassword();
        if (passErr) {
          setError(passErr);
          setIsProcessing(false);
          return;
        }

        // Email Check
        const exists = await dbService.checkEmailExists(email);
        if (exists) {
          setError('EMAIL_IN_USE. TRY_ANOTHER.');
          setIsProcessing(false);
          return;
        }

        const newUser = await dbService.signup(email, password);
        if (newUser) {
          onLogin(newUser);
        }
      }
    } catch (err: any) {
      setError(err.message === "USER_EXISTS" ? 'USER_EXISTS. DUPLICATE_ENTRY.' : 'NETWORK_ERROR. TRY_AGAIN.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showForgot) return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm retro-border">
        <div className="retro-window-header uppercase">Password_Restore</div>
        <ForgotPassword onBack={() => setShowForgot(false)} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-black text-white px-5 py-3 text-3xl font-black italic shadow-[6px_6px_0px_#ccc] border-4 border-black">
            VAPELESS_OS
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">
            Secure User Environment v2.0
          </p>
        </div>

        <div className="retro-border bg-white overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="retro-window-header flex justify-between items-center px-3 py-1 bg-black text-white text-[10px]">
            <span>{isLogin ? 'AUTH_PORTAL_V1' : 'REGISTRATION_SEQUENCE'}</span>
            <i className={`fas ${isProcessing ? 'fa-sync fa-spin' : 'fa-shield-alt'}`}></i>
          </div>
          
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-600 text-red-600 p-2 text-[10px] font-black text-center animate-pulse uppercase">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase flex justify-between">
                  <span>Email_Address</span>
                  {isProcessing && <span className="opacity-40 animate-pulse">CHECKING...</span>}
                </label>
                <input 
                  type="email" 
                  value={email}
                  autoComplete="email"
                  disabled={isProcessing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-black p-3 text-sm outline-none focus:bg-gray-100 font-bold"
                  placeholder="USER@DOMAIN.COM"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase">Password</label>
                <input 
                  type="password" 
                  value={password}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={isProcessing}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-black p-3 text-sm outline-none focus:bg-gray-100 font-bold"
                  placeholder="********"
                />
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[8px] font-black uppercase">
                      <span>Entropy_Level</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="h-2 w-full border-2 border-black p-0.5 bg-gray-100">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 50 ? 'bg-red-500' : 
                          passwordStrength < 100 ? 'bg-yellow-500' : 'bg-green-500'
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
                    className="text-[8px] font-black uppercase underline hover:opacity-100 opacity-60"
                  >
                    Forgot_Password?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full bg-black text-white py-4 font-black uppercase text-sm hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'EXECUTING...' : (isLogin ? 'SYSTEM_ENTER' : 'CREATE_ENTITY')}
              </button>
            </form>

            <SocialAuth />
          </div>
        </div>

        <button 
          onClick={() => !isProcessing && setIsLogin(!isLogin)}
          className="w-full text-center text-[10px] font-black underline uppercase tracking-tighter hover:bg-black hover:text-white py-2"
        >
          {isLogin ? '>> Initialize New Account Registry' : '>> Return to Entry Portal'}
        </button>
      </div>
    </div>
  );
};
