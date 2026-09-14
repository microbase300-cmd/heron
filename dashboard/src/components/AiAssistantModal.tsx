import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Headphones, Minimize2, Mic, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  supportRequired?: boolean;
  suggestions?: string[];
  time: string;
}

export const AiAssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Heron Institutional AI Assistant. How may I assist your portfolio operations today? You can ask about our investment plans, deposit & withdrawal guidelines, security custody, or affiliate network.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Synthesis (Text to Speech - 0MB Server RAM)
  const speakText = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!voiceEnabled) return;

    const cleanSpoken = content
      .replace(/[•\*\_#\[\]]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpoken);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Voice Input (Speech to Text - 0MB Server RAM)
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          setIsListening(false);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.askAssistant(userText);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        supportRequired: res.supportRequired,
        suggestions: res.suggestions || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (voiceEnabled) {
        speakText(aiMsg.text);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: "I am temporarily unable to reach the knowledge base. For urgent assistance, please contact our support desk directly at support@stealthssolutions.com.",
        supportRequired: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'What investment plans are available?',
    'How do I deposit funds?',
    'How does withdrawal work?',
    'How are assets secured?'
  ];

  return (
    <>
      {/* Floating Launcher Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] shadow-xl shadow-[#F0B90B]/25 flex items-center gap-2 font-mono font-bold text-xs transition-all transform hover:scale-105 active:scale-95 group"
          title="Heron AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#0ECB81] absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-sans">Ask AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-[#1E2329] border border-[#2B313A] shadow-2xl shadow-black flex flex-col h-[520px] max-h-[80vh] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-[#181A20] border-b border-[#2B313A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#EAECEF] flex items-center gap-1.5 font-sans">
                  <span>Heron AI Assistant</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                    Online
                  </span>
                </div>
                <div className="text-[10px] text-[#848E9C] font-mono">Institutional Guide</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  voiceEnabled
                    ? 'text-[#F0B90B] bg-[#F0B90B]/15 border border-[#F0B90B]/30'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
                }`}
                title={voiceEnabled ? 'Voice response active (Click to mute)' : 'Voice response muted (Click to unmute)'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all"
                title="Minimize Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#F0B90B] text-[#181A20] font-medium rounded-tr-none'
                      : 'bg-[#181A20] border border-[#2B313A] text-[#EAECEF] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{m.text}</div>

                  {m.supportRequired && (
                    <div className="mt-2.5 pt-2 border-t border-[#2B313A] flex flex-col gap-1.5">
                      <div className="text-[11px] font-mono text-[#848E9C]">Need specialized agent assistance?</div>
                      <a
                        href="mailto:support@stealthssolutions.com?subject=Investor Inquiry - Heron Trustee"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] border border-[#F0B90B]/30 text-[11px] font-mono font-bold transition-all"
                      >
                        <Headphones className="w-3 h-3" />
                        <span>Contact Human Support Desk ↗</span>
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1 pt-0.5">
                    <span
                      className={`text-[9px] font-mono ${
                        m.sender === 'user' ? 'text-[#181A20]/60' : 'text-[#848E9C]'
                      }`}
                    >
                      {m.time}
                    </span>
                    {m.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        className="text-[9px] font-mono text-[#F0B90B] hover:text-[#FCD535] flex items-center gap-1 opacity-80 hover:opacity-100"
                        title="Listen to this response"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>

                  {m.sender === 'ai' && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t border-[#2B313A]/50">
                      {m.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setInput(s)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] border border-[#F0B90B]/20 transition-all text-left"
                        >
                          {s} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#2B313A] flex items-center justify-center text-[#848E9C] shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-6 h-6 rounded-full bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] shrink-0">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <div className="bg-[#181A20] border border-[#2B313A] px-3 py-2 rounded-xl text-[11px] font-mono text-[#848E9C] flex items-center gap-1">
                  <span>Assistant is thinking</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          {messages.length <= 2 && (
            <div className="p-2 border-t border-[#2B313A] bg-[#181A20]/60 overflow-x-auto no-scrollbar flex gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="whitespace-nowrap px-2.5 py-1 rounded-md bg-[#2B313A] hover:bg-[#363D47] text-[10px] font-mono text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-[#181A20] border-t border-[#2B313A] flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/40 animate-pulse'
                  : 'bg-[#1E2329] border border-[#2B313A] text-[#848E9C] hover:text-[#F0B90B] hover:border-[#F0B90B]/30'
              }`}
              title={isListening ? "Listening... click to stop" : "Click to speak with voice"}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : "Ask about plans, deposits, security..."}
              className={`flex-1 bg-[#1E2329] border ${
                isListening ? 'border-[#F0B90B]' : 'border-[#2B313A]'
              } focus:border-[#F0B90B] rounded-xl px-3.5 py-2 text-xs text-[#EAECEF] outline-none font-sans placeholder:text-[#848E9C]/60`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] transition-all disabled:opacity-40 disabled:hover:bg-[#F0B90B]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
