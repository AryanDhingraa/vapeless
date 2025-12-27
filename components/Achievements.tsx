
import React from 'react';
import { ACHIEVEMENTS } from '../constants';
import { PuffLog, UserSettings } from '../types';

interface AchievementsProps {
  puffs: PuffLog[];
  settings: UserSettings;
}

export const Achievements: React.FC<AchievementsProps> = ({ puffs, settings }) => {
  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="retro-border bg-black text-white p-4 flex justify-between items-center">
        <h3 className="font-black italic uppercase">System_Awards.db</h3>
        <span className="text-[10px] px-2 py-1 bg-white text-black font-bold">UNLOCKED</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = achievement.condition(puffs, settings);
          return (
            <div 
              key={achievement.id} 
              className={`retro-border p-4 flex flex-col items-center text-center transition-all ${
                isUnlocked ? 'bg-white opacity-100' : 'bg-slate-100 opacity-40 grayscale'
              }`}
            >
              <div className={`w-12 h-12 border-2 border-black mb-3 flex items-center justify-center ${isUnlocked ? 'bg-black text-white animate-pulse' : 'bg-white text-black'}`}>
                <i className={`fas ${achievement.icon} text-xl`}></i>
              </div>
              <h4 className="text-[10px] font-black uppercase mb-1">{achievement.title}</h4>
              <p className="text-[8px] leading-tight font-bold italic">{achievement.description.toUpperCase()}</p>
              {!isUnlocked && (
                <div className="mt-2 text-[8px] border border-black px-1 font-black">LOCKED</div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="retro-border p-4 bg-white">
         <p className="text-[9px] font-black italic uppercase leading-none">
            TIP: MILESTONES ARE CALCULATED BASED ON YOUR QUIT DATE AND DAILY BUDGET. STAY DISCIPLINED.
         </p>
      </div>
    </div>
  );
};
