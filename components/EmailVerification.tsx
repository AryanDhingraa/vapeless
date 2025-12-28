
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/dbService.ts';
import { soundService } from '../services/soundService.ts';

interface EmailVerificationProps {
  email: string;
  onVerified: (user: any) => void;
  onCancel: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    // Auto-focus logic: Move to next input if value is entered
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify if all 6 digits are filled
    if (newOtp.every(digit => digit !== '') && cleanValue) {
       handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Backspace logic: move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (tokenOverride?: string) => {
    const token = tokenOverride || otp.join('');
    if (token.length < 6) {
      setError('UPLINK_ERR: INCOMPLETE_SEQUENCE');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        soundService.play('success', true);
        setIsSuccess(true);
        // Delay redirect to show success animation
        setTimeout(() => {
          onVerified(data.user);
        }, 1500);
      }
    } catch (err: any) {
      setError('PROTOCOL_ERR: INVALID_TOKEN');
      soundService.play('error', true);
      // Reset OTP on error to let them try again easily
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      setResendTimer(60);
      setError('UPLINK_RESENT_SUCCESS');
      soundService.play('click', true);
    } catch (err) {
      setError('UPLINK_ERR: RETRY_LATER');
    }
  };

  if (isSuccess) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-pulse bg-white">
        <div className="text-4xl font-black italic bg-black text-white px-4 py-2 shadow-[8px_8px_0px_#ccc]">
          VERIFIED
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-center">
          Identity_Confirmed<br/>Initializing_Environment...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white font-mono relative overflow-hidden">
      <div className="text-center space-y-2">
        <div className="text-sm font-black uppercase tracking-tighter">Identity_Check_Req</div>
        <p className="text-[9px] opacity-60 uppercase italic leading-tight">
          A security uplink code was sent to:<br/>
          <span className="text-black font-black not-italic block mt-1 border-b border-black inline-block">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between gap-1">
          {otp.map((digit, i) => (
            <div key={i} className="relative">
              <input
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isVerifying}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className={`w-11 h-14 border-4 border-black text-center text-2xl font-black focus:bg-gray-100 outline-none transition-all shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none ${isVerifying ? 'opacity-50' : ''}`}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-4 border-black p-3 text-[9px] font-black text-center text-red-600 animate-bounce uppercase">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="w-full bg-black text-white py-5 font-black uppercase text-sm shadow-[6px_6px_0px_#ccc] active:translate-x-1 active:translate-y-1 active:shadow-none hover:invert transition-all border-2 border-black"
          >
            {isVerifying ? 'PROCESS_UPLINK...' : 'SUBMIT_CREDENTIALS'}
          </button>

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`text-[9px] font-black uppercase tracking-widest ${resendTimer > 0 ? 'opacity-30 cursor-not-allowed' : 'underline hover:bg-black hover:text-white px-2 py-1 transition-all'}`}
            >
              {resendTimer > 0 ? `Resend_Signal in ${resendTimer}s` : 'Request_New_Code'}
            </button>
            
            <button
              onClick={onCancel}
              className="text-[8px] font-black uppercase underline opacity-30 hover:opacity-100 italic"
            >
              [Abort_Identity_Verification]
            </button>
          </div>
        </div>
      </div>

      {/* Retro Decoration */}
      <div className="absolute top-0 right-0 p-1 opacity-10">
        <div className="text-[6px] font-black">SECURE_LINK_ENCRYPTED_AES_256</div>
      </div>
    </div>
  );
};
