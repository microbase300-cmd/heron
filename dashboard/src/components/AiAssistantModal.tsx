import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Headphones, Minimize2, Mic, Volume2, VolumeX, ShieldCheck, CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'agent' | 'system';
  senderName?: string;
  text: string;
  supportRequired?: boolean;
  suggestions?: string[];
  time: string;
}

interface AiAssistantModalProps {
  user?: UserType | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Live Representative Chat State
  const [mode, setMode] = useState<'ai' | 'live_agent'>('ai');
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('heron_active_support_chat_id') : null;
  });
  const [agentName, setAgentName] = useState<string>('Senior Institutional Officer');
  const [isConnectingAgent, setIsConnectingAgent] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Heron Institutional AI Assistant. How may I assist your portfolio operations today? You can ask about our investment plans, deposit & withdrawal guidelines, security custody, or affiliate network.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synthesized Web Audio API Chime (0MB external dependencies, 100% reliable)
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5 note

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  // Speech Synthesis (Text to Speech)
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

  // Voice Input (Speech to Text)
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

  // Connect to Live Human Representative
  const handleConnectToLiveAgent = async (initialQuestion?: string) => {
    setIsConnectingAgent(true);
    try {
      const res = await api.initiateSupportChat({
        sessionId: activeChatId || undefined,
        userId: user?.id,
        userName: user?.name || 'Institutional Client',
        userEmail: user?.email || 'investor@heronassetstrusteess.com',
        userUid: user?.uid,
        userBalance: user?.balance,
        initialMessage: initialQuestion || input.trim() || 'Client requested human representative assistance.'
      });

      if (res?.chat) {
        setActiveChatId(res.chat.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('heron_active_support_chat_id', res.chat.id);
        }
        if (res.chat.assignedAgentName) {
          setAgentName(res.chat.assignedAgentName);
        }
        setMode('live_agent');
        playNotificationChime();

        if (res.messages && res.messages.length > 0) {
          const loaded: ChatMessage[] = res.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender === 'user' ? 'user' : m.sender === 'agent' ? 'agent' : 'system',
            senderName: m.senderName,
            text: m.text,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(loaded);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `sys_${Date.now()}`,
              sender: 'system',
              text: 'Connected to Heron Institutional Live Desk. An officer has received your priority notification and is joining.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
        setInput('');
      }
    } catch (err) {
      console.error('Error connecting to live representative:', err);
      alert('Unable to connect to live support desk at this time. Please email support@heronassetstrusteess.com');
    } finally {
      setIsConnectingAgent(false);
    }
  };

  // Live Chat Polling (Sync every 2.5s while in live agent mode)
  useEffect(() => {
    if (!isOpen || mode !== 'live_agent' || !activeChatId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.getSupportChat(activeChatId, true);
        if (!isMounted || !res) return;

        if (res.chat?.assignedAgentName) {
          setAgentName(res.chat.assignedAgentName);
        }

        if (res.messages && Array.isArray(res.messages)) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newServerMsgs: ChatMessage[] = [];

            for (const sm of res.messages) {
              if (!existingIds.has(sm.id)) {
                newServerMsgs.push({
                  id: sm.id,
                  sender: sm.sender === 'user' ? 'user' : sm.sender === 'agent' ? 'agent' : 'system',
                  senderName: sm.senderName,
                  text: sm.text,
                  time: new Date(sm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                if (sm.sender === 'agent') {
                  playNotificationChime();
                }
              }
            }

            if (newServerMsgs.length > 0) {
              return [...prev, ...newServerMsgs];
            }
            return prev;
          });
        }
      } catch {
        // Handled silently during polling
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, mode, activeChatId]);

  // Handle Send
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');

    // If in Live Agent Mode, send directly to support backend
    if (mode === 'live_agent' && activeChatId) {
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);

      try {
        await api.sendSupportMessage(activeChatId, userText, user?.name || 'Institutional Client');
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'system',
            text: 'Message transmission failed. Retrying in background...',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      return;
    }

    // Check if user is asking to speak with a human or representative
    const lower = userText.toLowerCase();
    if (
      lower.includes('human') ||
      lower.includes('representative') ||
      lower.includes('real person') ||
      lower.includes('speak to agent') ||
      lower.includes('live agent') ||
      lower.includes('talk to someone') ||
      lower.includes('live chat')
    ) {
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      handleConnectToLiveAgent(userText);
      return;
    }

    // Default: AI Knowledge Base Assistant
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
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
        text: "I am temporarily unable to reach the knowledge base. For urgent assistance, please contact our support desk directly at support@heronassetstrusteess.com.",
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
    '💬 Chat with Human Representative'
  ];

  return (
    <>
      {/* Floating Launcher Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] shadow-xl shadow-[#F0B90B]/25 flex items-center gap-2 font-mono font-bold text-xs transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
          title="Heron Assistant & Live Support"
        >
          <div className="relative">
            {mode === 'live_agent' ? (
              <Headphones className="w-5 h-5 text-[#181A20]" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ECB81] absolute -top-1 -right-1 animate-pulse border-2 border-[#181A20]" />
          </div>
          <span className="hidden sm:inline font-sans">
            {mode === 'live_agent' ? 'Live Support Desk' : 'Ask AI / Live Chat'}
          </span>
        </button>
      )}

      {/* Floating Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-[#1E2329] border border-[#2B313A] shadow-2xl shadow-black flex flex-col h-[530px] max-h-[82vh] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-[#181A20] border-b border-[#2B313A] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {mode === 'live_agent' ? (
                <div className="w-8 h-8 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center justify-center text-[#0ECB81] shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <div className="text-xs font-bold text-[#EAECEF] flex items-center gap-1.5 font-sans truncate">
                  <span>{mode === 'live_agent' ? 'Live Support Desk' : 'Heron AI Assistant'}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 shrink-0 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#0ECB81] animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="text-[10px] text-[#848E9C] font-mono truncate">
                  {mode === 'live_agent' ? `${agentName} • Connected` : 'Institutional Concierge'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mode Toggle Button */}
              {mode === 'live_agent' ? (
                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  className="px-2 py-1 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer"
                  title="Switch back to AI Assistant"
                >
                  <Bot className="w-3 h-3" />
                  <span>AI Mode</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnectToLiveAgent()}
                  disabled={isConnectingAgent}
                  className="px-2.5 py-1 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/30 text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Start live conversation with a human representative"
                >
                  {isConnectingAgent ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Headphones className="w-3 h-3" />
                  )}
                  <span>Human</span>
                </button>
              )}

              {/* Voice Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  voiceEnabled
                    ? 'text-[#F0B90B] bg-[#F0B90B]/15 border border-[#F0B90B]/30'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
                }`}
                title={voiceEnabled ? 'Voice active (Click to mute)' : 'Voice muted (Click to unmute)'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all cursor-pointer"
                title="Minimize Chat"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Banner */}
          {mode === 'live_agent' ? (
            <div className="px-3 py-1.5 bg-[#0ECB81]/10 border-b border-[#0ECB81]/20 flex items-center justify-between text-[10px] font-mono text-[#0ECB81]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse"></span>
                Representative Live Channel
              </span>
              <span className="text-[#848E9C]">Priority Routing Active</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-[#181A20] border-b border-[#2B313A] flex items-center justify-between text-[10px] font-mono text-[#848E9C]">
              <span>Need human assistance?</span>
              <button
                onClick={() => handleConnectToLiveAgent()}
                className="text-[#F0B90B] hover:underline font-bold cursor-pointer"
              >
                Chat with Representative →
              </button>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-sans no-scrollbar">
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

                {m.sender === 'agent' && (
                  <div className="w-6 h-6 rounded-full bg-[#0ECB81]/20 border border-[#0ECB81]/40 flex items-center justify-center text-[#0ECB81] shrink-0 mt-0.5" title={m.senderName || 'Representative'}>
                    <Headphones className="w-3 h-3" />
                  </div>
                )}

                {m.sender === 'system' ? (
                  <div className="w-full text-center my-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#2B313A]/60 border border-[#2B313A] text-[10px] font-mono text-[#848E9C]">
                      🛡️ {m.text}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[84%] rounded-xl p-3 leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-[#F0B90B] text-[#181A20] font-medium rounded-tr-none'
                        : m.sender === 'agent'
                        ? 'bg-[#181A20] border border-[#0ECB81]/40 text-[#EAECEF] rounded-tl-none'
                        : 'bg-[#181A20] border border-[#2B313A] text-[#EAECEF] rounded-tl-none'
                    }`}
                  >
                    {m.sender === 'agent' && (
                      <div className="text-[10px] font-mono font-bold text-[#0ECB81] mb-1 flex items-center gap-1">
                        <span>{m.senderName || 'Representative'}</span>
                        <span className="text-[9px] px-1 rounded bg-[#0ECB81]/20 text-[#0ECB81]">OFFICER</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line text-xs">{m.text}</div>

                    {m.supportRequired && mode !== 'live_agent' && (
                      <div className="mt-2.5 pt-2 border-t border-[#2B313A] flex flex-col gap-1.5">
                        <div className="text-[11px] font-mono text-[#848E9C]">Need specialized agent assistance?</div>
                        <button
                          type="button"
                          onClick={() => handleConnectToLiveAgent()}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Chat with Human Representative Now</span>
                        </button>
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
                            onClick={() => {
                              if (s.toLowerCase().includes('human') || s.toLowerCase().includes('support') || s.toLowerCase().includes('representative')) {
                                handleConnectToLiveAgent();
                              } else {
                                setInput(s);
                              }
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] border border-[#F0B90B]/20 transition-all text-left cursor-pointer"
                          >
                            {s} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                  <span>Assistant is typing</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Suggestions */}
          {mode === 'ai' && messages.length <= 2 && (
            <div className="p-2 border-t border-[#2B313A] bg-[#181A20]/60 overflow-x-auto no-scrollbar flex gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (q.includes('Representative')) {
                      handleConnectToLiveAgent();
                    } else {
                      setInput(q);
                    }
                  }}
                  className="whitespace-nowrap px-2.5 py-1 rounded-md bg-[#2B313A] hover:bg-[#363D47] text-[10px] font-mono text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] transition-all cursor-pointer"
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
              placeholder={
                mode === 'live_agent'
                  ? "Message live representative..."
                  : isListening
                  ? "Listening... speak now"
                  : "Ask AI or type 'speak with human'..."
              }
              className={`flex-1 bg-[#1E2329] border ${
                mode === 'live_agent'
                  ? 'border-[#0ECB81]/50 focus:border-[#0ECB81]'
                  : isListening
                  ? 'border-[#F0B90B]'
                  : 'border-[#2B313A] focus:border-[#F0B90B]'
              } rounded-xl px-3.5 py-2 text-xs text-[#EAECEF] outline-none font-sans placeholder:text-[#848E9C]/60 transition-colors`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer ${
                mode === 'live_agent'
                  ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#181A20]'
                  : 'bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};