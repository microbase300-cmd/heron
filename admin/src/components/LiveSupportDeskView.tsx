import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Search,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Bell,
  RefreshCw,
  CheckCheck
} from 'lucide-react';
import { SupportChatSession, SupportMessage } from '../types';
import { adminApi } from '../services/api';

interface LiveSupportDeskViewProps {
  onRefreshStats?: () => void;
  playNotificationSound?: () => void;
}

export const LiveSupportDeskView: React.FC<LiveSupportDeskViewProps> = ({
  onRefreshStats,
  playNotificationSound
}) => {
  const [chats, setChats] = useState<SupportChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<SupportChatSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [agentName, setAgentName] = useState('Senior Settlement Officer');
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [desktopNotifGranted, setDesktopNotifGranted] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  const cannedReplies = [
    "Hello! I am your Senior Institutional Representative. How can I assist your portfolio today?",
    "I am currently reviewing your account ledger and blockchain confirmation status. One moment please.",
    "Your deposit has been successfully credited to your liquidity balance. You can view it on your Overview tab.",
    "Your withdrawal request is in our hot disbursement gateway and will clear in approximately 15 minutes.",
    "For institutional security, please complete your Level 2 KYC verification in the Account & Security desk.",
    "Is there anything else regarding your active mandates or transactions I can assist with today?"
  ];

  // Request browser desktop notification permission
  const requestDesktopNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setDesktopNotifGranted(perm === 'granted');
      if (perm === 'granted') {
        new Notification('Heron Live Support', {
          body: 'Desktop notifications enabled for new investor live chats.',
          icon: '/heron_logo.jpg'
        });
      }
    } catch {}
  };

  // Fetch all chats
  const fetchChats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminApi.getSupportChats();
      if (res && Array.isArray(res.chats)) {
        setChats(res.chats);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to load support chats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch specific chat details
  const fetchChatDetails = async (chatId: string) => {
    try {
      const res = await adminApi.getSupportChatDetails(chatId);
      if (res && res.chat) {
        setActiveChat(res.chat);
        const msgs = res.messages || [];
        if (msgs.length > lastMessageCountRef.current) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.sender === 'user' && playNotificationSound) {
            playNotificationSound();
          }
        }
        lastMessageCountRef.current = msgs.length;
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to fetch chat details:', err);
    }
  };

  // Initial load and polling
  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => {
      fetchChats(true);
      if (selectedChatId) {
        fetchChatDetails(selectedChatId);
      }
    }, 3000); // 3s sync
    return () => clearInterval(interval);
  }, [selectedChatId]);

  // When selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      fetchChatDetails(selectedChatId);
      adminApi.markSupportChatRead(selectedChatId);
    } else {
      setActiveChat(null);
      setMessages([]);
      lastMessageCountRef.current = 0;
    }
  }, [selectedChatId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatId || !replyText.trim() || sending) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await adminApi.sendSupportReply(selectedChatId, textToSend, agentName);
      if (res && res.message) {
        setMessages(prev => [...prev, res.message]);
        if (res.chat) setActiveChat(res.chat);
        fetchChats(true);
      }
    } catch (err) {
      console.error('Error sending agent reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (status: 'active' | 'resolved' | 'waiting_agent') => {
    if (!selectedChatId) return;
    try {
      const res = await adminApi.updateSupportChatStatus(selectedChatId, status, agentName);
      if (res?.chat) {
        setActiveChat(res.chat);
        fetchChats(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered chats
  const filteredChats = chats.filter(c => {
    if (filterTab === 'waiting' && c.status !== 'waiting_agent' && c.unreadByAdmin === 0) return false;
    if (filterTab === 'active' && c.status !== 'active') return false;
    if (filterTab === 'resolved' && c.status !== 'resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.userName?.toLowerCase().includes(q);
      const matchEmail = c.userEmail?.toLowerCase().includes(q);
      const matchMsg = c.lastMessageText?.toLowerCase().includes(q);
      return matchName || matchEmail || matchMsg;
    }
    return true;
  });

  const waitingCount = chats.filter(c => c.status === 'waiting_agent' || c.unreadByAdmin > 0).length;
  const activeCount = chats.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#1E2329] border border-[#2B313A]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAECEF] flex items-center gap-2">
              <span>Live Support Operations Desk</span>
              {waitingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40 animate-pulse">
                  {waitingCount} WAITING
                </span>
              )}
            </h2>
            <p className="text-xs text-[#848E9C]">Real-time encrypted client communications and institutional advisory</p>
          </div>
        </div>

        {/* Representative Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#181A20] border border-[#2B313A] px-2.5 py-1.5 rounded-lg font-mono">
            <span className="text-[#848E9C]">Agent Identity:</span>
            <input
              type="text"
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              className="bg-transparent text-[#F0B90B] font-bold focus:outline-none w-44"
              placeholder="e.g. Senior Settlement Officer"
            />
          </div>

          {!desktopNotifGranted && (
            <button
              onClick={requestDesktopNotification}
              className="px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Enable desktop notifications for new live chats"
            >
              <Bell className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span>Enable Alerts</span>
            </button>
          )}

          <button
            onClick={() => fetchChats()}
            disabled={loading}
            className="p-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] transition-all cursor-pointer"
            title="Refresh Live Chat Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Live Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[600px]">
        {/* Left Column: Conversations List (4 cols) */}
        <div className="lg:col-span-4 bg-[#1E2329] border border-[#2B313A] rounded-xl flex flex-col overflow-hidden">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-[#2B313A] space-y-2.5 bg-[#181A20]/50">
            <div className="relative">
              <Search className="w-4 h-4 text-[#848E9C] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search investor, email, message..."
                className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAECEF] placeholder:text-[#848E9C]/60 focus:outline-none focus:border-[#F0B90B]"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All (${chats.length})` },
                { id: 'waiting', label: `Waiting (${waitingCount})` },
                { id: 'active', label: `Active (${activeCount})` },
                { id: 'resolved', label: 'Resolved' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTab(t.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    filterTab === t.id
                      ? 'bg-[#F0B90B] text-[#181A20] font-bold'
                      : 'bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable Queue */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2B313A]/50 no-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-[#848E9C] text-xs font-mono">
                No active conversations in this category.
              </div>
            ) : (
              filteredChats.map(c => {
                const isSelected = selectedChatId === c.id;
                const isWaiting = c.status === 'waiting_agent' || c.unreadByAdmin > 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChatId(c.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0B90B]/10 border-l-4 border-l-[#F0B90B]'
                        : 'hover:bg-[#181A20]/60'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-[#2B313A] border border-[#363D47] flex items-center justify-center text-xs font-bold text-[#EAECEF]">
                        {c.userName ? c.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {isWaiting && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F6465D] absolute -top-0.5 -right-0.5 border-2 border-[#1E2329] animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#EAECEF] truncate font-sans">
                          {c.userName}
                        </span>
                        <span className="text-[10px] font-mono text-[#848E9C] shrink-0">
                          {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#848E9C] font-mono truncate mb-1">
                        {c.userEmail}
                      </div>

                      <div className="text-xs text-[#848E9C] truncate line-clamp-1 mb-1.5">
                        {c.lastMessageText}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded uppercase font-semibold ${
                          c.status === 'waiting_agent'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 animate-pulse'
                            : c.status === 'active'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                            : 'bg-[#2B313A] text-[#848E9C]'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>

                        <span className="text-[#0ECB81] font-semibold">
                          ${(c.userBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Reply Desk (8 cols) */}
        <div className="lg:col-span-8 bg-[#1E2329] border border-[#2B313A] rounded-xl flex flex-col overflow-hidden">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#848E9C] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#181A20] border border-[#2B313A] flex items-center justify-center text-[#F0B90B]">
                <Headphones className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-sm font-sans font-bold text-[#EAECEF]">No Active Support Session Selected</h3>
              <p className="text-xs max-w-sm">Select an investor conversation from the queue on the left to review ledger status, message history, and respond in real-time.</p>
            </div>
          ) : (
            <>
              {/* Client Profile Header Bar */}
              <div className="p-3.5 bg-[#181A20] border-b border-[#2B313A] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] font-bold text-sm shrink-0">
                    {activeChat.userName ? activeChat.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#EAECEF] font-sans truncate">
                        {activeChat.userName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#848E9C]">
                      <button
                        onClick={() => handleCopy(activeChat.userEmail, 'email')}
                        className="hover:text-[#EAECEF] flex items-center gap-1"
                        title="Copy email"
                      >
                        <span>{activeChat.userEmail}</span>
                        {copiedKey === 'email' ? <Check className="w-3 h-3 text-[#0ECB81]" /> : <Copy className="w-3 h-3 opacity-60" />}
                      </button>
                      {activeChat.userUid && (
                        <button
                          onClick={() => handleCopy(activeChat.userUid || '', 'uid')}
                          className="hidden sm:inline-flex items-center gap-1 hover:text-[#EAECEF]"
                          title="Copy UID"
                        >
                          <span>UID: {activeChat.userUid}</span>
                          {copiedKey === 'uid' ? <Check className="w-3 h-3 text-[#0ECB81]" /> : <Copy className="w-3 h-3 opacity-60" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Balance & Action Status */}
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block pr-2 border-r border-[#2B313A]">
                    <div className="text-[10px] font-mono uppercase text-[#848E9C]">NAV Liquidity</div>
                    <div className="text-xs font-mono font-bold text-[#0ECB81]">
                      ${(activeChat.userBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </div>
                  </div>

                  {activeChat.status !== 'resolved' ? (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-3 py-1.5 rounded-lg bg-[#0ECB81]/15 hover:bg-[#0ECB81]/25 text-[#0ECB81] border border-[#0ECB81]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Mark session as resolved"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus('active')}
                      className="px-3 py-1.5 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Reopen support session"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reopen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-sans bg-[#181A20]/40 no-scrollbar">
                {messages.map(m => {
                  const isAgent = m.sender === 'agent';
                  const isSystem = m.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#2B313A]/60 border border-[#2B313A] text-[10px] font-mono text-[#848E9C]">
                          🛡️ {m.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isAgent && (
                        <div className="w-7 h-7 rounded-full bg-[#2B313A] flex items-center justify-center text-[10px] font-bold text-[#EAECEF] shrink-0 mt-0.5">
                          {m.senderName ? m.senderName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}

                      <div
                        className={`max-w-[78%] rounded-xl p-3 shadow-sm leading-relaxed ${
                          isAgent
                            ? 'bg-[#F0B90B] text-[#181A20] font-medium rounded-tr-none'
                            : 'bg-[#181A20] border border-[#2B313A] text-[#EAECEF] rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono">
                          <span className={`font-bold ${isAgent ? 'text-[#181A20]/80' : 'text-[#F0B90B]'}`}>
                            {m.senderName || (isAgent ? 'Officer' : 'Investor')}
                          </span>
                          <span className={`${isAgent ? 'text-[#181A20]/60' : 'text-[#848E9C]'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="whitespace-pre-line text-xs">{m.text}</div>
                      </div>

                      {isAgent && (
                        <div className="w-7 h-7 rounded-full bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center text-[#F0B90B] shrink-0 mt-0.5">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="p-2 border-t border-[#2B313A] bg-[#181A20]/60 overflow-x-auto no-scrollbar flex gap-1.5">
                {cannedReplies.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(r)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-md bg-[#2B313A] hover:bg-[#363D47] text-[10px] font-mono text-[#848E9C] hover:text-[#EAECEF] border border-[#363D47] transition-all cursor-pointer"
                  >
                    {r.length > 35 ? r.substring(0, 35) + '...' : r}
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} className="p-3 bg-[#181A20] border-t border-[#2B313A] flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeChat.userName} as "${agentName}"...`}
                  className="flex-1 bg-[#1E2329] border border-[#2B313A] focus:border-[#F0B90B] rounded-xl px-4 py-2.5 text-xs text-[#EAECEF] outline-none font-sans placeholder:text-[#848E9C]/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Send Reply</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};