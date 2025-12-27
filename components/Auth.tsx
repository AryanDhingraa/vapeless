
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('FIELD_REQUIRED.ERR');
      return;
    }

    // SIMULATED BACKEND LOGIC
    const users = JSON.parse(localStorage.getItem('vapeless_users') || '[]');
    
    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ id: user.id, email: user.email });
      } else {
        setError('AUTH_FAILED. SYSTEM_REJECT.');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('USER_EXISTS. DUPLICATE_ENTRY.');
        return;
      }
      const newUser = { id: Math.random().toString(36).substr(2, 9), email, password };
      users.push(newUser);
      localStorage.setItem('vapeless_users', JSON.stringify(users));
      onLogin({ id: newUser.id, email: newUser.email });
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-black text-white px-4 py-2 text-2xl font-black italic shadow-[4px_4px_0px_#ccc]">
            VAPELESS_OS
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
            Secure User Environment v1.2
          </p>
        </div>

        <div className="retro-border bg-white overflow-hidden">
          <div className="retro-window-header flex justify-between">
            <span>{isLogin ? 'LOGIN_SYSTEM' : 'CREATE_ACCOUNT'}</span>
            <i className="fas fa-lock"></i>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-red-600 text-red-600 p-2 text-[10px] font-black text-center animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase">Email_Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm outline-none focus:bg-gray-50"
                placeholder="USER@DOMAIN.COM"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm outline-none focus:bg-gray-50"
                placeholder="********"
              />
            </div>

            <button type="submit" className="w-full bg-black text-white py-4 font-black uppercase text-sm hover:invert transition-all active:scale-95">
              {isLogin ? 'AUTH_EXECUTE' : 'REGISTER_USER'}
            </button>
          </form>
        </div>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-[10px] font-black underline uppercase"
        >
          {isLogin ? 'Create new secure account' : 'Return to login portal'}
        </button>
      </div>
    </div>
  );
};
