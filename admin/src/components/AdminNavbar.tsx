import { LogOut, RefreshCw, Sparkles, Headphones, Radio, Mail } from 'lucide-react';
import { AdminUser } from '../types';
import { AdminTab } from './AdminSidebar';

interface AdminNavbarProps {
  user: AdminUser;
  onLogout: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onNavigateTab?: (tab: AdminTab) => void;
  waitingSupportCount?: number;
  onlineVisitorCount?: number;
  unreadEmailCount?: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  user,
  onLogout,
  onRefresh,
  refreshing,
  onNavigateTab,
  waitingSupportCount = 0,
  onlineVisitorCount = 0,
  unreadEmailCount = 0,
}) => {
  return (
    <header className="h-16 border-b border-[#2B313A] bg-[#181A20]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Clearance Indicator */}
      <div className="flex items-center gap-3">
        <img
          src="/heron_logo.jpg"
          alt="Heron Assets Trustee"
          className="w-9 h-9 rounded-full object-cover border border-[#F0B90B]/50 shadow-md shadow-[#F0B90B]/20"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-[#EAECEF] text-sm sm:text-base tracking-tight">
              HERON ASSETS TRUSTEE
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30 uppercase font-semibold">
              Restricted Area
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#848E9C] hidden sm:block">
            Settlement & Escrow Control Center
          </div>
        </div>
      </div>

      {/* Right Controls: Live Chat Button, Refresh, Status, Admin Badge, Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('live_support')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shadow-sm ${
              waitingSupportCount > 0
                ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/60 animate-pulse shadow-[#F6465D]/20'
                : 'bg-[#F0B90B]/15 text-[#F0B90B] hover:bg-[#F0B90B]/25 border-[#F0B90B]/40 shadow-[#F0B90B]/10'
            }`}
            title="Open Live Support Desk & Visitor Chats"
          >
            <Headphones className="w-4 h-4" />
            <span className="font-sans font-bold">Live Support (Chat)</span>
            {waitingSupportCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F6465D] text-white text-[10px] font-mono">
                {waitingSupportCount} waiting
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span>
            )}
          </button>
        )}

        {/* Institutional Webmail Button in Navbar */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('webmail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shadow-sm ${
              unreadEmailCount > 0
                ? 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/60 animate-pulse'
                : 'bg-[#1E2329] hover:bg-[#2B313A] border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF]'
            }`}
            title="Open Institutional Webmail (support@heronassetstrusteess.com)"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Webmail</span>
            {unreadEmailCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#F0B90B] text-[#181A20] text-[10px] font-mono font-black">
                {unreadEmailCount}
              </span>
            )}
          </button>
        )}

        {/* Live Visitor Radar Button in Navbar */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('visitors')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0ECB81]/10 hover:bg-[#0ECB81]/20 border border-[#0ECB81]/30 text-xs font-mono text-[#0ECB81] font-bold transition-all shadow-sm"
            title="Open Live Visitor Radar"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Radar:</span>
            <span>{onlineVisitorCount > 0 ? `${onlineVisitorCount} Live` : 'Radar'}</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all disabled:opacity-40"
          title="Refresh Operations Data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#F0B90B]' : ''}`} />
        </button>

        {/* Live System Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-[11px] font-mono text-[#0ECB81]">
          <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span>
          <span>Engine Live</span>
        </div>

        {/* Executive Profile Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#2B313A]">
          <div className="w-8 h-8 rounded-full bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center text-xs font-sans font-black text-[#F0B90B]">
            {user.name.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-sans font-bold text-[#EAECEF] leading-tight">{user.name}</div>
            <div className="text-[10px] font-mono text-[#F0B90B] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {user.role.toUpperCase()}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-[#F6465D]/10 hover:bg-[#F6465D]/20 border border-[#F6465D]/30 text-[#F6465D] transition-all ml-1"
            title="Terminate Executive Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
