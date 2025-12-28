
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
      setMessage('RESET_LINK_SENT. CHECK_INBOX.');
    } catch (err: any) {
      setError('FAILED_TO_SEND. CHECK_EMAIL.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-1">
        <div className="text-[12px] font-black uppercase">Recovery_Terminal</div>
        <p className="text-[8px] opacity-60 uppercase">Enter email to restore access</p>
      </div>

      {message ? (
        <div className="bg-green-100 border-2 border-green-600 text-green-700 p-4 text-[10px] font-black text-center">
          {message}
          <button onClick={onBack} className="block w-full mt-4 underline uppercase">Return to Login</button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="bg-red-100 border-2 border-red-600 text-red-600 p-2 text-[10px] font-black text-center animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase">Email_Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm outline-none focus:bg-gray-50"
              placeholder="USER@DOMAIN.COM"
            />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-black text-white py-4 font-black uppercase text-sm hover:invert transition-all"
          >
            {isProcessing ? 'SENDING...' : 'INITIALIZE_RESET'}
          </button>

          <button 
            type="button"
            onClick={onBack}
            className="w-full text-center text-[10px] font-black underline uppercase"
          >
            Back to Portal
          </button>
        </form>
      )}
    </div>
  );
};
