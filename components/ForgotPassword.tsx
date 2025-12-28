
import React, { useState } from 'react';
import { dbService } from '../services/dbService.ts';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setMessage('');

    try {
      await dbService.resetPassword(email);
      setMessage('RECOVERY_SEQUENCE_INITIATED. CHECK_INBOX.');
    } catch (err: any) {
      setError('FAILED_TO_SEND. VERIFY_EMAIL.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white font-mono">
      <div className="text-center space-y-1">
        <div className="text-sm font-black uppercase tracking-widest">Recovery_Mode</div>
        <p className="text-[10px] opacity-60 uppercase italic">Input registry email to restore uplink</p>
      </div>

      {message ? (
        <div className="bg-green-50 border-4 border-black p-4 text-[10px] font-black text-center space-y-4">
          <p className="text-green-700">{message}</p>
          <button 
            onClick={onBack} 
            className="w-full bg-black text-white py-2 uppercase text-[10px] hover:invert transition-all"
          >
            Return to Portal
          </button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-4 border-black text-red-600 p-2 text-[10px] font-black text-center animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase">Registry_Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-4 border-black p-3 text-sm outline-none focus:bg-gray-50 font-black"
              placeholder="USER@OS.COM"
            />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-black text-white py-4 font-black uppercase text-sm hover:invert transition-all shadow-[4px_4px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {isProcessing ? 'SENDING...' : 'SEND_RESET_LINK'}
          </button>

          <button 
            type="button"
            onClick={onBack}
            className="w-full text-center text-[10px] font-black underline uppercase opacity-60 hover:opacity-100"
          >
            Abort_Sequence
          </button>
        </form>
      )}
    </div>
  );
};
