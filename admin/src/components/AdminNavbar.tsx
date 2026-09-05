import React from 'react';
import { Shield, LogOut, RefreshCw, Sparkles } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminNavbarProps {
  user: AdminUser;
  onLogout: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  user,
  onLogout,
  onRefresh,
  refreshing,
}) => {
  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#090c0c]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Clearance Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 text-gold shadow-sm shadow-gold/20">
          <Shield className="w-5 h-5 text-gold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white text-sm sm:text-base tracking-wide">
              HERON EXECUTIVE
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/30 uppercase font-semibold">
              Restricted Area
            </span>
          </div>
          <div className="text-[10px] font-mono text-white/40 hidden sm:block">
            Settlement & Escrow Control Center
          </div>
        </div>
      </div>

      {/* Right Controls: Refresh, Status, Admin Badge, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-40"
          title="Refresh Operations Data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-gold' : ''}`} />
        </button>

        {/* Live System Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-[11px] font-mono text-emerald-glow">
          <span className="w-2 h-2 rounded-full bg-emerald-glow animate-pulse"></span>
          <span>Engine Live • 10s</span>
        </div>

        {/* Executive Profile Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-serif font-bold text-gold">
            {user.name.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-serif font-bold text-white leading-tight">{user.name}</div>
            <div className="text-[10px] font-mono text-gold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {user.role.toUpperCase()}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-300 transition-all ml-1"
            title="Terminate Executive Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
