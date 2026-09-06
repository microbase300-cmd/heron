import React from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  ReceiptText, 
  ExternalLink, 
  LogOut, 
  X,
  ChevronRight 
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenDeposit: () => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onLogout,
  onOpenDeposit,
  isMobileOpen = false,
  onClose
}) => {
  const navItems = [
    { id: 'overview', label: 'Portfolio Overview', icon: LayoutDashboard },
    { id: 'mandates', label: 'Active Investments', icon: Timer, badge: 'Live' },
    { id: 'invest', label: 'New Investment', icon: TrendingUp },
    { id: 'deposit', label: 'Deposit Hub', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraw Terminal', icon: ArrowUpRight },
    { id: 'referrals', label: 'Affiliate Network', icon: Users, badge: '30%' },
    { id: 'ledger', label: 'Audit Ledger', icon: ReceiptText },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (onClose) onClose();
  };

  const content = (
    <div className="flex flex-col justify-between h-full select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 md:p-6 border-b border-[#2B313A] flex items-center justify-between">
          <a href="http://localhost:3000" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F0B90B] flex items-center justify-center text-[#181A20] font-sans text-lg font-black shadow-md shadow-[#F0B90B]/20">
              H
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-xs text-[#EAECEF] font-sans">HERON ASSETS</div>
              <div className="text-[9px] tracking-wider uppercase text-[#F0B90B] font-sans font-bold mt-0.5">Binance Pro Engine</div>
            </div>
          </a>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] md:hidden transition-all"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Balance Quick Widget */}
        {user && (
          <div className="px-4 py-3.5 mx-3 my-3 md:mx-4 md:my-4 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/40 transition-all">
            <div className="flex items-center justify-between text-[11px] text-[#848E9C] uppercase font-mono mb-1">
              <span>Available Liquidity</span>
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span>
            </div>
            <div className="text-lg font-sans font-bold text-[#EAECEF] tracking-tight">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button 
                onClick={() => {
                  onOpenDeposit();
                  if (onClose) onClose();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#F0B90B]/15 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Deposit
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active 
                    ? 'bg-[#F0B90B]/10 text-[#F0B90B] border-l-2 border-l-[#F0B90B] font-semibold' 
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#1E2329]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                    active 
                      ? 'bg-[#F0B90B] text-[#181A20]' 
                      : 'bg-[#2B313A] text-[#848E9C] border border-[#363D47]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-[#2B313A] space-y-2.5">
        <a 
          href="http://localhost:3000" 
          className="flex items-center justify-between p-2 rounded-lg text-xs text-[#848E9C] hover:text-[#F0B90B] hover:bg-[#1E2329] transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Public Website</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </a>

        {user && (
          <div className="flex items-center justify-between pt-2 border-t border-[#2B313A] px-2">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-semibold text-[#EAECEF] truncate">{user.name}</div>
              <div className="text-[10px] text-[#848E9C] font-mono truncate">{user.email}</div>
            </div>
            <button 
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#F6465D] hover:bg-[#2B313A] transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-[#181A20] border-r border-[#2B313A] flex-col justify-between shrink-0 h-full z-20">
        {content}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer container */}
          <aside className="relative w-4/5 max-w-xs bg-[#181A20] border-r border-[#2B313A] h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
