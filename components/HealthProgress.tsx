
import React from 'react';
import { HEALTH_MILESTONES } from '../constants';

interface HealthProgressProps {
  quitDate: number | null;
}

export const HealthProgress: React.FC<HealthProgressProps> = ({ quitDate }) => {
  if (!quitDate) {
    return (
      <div className="retro-border bg-white p-6">
        <h3 className="text-lg font-black underline mb-4 uppercase italic">Body Recover Log</h3>
        <p className="text-xs">SYSTEM WAITING: SET QUIT DATE IN PREFS.EXE TO INITIALIZE TRACKING.</p>
      </div>
    );
  }

  const timeSinceQuit = (Date.now() - quitDate) / 1000;

  return (
    <div className="space-y-6 pb-20">
      <div className="retro-border bg-black text-white p-4 flex justify-between items-center">
        <h3 className="font-black italic uppercase">Physiological_Sync</h3>
        <span className="text-[10px] px-2 py-1 bg-white text-black font-bold">LIVE_MODE</span>
      </div>
      
      <div className="space-y-6">
        {HEALTH_MILESTONES.map((milestone) => {
          const progress = Math.min(100, (timeSinceQuit / milestone.timeRequiredSeconds) * 100);
          const isComplete = progress >= 100;

          return (
            <div key={milestone.id} className="retro-border bg-white p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-black uppercase">
                  {isComplete ? '[OK] ' : '[..] '}
                  {milestone.title}
                </div>
                <div className="text-[10px] font-bold">{Math.floor(progress)}%</div>
              </div>
              <div className="h-6 w-full border-2 border-black p-0.5 bg-white mb-2">
                <div 
                  className="h-full bg-black transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] leading-tight opacity-70 italic">{milestone.description.toUpperCase()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
