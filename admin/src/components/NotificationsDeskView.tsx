import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  RefreshCw, 
  Megaphone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  User as UserIcon,
  Search,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { NotificationMessage, AdminUser } from '../types';
import { adminApi } from '../services/api';

interface NotificationsDeskViewProps {
  users: AdminUser[];
}

export const NotificationsDeskView: React.FC<NotificationsDeskViewProps> = ({ users: initialUsers }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [investorList, setInvestorList] = useState<AdminUser[]>(Array.isArray(initialUsers) ? initialUsers : []);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [recipientType, setRecipientType] = useState<'broadcast' | 'direct'>('broadcast');
  const [userSelectMode, setUserSelectMode] = useState<'picker' | 'dropdown' | 'manual'>('picker');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [investorSearch, setInvestorSearch] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'announcement' | 'alert' | 'info' | 'success'>('announcement');
  const [sender, setSender] = useState('Chief Risk Officer');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [notifs, userDirectory] = await Promise.allSettled([
        adminApi.getNotifications(),
        adminApi.getUsers(),
      ]);

      if (notifs.status === 'fulfilled' && Array.isArray(notifs.value)) {
        setNotifications(notifs.value);
      }
      if (userDirectory.status === 'fulfilled' && Array.isArray(userDirectory.value)) {
        setInvestorList(userDirectory.value);
      }
    } catch (err) {
      console.error('Failed to load notifications or users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (initialUsers && Array.isArray(initialUsers) && initialUsers.length > 0) {
      setInvestorList(initialUsers);
    }
  }, [initialUsers]);

  // Safe normalized investor pool
  const rawUsers = Array.isArray(investorList) && investorList.length > 0 ? investorList : (Array.isArray(initialUsers) ? initialUsers : []);
  const nonAdminInvestors = rawUsers.filter(u => (u.role || '').toLowerCase() !== 'admin');
  const activeInvestors = nonAdminInvestors.length > 0 ? nonAdminInvestors : rawUsers;

  const filteredInvestors = activeInvestors.filter((u) => {
    const term = (investorSearch || '').trim().toLowerCase();
    if (!term) return true;
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term) ||
      (u.referralCode || '').toLowerCase().includes(term)
    );
  });

  const selectedInvestor = activeInvestors.find(u => u.email.toLowerCase() === selectedUserEmail.toLowerCase());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ message: 'Please provide both title and message content.', type: 'error' });
      return;
    }

    if (recipientType === 'direct' && !selectedUserEmail.trim()) {
      setFeedback({ message: 'Please select or enter a target investor email.', type: 'error' });
      return;
    }

    try {
      setSending(true);
      const res = await adminApi.sendNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        recipientType,
        targetEmail: recipientType === 'direct' ? selectedUserEmail.trim() : undefined,
        sender: sender.trim() || 'Chief Risk Officer',
      });

      setFeedback({ message: res.message || 'Notification dispatched successfully!', type: 'success' });
      setTitle('');
      setMessage('');
      if (recipientType === 'direct') {
        setSelectedUserEmail('');
      }
      await fetchAllData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to send notification.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this platform notification?')) return;
    try {
      setDeletingId(id);
      await adminApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete notification.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <Bell className="w-5 h-5 text-[#F0B90B]" />
            Executive Communications & Notification Center
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Broadcast platform-wide updates or dispatch encrypted direct messages to client dashboards.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F0B90B]' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#2B313A]">
            <Send className="w-4 h-4 text-[#F0B90B]" />
            <h3 className="text-sm font-semibold text-[#EAECEF]">Compose Dispatch</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Recipient Audience Selector */}
            <div>
              <label className="block text-[11px] font-mono text-[#848E9C] mb-1.5">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('broadcast')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all border ${
                    recipientType === 'broadcast'
                      ? 'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/40 font-bold'
                      : 'bg-[#2B313A] text-[#848E9C] border-[#363D47] hover:text-[#EAECEF]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast (All Users)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('direct')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all border ${
                    recipientType === 'direct'
                      ? 'bg-[#387bf0]/20 text-[#387bf0] border-[#387bf0]/40 font-bold'
                      : 'bg-[#2B313A] text-[#848E9C] border-[#363D47] hover:text-[#EAECEF]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Direct to Investor</span>
                </button>
              </div>
            </div>

            {/* Direct Investor Selection Area */}
            {recipientType === 'direct' && (
              <div className="p-3.5 rounded-xl bg-[#2B313A]/60 border border-[#387bf0]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#387bf0] font-bold flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    Target Investor ({activeInvestors.length} Registered)
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setUserSelectMode('picker')}
                      className={`px-2 py-0.5 rounded transition-all ${userSelectMode === 'picker' ? 'bg-[#387bf0]/30 text-[#387bf0] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSelectMode('dropdown')}
                      className={`px-2 py-0.5 rounded transition-all ${userSelectMode === 'dropdown' ? 'bg-[#387bf0]/30 text-[#387bf0] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
                    >
                      Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSelectMode('manual')}
                      className={`px-2 py-0.5 rounded transition-all ${userSelectMode === 'manual' ? 'bg-[#387bf0]/30 text-[#387bf0] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {/* Selected User Header Banner */}
                {selectedUserEmail ? (
                  <div className="p-2.5 rounded-lg bg-[#0ECB81]/10 border border-[#0ECB81]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0ECB81]/20 border border-[#0ECB81]/40 flex items-center justify-center text-[#0ECB81] font-bold text-xs">
                        {selectedInvestor ? (selectedInvestor.name ? selectedInvestor.name[0].toUpperCase() : 'U') : '@'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#EAECEF] flex items-center gap-1.5">
                          <span>{selectedInvestor?.name || 'Target Investor'}</span>
                          {selectedInvestor && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                              ${(selectedInvestor.balance ?? 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#0ECB81] truncate max-w-[200px]">
                          {selectedUserEmail}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedUserEmail('')}
                      className="p-1 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all text-[11px] font-mono flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}

                {/* MODE 1: Visual Interactive Investor Picker Cards */}
                {userSelectMode === 'picker' && (
                  <div className="space-y-2">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={investorSearch}
                        onChange={(e) => setInvestorSearch(e.target.value)}
                        placeholder="Search investor by name, email, or ID..."
                        className="w-full pl-8 pr-8 py-1.5 rounded-lg glass-input text-xs font-mono text-[#EAECEF] bg-[#2B313A] border-[#363D47]"
                      />
                      <Search className="w-3 h-3 text-[#848E9C] absolute left-2.5" />
                      {investorSearch && (
                        <button
                          type="button"
                          onClick={() => setInvestorSearch('')}
                          className="absolute right-2.5 text-[#848E9C] hover:text-[#EAECEF] text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-[#363D47]">
                      {filteredInvestors.length === 0 ? (
                        <div className="p-4 text-center text-xs font-mono text-[#848E9C] bg-[#2B313A]/40 rounded-lg">
                          No matching investors found. Tap 'Manual' to type an address.
                        </div>
                      ) : (
                        filteredInvestors.map((u) => {
                          const isSelected = selectedUserEmail.toLowerCase() === u.email.toLowerCase();
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => setSelectedUserEmail(u.email)}
                              className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between border ${
                                isSelected
                                  ? 'bg-[#387bf0]/20 border-[#387bf0] text-white shadow-sm shadow-[#387bf0]/20'
                                  : 'bg-[#2B313A] border-[#363D47] hover:border-[#387bf0]/40 text-[#848E9C] hover:text-[#EAECEF]'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-6 h-6 rounded-lg bg-[#181A20] flex items-center justify-center text-[10px] font-bold text-[#F0B90B] shrink-0">
                                  {u.name ? u.name[0].toUpperCase() : 'U'}
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-[#EAECEF] truncate flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    <span className="text-[10px] font-mono text-[#F0B90B] font-normal">
                                      ${(u.balance ?? 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-[#848E9C] truncate">
                                    {u.email}
                                  </div>
                                </div>
                              </div>

                              {isSelected ? (
                                <span className="p-1 rounded-full bg-[#0ECB81]/20 text-[#0ECB81] shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181A20] text-[#848E9C] shrink-0 hover:text-[#387bf0]">
                                  Select
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: Dropdown Select List */}
                {userSelectMode === 'dropdown' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={selectedUserEmail}
                        onChange={(e) => setSelectedUserEmail(e.target.value)}
                        className="w-full glass-input text-xs font-mono py-2 pl-3 pr-8 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47] appearance-none cursor-pointer"
                        required={recipientType === 'direct'}
                      >
                        <option value="" className="bg-[#1E2329] text-[#848E9C]">
                          -- Choose Investor ({activeInvestors.length} available) --
                        </option>
                        {activeInvestors.map((u) => (
                          <option key={u.id} value={u.email} className="bg-[#1E2329] text-[#EAECEF] py-2">
                            {u.name} • {u.email} (Bal: ${(u.balance ?? 0).toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#848E9C] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* MODE 3: Manual Direct Email Input */}
                {userSelectMode === 'manual' && (
                  <div>
                    <input
                      type="email"
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      placeholder="e.g. investor@vanceholdings.com"
                      className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                      required={recipientType === 'direct'}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Alert Priority / Type */}
            <div>
              <label className="block text-[11px] font-mono text-[#848E9C] mb-1.5">
                Priority & Tone
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'announcement', label: 'Broadcast', color: 'text-[#F0B90B]' },
                  { id: 'info', label: 'Info', color: 'text-[#387bf0]' },
                  { id: 'alert', label: 'Alert', color: 'text-[#F0B90B]' },
                  { id: 'success', label: 'Success', color: 'text-[#0ECB81]' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono capitalize transition-all border ${
                      type === item.id
                        ? 'bg-[#2B313A] border-[#F0B90B]/50 font-bold ' + item.color
                        : 'bg-[#2B313A]/50 border-[#363D47] text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                Sender Signature
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Chief Risk Officer"
                className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Settlement Confirmation & Security Notice"
                className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border-[#363D47]"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                Detailed Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose the announcement or direct message to the user..."
                rows={4}
                className="w-full glass-input text-xs font-sans py-2 px-3 rounded-lg resize-none text-[#EAECEF] bg-[#2B313A] border-[#363D47]"
                required
              />
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                    : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0ECB81]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#F6465D]" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-lg btn-binance font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#F0B90B]/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Transmitting Dispatch...' : 'Dispatch Message Now'}</span>
            </button>
          </form>
        </div>

        {/* Right: Message Outbox History */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2B313A]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#F0B90B]" />
              <h3 className="text-sm font-semibold text-[#EAECEF]">Platform Dispatch Ledger</h3>
            </div>
            <span className="text-xs font-mono text-[#848E9C]">{notifications.length} dispatched</span>
          </div>

          <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-[#363D47]">
            {loading ? (
              <div className="p-8 text-center text-[#848E9C] font-mono text-xs">
                Loading communication history...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#848E9C] font-mono text-xs">
                No notification broadcasts sent yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-lg bg-[#2B313A] border border-[#363D47] hover:border-[#F0B90B]/30 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          n.type === 'announcement'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            : n.type === 'alert'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            : n.type === 'success'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                            : 'bg-[#387bf0]/15 text-[#387bf0] border border-[#387bf0]/30'
                        }`}
                      >
                        {n.type}
                      </span>

                      {n.targetEmail ? (
                        <span className="text-[11px] font-mono text-[#387bf0] flex items-center gap-1 bg-[#387bf0]/10 px-2 py-0.5 rounded border border-[#387bf0]/30">
                          <UserIcon className="w-3 h-3" />
                          {n.targetEmail}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 bg-[#181A20] px-2 py-0.5 rounded border border-[#363D47]">
                          <Users className="w-3 h-3 text-[#F0B90B]" />
                          All Platform Investors
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#848E9C]">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        className="p-1 rounded-lg text-[#848E9C] hover:text-[#F6465D] hover:bg-[#F6465D]/10 transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#EAECEF] mb-1">{n.title}</h4>
                    <p className="text-xs text-[#848E9C] leading-relaxed font-sans">{n.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] pt-1 border-t border-[#363D47]">
                    <span>Sender: <strong className="text-[#EAECEF]">{n.sender}</strong></span>
                    <span>Read by: {n.readBy?.length || 0} user{n.readBy?.length === 1 ? '' : 's'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

