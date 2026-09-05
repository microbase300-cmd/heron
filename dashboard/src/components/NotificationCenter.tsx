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
  Megaphone
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
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

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-glow" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-gold" />;
      case 'info':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeBadge = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'announcement':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">Broadcast</span>;
      case 'alert':
      case 'warning':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Alert</span>;
      case 'success':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-glow border border-emerald-500/30">Success</span>;
      case 'info':
      default:
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Direct</span>;
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
        className="relative p-2 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-gold/30 text-white/80 hover:text-white transition-all"
        aria-label="Notification Center"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-[#070908] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu / Center */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[92vw] sm:w-[420px] max-w-[440px] bg-[#0d1210] border border-white/[0.12] rounded-2xl shadow-2xl z-50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <p className="text-[11px] text-white/50">
                  {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-gold hover:text-gold-light flex items-center gap-1 px-2 py-1 rounded-lg bg-gold/10 hover:bg-gold/20 transition-all font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-white/[0.01] border-b border-white/[0.06] flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs font-mono">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3 text-white/30">
                  <Info className="w-6 h-6" />
                </div>
                <p className="text-xs text-white/60 font-medium">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
                <p className="text-[11px] text-white/40 mt-1">Platform updates, direct communications, and settlement confirmations will appear here.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 transition-all hover:bg-white/[0.03] ${
                    !notification.isRead ? 'bg-gold/[0.03] border-l-2 border-gold' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {notification.title}
                        </h4>
                        <span className="text-[10px] font-mono text-white/40 shrink-0">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed break-words">
                        {notification.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {getTypeBadge(notification.type)}
                          <span className="text-[10px] font-mono text-white/40">
                            {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="text-[11px] text-white/50 hover:text-gold flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
