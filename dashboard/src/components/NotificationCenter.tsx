import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Megaphone,
  Mail,
  ShieldAlert,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { NotificationMessage } from '../types';
import { api } from '../services/api';

interface NotificationCenterProps {
  onNotificationRead?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Modals state
  const [selectedNotification, setSelectedNotification] = useState<NotificationMessage | null>(null);
  const [priorityPopUp, setPriorityPopUp] = useState<NotificationMessage | null>(null);
  const seenPopupsRef = useRef<Set<string>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);

        // Check for urgent unread Alert or Success messages for automatic pop-up
        const urgentNotif = res.notifications.find(
          (n: NotificationMessage) =>
            !n.isRead &&
            (n.type === 'alert' || n.type === 'success' || n.type === 'warning') &&
            !seenPopupsRef.current.has(n.id)
        );

        if (urgentNotif && !priorityPopUp) {
          seenPopupsRef.current.add(urgentNotif.id);
          setPriorityPopUp(urgentNotif);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s for real-time deposit/withdrawal alerts
    return () => clearInterval(interval);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
      }
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleOpenMessageDetail = (notification: NotificationMessage) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleAcknowledgePopUp = async () => {
    if (priorityPopUp) {
      await handleMarkAsRead(priorityPopUp.id);
      setPriorityPopUp(null);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#0ECB81]" />;
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-[#F6465D]" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[#F0B90B]" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#F0B90B]" />;
      case 'info':
      default:
        return <Sparkles className="w-4 h-4 text-[#387bf0]" />;
    }
  };

  const getTypeBadge = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'announcement':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 font-bold">Broadcast</span>;
      case 'alert':
      case 'warning':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30 font-bold">Alert</span>;
      case 'success':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 font-bold">Success</span>;
      case 'info':
      default:
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2B313A] text-[#848E9C] border border-[#363D47] font-semibold">Direct</span>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 sm:p-2.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] hover:border-[#F0B90B]/40 text-[#848E9C] hover:text-[#EAECEF] transition-all cursor-pointer"
        aria-label="Notification Center"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#EAECEF]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F6465D] text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-[#181A20] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu / Center */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[92vw] sm:w-[420px] max-w-[440px] bg-[#1E2329] border border-[#2B313A] rounded-2xl shadow-2xl z-50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#2B313A] bg-[#181A20] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#EAECEF]">Communications Center</h3>
                <p className="text-[11px] text-[#848E9C]">
                  {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#F0B90B] hover:text-[#FCD535] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 transition-all font-bold cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-[#181A20] border-b border-[#2B313A] flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#F0B90B] text-[#181A20]'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#F0B90B] text-[#181A20]'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2B313A] scrollbar-thin scrollbar-thumb-[#2B313A]">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-[#848E9C] text-xs font-mono">
                Loading communications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#181A20] border border-[#2B313A] flex items-center justify-center mx-auto mb-3 text-[#848E9C]">
                  <Info className="w-6 h-6" />
                </div>
                <p className="text-xs text-[#EAECEF] font-semibold">No {filter === 'unread' ? 'unread ' : ''}messages</p>
                <p className="text-[11px] text-[#848E9C] mt-1">Platform updates, direct communications, and settlement confirmations will appear here.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleOpenMessageDetail(notification)}
                  className={`p-4 transition-all hover:bg-[#181A20] cursor-pointer group ${
                    !notification.isRead ? 'bg-[#F0B90B]/5 border-l-2 border-[#F0B90B]' : 'opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#181A20] border border-[#2B313A] shrink-0 mt-0.5 group-hover:border-[#F0B90B]/40 transition-all">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-[#EAECEF] truncate group-hover:text-[#F0B90B] transition-colors">
                          {notification.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#848E9C] shrink-0">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-[#848E9C] line-clamp-2 leading-relaxed break-words font-sans">
                        {notification.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {getTypeBadge(notification.type)}
                          <span className="text-[10px] font-mono text-[#848E9C]">
                            {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-[#F0B90B] group-hover:text-[#FCD535] flex items-center gap-1 transition-colors font-semibold">
                          <span>Read Full Message</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1. AUTOMATIC POP-UP MODAL FOR URGENT ALERTS */}
      {priorityPopUp && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg mx-auto my-auto rounded-2xl bg-[#1E2329] border border-[#F0B90B]/50 p-6 sm:p-8 shadow-2xl shadow-black">
            {/* Header Crest */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2B313A]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
                  priorityPopUp.type === 'alert' || priorityPopUp.type === 'warning'
                    ? 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
                    : 'bg-[#0ECB81]/15 border-[#0ECB81]/40 text-[#0ECB81]'
                }`}>
                  {priorityPopUp.type === 'alert' || priorityPopUp.type === 'warning' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F0B90B] font-bold">
                      HERON ASSETS TRUSTEE DISPATCH
                    </span>
                    {getTypeBadge(priorityPopUp.type)}
                  </div>
                  <h3 className="text-base font-sans font-bold text-[#EAECEF] mt-0.5 tracking-tight">
                    {priorityPopUp.type === 'alert' ? 'Security & Settlement Alert' : 'Operational Update'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setPriorityPopUp(null)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body Box */}
            <div className="py-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A]">
                <h4 className="text-sm font-bold text-[#EAECEF] mb-2 font-sans tracking-tight">
                  {priorityPopUp.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#848E9C] leading-relaxed font-sans whitespace-pre-wrap">
                  {priorityPopUp.message}
                </p>
              </div>

              {/* Sender & Timestamp Info */}
              <div className="flex items-center justify-between text-xs font-mono text-[#848E9C] px-1">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#F0B90B]" />
                  <span>Authorized By: <strong className="text-[#EAECEF]">{priorityPopUp.sender || 'Executive Risk Desk'}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(priorityPopUp.createdAt).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#2B313A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPriorityPopUp(null)}
                className="px-4 py-2.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleAcknowledgePopUp}
                className="px-6 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Acknowledge & Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEDICATED MESSAGE BOX MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg mx-auto my-auto rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2B313A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                  <Mail className="w-5 h-5 text-[#F0B90B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F0B90B] font-bold">
                      OFFICIAL DISPATCH
                    </span>
                    {getTypeBadge(selectedNotification.type)}
                  </div>
                  <h3 className="text-sm font-sans font-bold text-[#EAECEF] mt-0.5 tracking-tight">
                    Executive Communication Box
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <div className="py-6 space-y-4">
              <div className="p-5 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-3">
                <h4 className="text-base font-sans font-bold text-[#EAECEF] leading-snug tracking-tight">
                  {selectedNotification.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#848E9C] leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Message Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#848E9C] p-3 rounded-xl bg-[#181A20] border border-[#2B313A]">
                <div>
                  <span className="text-[#848E9C] block text-[10px]">DISPATCHED BY</span>
                  <span className="text-[#EAECEF] font-bold">{selectedNotification.sender || 'Chief Risk Officer'}</span>
                </div>
                <div>
                  <span className="text-[#848E9C] block text-[10px]">TIME / DATE</span>
                  <span className="text-[#EAECEF] font-bold">{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#848E9C] block text-[10px]">COMMUNICATION TYPE</span>
                  <span className="text-[#F0B90B] font-bold uppercase">{selectedNotification.type}</span>
                </div>
                <div>
                  <span className="text-[#848E9C] block text-[10px]">STATUS</span>
                  <span className="text-[#0ECB81] font-bold">Verified & Logged</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#2B313A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-6 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 cursor-pointer active:scale-95"
              >
                Close Message Box
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
