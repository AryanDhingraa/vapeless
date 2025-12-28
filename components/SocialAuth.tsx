
import React from 'react';
import { dbService } from '../services/dbService.ts';
import { Provider } from '@supabase/supabase-js';

export const SocialAuth: React.FC = () => {
  const handleSocialLogin = async (provider: Provider) => {
    try {
      await dbService.signInWithOAuth(provider);
    } catch (err) {
      console.error("OAuth Error:", err);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t-2 border-black/10">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-[2px] bg-black"></div>
        <span className="text-[10px] font-black uppercase tracking-tighter">External_Connect</span>
        <div className="flex-1 h-[2px] bg-black"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => handleSocialLogin('google')}
          className="retro-border bg-white py-3 flex items-center justify-center active:bg-black active:text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          title="Google Login"
        >
          <i className="fab fa-google text-lg"></i>
        </button>
        <button 
          onClick={() => handleSocialLogin('apple')}
          className="retro-border bg-white py-3 flex items-center justify-center active:bg-black active:text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          title="Apple Login"
        >
          <i className="fab fa-apple text-lg"></i>
        </button>
        <button 
          onClick={() => handleSocialLogin('azure')}
          className="retro-border bg-white py-3 flex items-center justify-center active:bg-black active:text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          title="Microsoft Login"
        >
          <i className="fab fa-microsoft text-lg"></i>
        </button>
      </div>
    </div>
  );
};
