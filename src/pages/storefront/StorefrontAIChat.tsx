import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function StorefrontAIChat({ catalog }: { catalog: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello! Welcome to Dealbuzz. How can I help you today? Tell me about any problems you need to solve, and I will recommend the best products or services for you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const catalogContext = catalog.map(c => 
        `- ${c.name} (${c.itemType}): ${c.shortDescription || c.description || ''} | Price: ${c.sellPrice} | Output Stock: ${c.stockCount}`
      ).join('\n');

      const systemInstruction = `You are a helpful and expert AI assistant for Dealbuzz, a premium storefront.
      Your goal is to understand the customer's problem or needs and recommend appropriate products or services from our catalog.
      Be concise, friendly, and persuasive. If we don't have something that completely solves their problem, suggest the closest alternative.
      
      Here is our current catalog:
      ${catalogContext}`;

      const chatMessages = messages.map(m => m.content); // Simplified, just pass history mostly. Wait, GoogleGenAI requires an array of contents.
      
      // We will just use generateContent with the whole transcript as context, or use standard chat.
      const chatContents = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));
      chatContents.push({ role: 'user', parts: [{ text: userMessage }]});

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: chatContents,
        config: {
          systemInstruction,
        }
      });

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: response.text || 'Sorry, I couldn\'t find a good answer.' }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: 'Apologies, I encountered an issue while trying to help you. Please try again later.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI Assistant
        </span>
      </button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%', y: 0, scale: 1 }}
              animate={{ x: 0, y: 0, scale: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:w-[400px] h-[100dvh] md:h-[600px] md:bottom-24 md:right-6 md:absolute md:rounded-3xl bg-white shadow-2xl flex flex-col relative z-10 overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-5 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight leading-tight">Dealbuzz AI</h3>
                    <p className="text-[10px] font-medium text-indigo-100 uppercase tracking-widest">Smart Shopping Assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 relative">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'}`}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-sm' 
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-100/50 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50 rounded-tl-sm text-indigo-400 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell me what you're looking for..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-14 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="text-center mt-3">
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest flex items-center space-x-1 justify-center">
                    <span>Powered by AI</span>
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400 ml-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
