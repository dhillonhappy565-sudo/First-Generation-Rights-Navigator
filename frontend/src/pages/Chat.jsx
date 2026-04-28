import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User as UserIcon, Bot, Volume2, Sparkles, BookOpen } from 'lucide-react';
import api from '../api/client';
import { speakText } from '../utils/tts';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Namaste! I'm your AI Rights Navigator. You can talk to me in simple terms. E.g., 'I am a 25 year old farmer from Punjab earning 1.5L, what schemes are for me?'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const profileString = localStorage.getItem('userProfile');
      const profile = profileString ? JSON.parse(profileString) : {};

      const res = await api.post('/chat', { message: userMessage.text, profile });
      
      const { explanation, recommendedSchemes, extractedData } = res.data;

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: explanation,
        schemes: recommendedSchemes,
        extracted: extractedData
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(explanation);

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I had trouble connecting to my brain. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 shrink-0 flex items-center shadow-md z-10 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
           <Sparkles size={20} className="text-amber-300" />
        </div>
        <div>
           <h2 className="font-bold text-lg leading-tight">AI Assistant</h2>
           <p className="text-xs text-primary-100 opacity-90 text-left">Powered by GPT-4</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mr-2 shrink-0 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-4 rounded-2xl ${
                msg.sender === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-sm shadow-md' 
                : 'bg-white border border-slate-200 shadow-sm rounded-tl-sm text-slate-800'
              }`}>
                <p className="text-[15px] leading-relaxed relative">
                  {msg.text}
                </p>

                {/* Show TTS Icon for bot text */}
                {msg.sender === 'bot' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="absolute -right-10 top-0 p-2 text-slate-400 hover:text-primary-600 rounded-full transition-colors hidden md:block"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {/* Render Schemes inside Chat if available */}
              {msg.schemes && msg.schemes.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Matched Schemes</p>
                  {msg.schemes.map(sch => (
                    <div 
                      key={sch._id} 
                      onClick={() => navigate(`/scheme/${sch._id}`)}
                      className="bg-white border text-left border-slate-200 p-3 rounded-xl shadow-sm hover:border-primary-300 hover:shadow-md cursor-pointer transition-all flex items-start gap-3 w-full"
                    >
                      <div className="bg-primary-50 p-2 rounded-lg text-primary-600 mt-0.5 shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-slate-800">{sch.scheme_name}</h4>
                         <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sch.benefits}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mr-2">
                <Bot size={16} />
             </div>
             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here in any language..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 pl-4 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
      </div>
      
    </div>
  );
};

export default Chat;
