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
    <header className="h-16 border-b border-[#2B313A] bg-[#181A20]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Clearance Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 text-[#F0B90B] shadow-sm shadow-[#F0B90B]/20">
          <Shield className="w-5 h-5 text-[#F0B90B]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-[#EAECEF] text-sm sm:text-base tracking-tight">
              HERON EXECUTIVE
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

      {/* Right Controls: Refresh, Status, Admin Badge, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
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
          <span>Engine Live • 10s</span>
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

