
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 bg-black/10"></div>
        <span className="text-[8px] font-black uppercase opacity-40">Or_Connect_Via</span>
        <div className="flex-1 h-0.5 bg-black/10"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => handleSocialLogin('google')}
          className="retro-border bg-white py-2 flex items-center justify-center active:bg-black active:text-white transition-colors"
          title="Google Login"
        >
          <i className="fab fa-google text-sm"></i>
        </button>
        <button 
          onClick={() => handleSocialLogin('apple')}
          className="retro-border bg-white py-2 flex items-center justify-center active:bg-black active:text-white transition-colors"
          title="Apple Login"
        >
          <i className="fab fa-apple text-sm"></i>
        </button>
        <button 
          onClick={() => handleSocialLogin('azure')}
          className="retro-border bg-white py-2 flex items-center justify-center active:bg-black active:text-white transition-colors"
          title="Microsoft Login"
        >
          <i className="fab fa-microsoft text-sm"></i>
        </button>
      </div>
    </div>
  );
};
