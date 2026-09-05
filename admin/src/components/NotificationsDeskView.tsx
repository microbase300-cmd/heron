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
  Check
} from 'lucide-react';
import { NotificationMessage, AdminUser } from '../types';
import { adminApi } from '../services/api';

interface NotificationsDeskViewProps {
  users: AdminUser[];
}

export const NotificationsDeskView: React.FC<NotificationsDeskViewProps> = ({ users: initialUsers }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [investorList, setInvestorList] = useState<AdminUser[]>(initialUsers || []);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [recipientType, setRecipientType] = useState<'broadcast' | 'direct'>('broadcast');
  const [userSelectMode, setUserSelectMode] = useState<'dropdown' | 'manual'>('dropdown');
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

      if (notifs.status === 'fulfilled') {
        setNotifications(notifs.value);
      }
      if (userDirectory.status === 'fulfilled') {
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
    if (initialUsers && initialUsers.length > 0) {
      setInvestorList(initialUsers);
    }
  }, [initialUsers]);

  const activeInvestors = investorList.filter(u => u.role !== 'admin');
  const filteredInvestors = activeInvestors.filter(u => {
    const term = investorSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term)
    );
  });

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
      if (recipientType === 'direct' && userSelectMode === 'dropdown') {
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
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold" />
            Executive Communications & Notification Center
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Broadcast platform-wide updates or dispatch encrypted direct messages to client dashboards.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Send className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-semibold text-white">Compose Dispatch</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Recipient Audience Selector */}
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1.5">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('broadcast')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono transition-all border ${
                    recipientType === 'broadcast'
                      ? 'bg-gold/20 text-gold border-gold/40 font-bold'
                      : 'bg-white/[0.03] text-white/60 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast (All Users)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('direct')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono transition-all border ${
                    recipientType === 'direct'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-white/[0.03] text-white/60 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Direct to Investor</span>
                </button>
              </div>
            </div>

            {/* Direct Investor Selection Area */}
            {recipientType === 'direct' && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    Target Investor Selection ({activeInvestors.length} Available)
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setUserSelectMode('dropdown')}
                      className={`px-2 py-0.5 rounded ${userSelectMode === 'dropdown' ? 'bg-cyan-500/30 text-cyan-200' : 'text-white/40'}`}
                    >
                      Picker
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSelectMode('manual')}
                      className={`px-2 py-0.5 rounded ${userSelectMode === 'manual' ? 'bg-cyan-500/30 text-cyan-200' : 'text-white/40'}`}
                    >
                      Manual Email
                    </button>
                  </div>
                </div>

                {userSelectMode === 'dropdown' ? (
                  <div className="space-y-2">
                    {/* Search filter for investor picker */}
                    <div className="relative">
                      <input
                        type="text"
                        value={investorSearch}
                        onChange={(e) => setInvestorSearch(e.target.value)}
                        placeholder="Search investor by name or email..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs font-mono text-white"
                      />
                      <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-2.5" />
                    </div>

                    {/* Investor Dropdown */}
                    <select
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl bg-[#0c1412] border-cyan-500/40"
                      required={recipientType === 'direct'}
                    >
                      <option value="">-- Choose Investor ({filteredInvestors.length} shown) --</option>
                      {filteredInvestors.map((u) => (
                        <option key={u.id} value={u.email}>
                          {u.name} • {u.email} (Bal: ${u.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <input
                      type="email"
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      placeholder="e.g. investor@example.com"
                      className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
                      required={recipientType === 'direct'}
                    />
                  </div>
                )}

                {selectedUserEmail && (
                  <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Recipient Set: <strong>{selectedUserEmail}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Alert Priority / Type */}
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1.5">
                Priority & Tone
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'announcement', label: 'Broadcast', color: 'text-gold' },
                  { id: 'info', label: 'Info', color: 'text-cyan-400' },
                  { id: 'alert', label: 'Alert', color: 'text-amber-400' },
                  { id: 'success', label: 'Success', color: 'text-emerald-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono capitalize transition-all border ${
                      type === item.id
                        ? 'bg-white/[0.1] border-white/30 font-bold ' + item.color
                        : 'bg-white/[0.02] border-white/[0.05] text-white/50 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1">
                Sender Signature
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Chief Risk Officer"
                className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Settlement Confirmation & Security Alert"
                className="w-full glass-input text-xs font-mono py-2 px-3 text-white rounded-xl"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1">
                Detailed Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose the announcement or direct message to the user..."
                rows={4}
                className="w-full glass-input text-xs font-sans py-2 px-3 text-white rounded-xl resize-none text-white"
                required
              />
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Transmitting Dispatch...' : 'Dispatch Message Now'}</span>
            </button>
          </form>
        </div>

        {/* Right: Message Outbox History */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold text-white">Platform Dispatch Ledger</h3>
            </div>
            <span className="text-xs font-mono text-white/50">{notifications.length} dispatched</span>
          </div>

          <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="p-8 text-center text-white/40 font-mono text-xs">
                Loading communication history...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40 font-mono text-xs">
                No notification broadcasts sent yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          n.type === 'announcement'
                            ? 'bg-gold/20 text-gold border border-gold/30'
                            : n.type === 'alert'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : n.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {n.type}
                      </span>

                      {n.targetEmail ? (
                        <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                          <UserIcon className="w-3 h-3" />
                          {n.targetEmail}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-white/70 flex items-center gap-1 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                          <Users className="w-3 h-3 text-gold" />
                          All Platform Investors
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/40">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        className="p-1 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{n.title}</h4>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{n.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1 border-t border-white/[0.04]">
                    <span>Sender: <strong className="text-white/70">{n.sender}</strong></span>
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
