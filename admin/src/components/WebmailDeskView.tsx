import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Edit3,
  Reply,
  Search,
  RefreshCw,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { adminApi } from '../services/api';
import { WebmailMessage, WebmailFolder, WebmailFolderStats } from '../types';

interface WebmailDeskViewProps {
  onRefreshStats?: () => void;
}

export const WebmailDeskView: React.FC<WebmailDeskViewProps> = ({ onRefreshStats }) => {
  const [currentFolder, setCurrentFolder] = useState<WebmailFolder>('inbox');
  const [messages, setMessages] = useState<WebmailMessage[]>([]);
  const [stats, setStats] = useState<WebmailFolderStats>({
    inboxUnread: 0,
    inboxTotal: 0,
    sentTotal: 0,
    draftsTotal: 0,
    trashTotal: 0
  });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessNotice, setSendSuccessNotice] = useState<string | null>(null);
  const [sendErrorNotice, setSendErrorNotice] = useState<string | null>(null);

  // Fetch messages in active folder
  const fetchFolderMessages = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await adminApi.getWebmailMessages({
        folder: currentFolder,
        search: search.trim() || undefined,
        limit: 100
      });
      if (res && res.success) {
        setMessages(res.messages || []);
        if (res.stats) setStats(res.stats);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.warn('Webmail fetch notice:', err);
    } finally {
      setLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  }, [currentFolder, search, onRefreshStats]);

  useEffect(() => {
    fetchFolderMessages(false);
    const timer = setInterval(() => {
      fetchFolderMessages(true);
    }, 10000); // 10s auto-refresh
    return () => clearInterval(timer);
  }, [fetchFolderMessages]);

  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  // Select message and mark read
  const handleSelectMessage = async (msg: WebmailMessage) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead && msg.folder === 'inbox') {
      try {
        await adminApi.markWebmailRead(msg.id, true);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        setStats(prev => ({ ...prev, inboxUnread: Math.max(0, prev.inboxUnread - 1) }));
      } catch {}
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      const isTrash = currentFolder === 'trash';
      await adminApi.deleteWebmailMessage(msgId, isTrash);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessageId === msgId) {
        setSelectedMessageId(null);
      }
      fetchFolderMessages(true);
    } catch {
      alert('Failed to delete message.');
    }
  };

  // Reply to selected message
  const handleInitiateReply = () => {
    if (!selectedMessage) return;
    setComposeTo(selectedMessage.from);
    setComposeSubject(selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`);
    setComposeBody(`

--- On ${new Date(selectedMessage.date).toLocaleString()}, ${selectedMessage.fromName || selectedMessage.from} wrote ---
> ${selectedMessage.bodyText.replace(/\n/g, '\n> ')}`);
    setIsComposeOpen(true);
  };

  // Send Email
  const handleSendEmail = async (asDraft = false) => {
    if (!composeTo.trim() && !asDraft) {
      setSendErrorNotice('Please provide at least one recipient email.');
      return;
    }
    setIsSending(true);
    setSendErrorNotice(null);
    setSendSuccessNotice(null);

    try {
      const res = await adminApi.sendWebmail({
        to: composeTo.split(',').map(s => s.trim()).filter(Boolean),
        subject: composeSubject.trim() || '(No Subject)',
        bodyText: composeBody.trim(),
        fromName: 'Heron Assets Trustee Support',
        isDraft: asDraft
      });

      if (res && res.success) {
        setSendSuccessNotice(asDraft ? 'Draft saved successfully.' : 'Email dispatched successfully via Resend SMTP (Port 587)!');
        setTimeout(() => {
          setIsComposeOpen(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
          setSendSuccessNotice(null);
          fetchFolderMessages(true);
        }, 1200);
      } else {
        setSendErrorNotice('Dispatch failed. Please verify recipient address.');
      }
    } catch (err: any) {
      setSendErrorNotice(err?.message || 'Error transmitting email via SMTP.');
    } finally {
      setIsSending(false);
    }
  };

  // Relative time helper
  const formatEmailDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/40 flex items-center justify-center text-[#F0B90B]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-sans font-bold text-[#EAECEF] tracking-tight">
                Institutional Webmail Suite
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                PORT 587 ACTIVE
              </span>
            </div>
            <p className="text-xs font-mono text-[#848E9C]">
              support@heronassetstrusteess.com • Direct dispatch and live inbox monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setComposeTo('');
              setComposeSubject('');
              setComposeBody('');
              setIsComposeOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold font-mono tracking-wide flex items-center gap-2 shadow-md shadow-[#F0B90B]/20 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </button>

          <button
            onClick={() => fetchFolderMessages(false)}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[#181A20] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all disabled:opacity-40"
            title="Refresh Ingress"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#F0B90B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Webmail 3-Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px] rounded-xl bg-[#1E2329] border border-[#2B313A] overflow-hidden shadow-xl">
        {/* PANE 1: Folder Navigation (3 cols) */}
        <div className="lg:col-span-3 bg-[#181A20] border-r border-[#2B313A] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase font-bold text-[#848E9C] tracking-wider px-2">
              Mailbox Folders
            </div>

            <nav className="space-y-1">
              {[
                { id: 'inbox', label: 'Inbox', icon: Inbox, count: stats.inboxUnread, highlight: true },
                { id: 'sent', label: 'Sent', icon: Send, count: stats.sentTotal },
                { id: 'drafts', label: 'Drafts', icon: FileText, count: stats.draftsTotal },
                { id: 'trash', label: 'Trash', icon: Trash2, count: stats.trashTotal }
              ].map((f) => {
                const Icon = f.icon;
                const active = currentFolder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setCurrentFolder(f.id as WebmailFolder);
                      setSelectedMessageId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      active
                        ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 font-bold'
                        : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#1E2329]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`} />
                      <span>{f.label}</span>
                    </div>
                    {f.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.highlight && stats.inboxUnread > 0
                          ? 'bg-[#F0B90B] text-[#181A20]'
                          : 'bg-[#2B313A] text-[#848E9C]'
                      }`}>
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mailbox Status Card */}
          <div className="p-3.5 rounded-xl bg-[#1E2329] border border-[#2B313A] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#0ECB81]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold">Encrypted Egress</span>
            </div>
            <div className="text-[11px] font-mono text-[#848E9C] leading-relaxed">
              TLS 1.3 active via Resend SMTP server on Port 587. Inbound webhook endpoint ready for Cloudflare email forwarding.
            </div>
          </div>
        </div>

        {/* PANE 2: Message List (4 cols) */}
        <div className="lg:col-span-4 border-r border-[#2B313A] flex flex-col h-full bg-[#181A20]/50">
          {/* Search Bar */}
          <div className="p-3 border-b border-[#2B313A]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sender, subject, body..."
                className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-[#EAECEF] placeholder-[#848E9C] focus:border-[#F0B90B] focus:outline-none"
              />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2B313A]/50">
            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-[#848E9C]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#F0B90B] mb-2" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-[#848E9C] p-4">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#848E9C]" />
                <div className="text-xs font-mono font-bold text-[#EAECEF]">Folder is Empty</div>
                <div className="text-[11px] font-mono mt-1 text-[#848E9C]">
                  No messages found in {currentFolder}.
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const active = m.id === selectedMessageId;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMessage(m)}
                    className={`p-3.5 cursor-pointer transition-all border-l-2 ${
                      active
                        ? 'bg-[#1E2329] border-l-[#F0B90B]'
                        : !m.isRead && m.folder === 'inbox'
                        ? 'bg-[#181A20] border-l-[#0ECB81] hover:bg-[#1E2329]/80'
                        : 'border-l-transparent hover:bg-[#1E2329]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {!m.isRead && m.folder === 'inbox' && (
                          <span className="w-2 h-2 rounded-full bg-[#0ECB81] shrink-0" />
                        )}
                        <span className={`text-xs font-mono truncate ${!m.isRead ? 'font-bold text-[#EAECEF]' : 'text-[#848E9C]'}`}>
                          {m.folder === 'sent' ? `To: ${m.to.join(', ')}` : (m.fromName || m.from)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#848E9C] shrink-0">
                        {formatEmailDate(m.date)}
                      </span>
                    </div>

                    <div className={`text-xs font-mono truncate mb-1 ${!m.isRead ? 'font-bold text-[#F0B90B]' : 'text-[#EAECEF]'}`}>
                      {m.subject || '(No Subject)'}
                    </div>

                    <div className="text-[11px] font-mono text-[#848E9C] truncate">
                      {m.bodyText.substring(0, 80) || '(No preview text available)'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 3: Reading / Detail Pane (5 cols) */}
        <div className="lg:col-span-5 p-5 flex flex-col h-full bg-[#1E2329]">
          {!selectedMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#848E9C]">
              <div className="w-14 h-14 rounded-2xl bg-[#181A20] border border-[#2B313A] flex items-center justify-center text-[#848E9C] mb-3">
                <Mail className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="text-sm font-sans font-bold text-[#EAECEF]">No Message Selected</h3>
              <p className="text-xs font-mono text-[#848E9C] mt-1 max-w-xs">
                Select an incoming message from the list to review complete headers, body, and dispatch instant replies.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Actions Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2B313A] shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMessageId(null)}
                    className="p-1.5 rounded-lg bg-[#181A20] text-[#848E9C] hover:text-[#EAECEF] lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleInitiateReply}
                    className="px-3 py-1.5 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="p-1.5 rounded-lg bg-[#F6465D]/10 hover:bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/30 transition-all"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Header Details */}
              <div className="py-4 border-b border-[#2B313A] space-y-2 shrink-0">
                <h2 className="text-base font-sans font-bold text-[#EAECEF] leading-snug">
                  {selectedMessage.subject || '(No Subject)'}
                </h2>

                <div className="flex items-center justify-between text-xs font-mono text-[#848E9C]">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] flex items-center justify-center font-bold text-[10px]">
                      {(selectedMessage.fromName || selectedMessage.from).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-[#EAECEF]">
                        {selectedMessage.fromName || selectedMessage.from}
                      </span>
                      {selectedMessage.fromName && (
                        <span className="text-[10px] text-[#848E9C] ml-1.5">
                          &lt;{selectedMessage.from}&gt;
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#848E9C] shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#848E9C]">
                  To: <span className="text-[#EAECEF]">{selectedMessage.to.join(', ')}</span>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs font-sans text-[#EAECEF] leading-relaxed overflow-x-auto selection:bg-[#F0B90B]"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs font-mono text-[#EAECEF] whitespace-pre-wrap leading-relaxed selection:bg-[#F0B90B]">
                    {selectedMessage.bodyText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose / Reply Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#1E2329] border border-[#2B313A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#181A20] border-b border-[#2B313A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#F0B90B]" />
                <h3 className="text-sm font-sans font-bold text-[#EAECEF]">
                  {composeSubject.startsWith('Re:') ? 'Reply Message' : 'New Institutional Dispatch'}
                </h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-[#848E9C] hover:text-[#EAECEF] text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Fields */}
            <div className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              {sendSuccessNotice && (
                <div className="p-3 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/30 text-[#0ECB81] text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{sendSuccessNotice}</span>
                </div>
              )}

              {sendErrorNotice && (
                <div className="p-3 rounded-lg bg-[#F6465D]/15 border border-[#F6465D]/30 text-[#F6465D] text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{sendErrorNotice}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-[#848E9C] mb-1">From</label>
                <input
                  type="text"
                  disabled
                  value="Heron Assets Trustee <support@heronassetstrusteess.com>"
                  className="w-full bg-[#181A20]/60 border border-[#2B313A] rounded-lg px-3 py-2 text-xs font-mono text-[#848E9C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#848E9C] mb-1">To (Recipient)</label>
                <input
                  type="text"
                  placeholder="investor@example.com, client@firm.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-xs font-mono text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#848E9C] mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Regarding portfolio allocation / verification"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-xs font-mono text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#848E9C] mb-1">Message Body</label>
                <textarea
                  rows={10}
                  placeholder="Type your official response or memo here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg p-3 text-xs font-mono text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#181A20] border-t border-[#2B313A] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSendEmail(true)}
                disabled={isSending}
                className="px-3.5 py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-xs font-mono text-[#EAECEF] transition-all disabled:opacity-50"
              >
                Save as Draft
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  disabled={isSending}
                  className="px-3.5 py-2 rounded-lg text-xs font-mono text-[#848E9C] hover:text-[#EAECEF]"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => handleSendEmail(false)}
                  disabled={isSending}
                  className="px-5 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-mono font-bold flex items-center gap-2 shadow-md shadow-[#F0B90B]/20 transition-all disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  <span>{isSending ? 'Transmitting...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
