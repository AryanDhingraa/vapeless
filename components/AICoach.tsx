
import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse } from '../services/geminiService';
import { ChatMessage, UserSettings, PuffLog } from '../types';

interface AICoachProps {
  settings: UserSettings;
  puffs: PuffLog[];
}

export const AICoach: React.FC<AICoachProps> = ({ settings, puffs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "> INITIALIZING VAPELESS_COACH.SYS...\n> SYSTEM READY.\n> HELLO. HOW IS YOUR QUITTING PROGRESS TODAY?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input.toUpperCase(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getCoachResponse(input, settings, puffs.slice(-20));
      const aiMsg: ChatMessage = { role: 'model', text: `> ${response?.toUpperCase() || "ERROR: NO RESPONSE."}`, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "> ERROR: CONNECTION LOST.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] p-4 bg-white">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 font-mono text-xs border-2 border-black p-3 bg-white retro-border">
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.role === 'user' ? 'text-indigo-600' : 'text-black'}`}>
            <span className="font-black">{msg.role === 'user' ? 'USER: ' : 'AI: '}</span>
            <span className="whitespace-pre-wrap">{msg.text}</span>
          </div>
        ))}
        {isLoading && <div className="animate-pulse">_PROCESSING...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ENTER MESSAGE..."
          className="flex-1 border-4 border-black px-4 py-3 text-sm focus:outline-none uppercase font-black"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-black text-white px-6 font-black active:scale-95 transition-all"
        >
          SEND
        </button>
      </div>
    </div>
  );
};
