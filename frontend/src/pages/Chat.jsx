import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, User as UserIcon, Bot, Volume2, Sparkles, BookOpen } from 'lucide-react';
import api from '../api/client';
import { speakText } from '../utils/tts';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "🙏 Namaste! I'm your AI Rights Navigator. You can talk to me in any language — Hindi, English, Punjabi, Tamil, or any other!\n\nExamples:\n• 'I am a 25 year old farmer from Punjab'\n• 'मैं 70 साल का किसान हूँ हिमाचल प्रदेश से'\n• 'ਮੈਂ ਪੰਜਾਬ ਤੋਂ ਕਿਸਾਨ ਹਾਂ'\n\nJust tell me about yourself and I'll find the best government schemes for you!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [voiceLang, setVoiceLang] = useState('hi-IN');

  const voiceLanguages = [
    { code: 'hi-IN', label: 'हिंदी' },
    { code: 'en-IN', label: 'English' },
    { code: 'pa-IN', label: 'ਪੰਜਾਬੀ' },
    { code: 'ta-IN', label: 'தமிழ்' },
    { code: 'te-IN', label: 'తెలుగు' },
    { code: 'bn-IN', label: 'বাংলা' },
    { code: 'mr-IN', label: 'मराठी' },
    { code: 'gu-IN', label: 'ગુજરાતી' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ' },
    { code: 'ml-IN', label: 'മലയാളം' },
  ];

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input not supported. Please open in Google Chrome.');
      setTimeout(() => setVoiceError(''), 5000);
      return;
    }

    setVoiceError('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang;
    recognition.maxAlternatives = 1;

    let silenceTimer = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        setVoiceError('No speech detected. Make sure your mic is working and try again.');
        setTimeout(() => setVoiceError(''), 5000);
      }
    }, 10000);
    
    recognition.onresult = (event) => {
      clearTimeout(silenceTimer);
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript || interimTranscript);
      
      silenceTimer = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
      }, 5000);
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      clearTimeout(silenceTimer);
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      const errorMessages = {
        'not-allowed': '🚫 Microphone blocked! Click the lock icon in address bar → Allow microphone.',
        'network': '🌐 Network error. Try using mobile hotspot or Google Chrome.',
        'no-speech': '🔇 No speech detected. Speak clearly and try again.',
        'audio-capture': '🎤 No microphone found. Connect a mic and try again.',
        'aborted': '',
      };
      
      const msg = errorMessages[event.error] || `Error: ${event.error}. Try Google Chrome.`;
      if (msg) {
        setVoiceError(msg);
        setTimeout(() => setVoiceError(''), 7000);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      setVoiceError('Failed to start mic. Refresh the page or use Google Chrome.');
      setTimeout(() => setVoiceError(''), 5000);
    }
  };

  const toggleListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      startRecognition();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Stop listening if mic is active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMessage.text });
      
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
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I had trouble connecting. Please try again." }]);
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
           <p className="text-xs text-primary-100 opacity-90 text-left">Multilingual AI • Hindi, English, Punjabi & more</p>
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
                <p className="text-[15px] leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                {msg.sender === 'bot' && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="mt-2 p-1.5 text-slate-400 hover:text-primary-600 rounded-full transition-colors inline-flex"
                  >
                    <Volume2 size={14} />
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
        {isListening && (
          <div className="text-center text-xs text-red-500 font-medium mb-2 animate-pulse">
            🎙️ Listening in {voiceLanguages.find(l => l.code === voiceLang)?.label}... Speak now
          </div>
        )}
        {voiceError && (
          <div className="text-center text-xs text-orange-600 font-medium mb-2 bg-orange-50 p-2 rounded-lg border border-orange-200">
            {voiceError}
          </div>
        )}
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            className="w-20 h-10 text-xs bg-slate-50 border border-slate-200 rounded-full text-center text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer shrink-0"
          >
            {voiceLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="अपना सवाल यहाँ लिखें / Type your question here..."
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
