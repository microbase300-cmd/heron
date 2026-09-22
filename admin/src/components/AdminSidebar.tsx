import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  Sliders,
  ExternalLink,
  Wallet,
  Bell,
  UserCheck,
  ShieldCheck,
  Headphones,
  Radio
} from 'lucide-react';

export type AdminTab = 'metrics' | 'visitors' | 'live_support' | 'transactions' | 'investor_portfolios' | 'users' | 'kyc' | 'wallets' | 'notifications' | 'investments' | 'plans';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingCount: number;
  pendingKycCount?: number;
  waitingSupportCount?: number;
  onlineVisitorCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  pendingKycCount = 0,
  waitingSupportCount = 0,
  onlineVisitorCount = 0,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string; isSpecial?: boolean }[] = [
    { id: 'metrics', label: 'Platform Executive', icon: LayoutDashboard },
    {
      id: 'visitors',
      label: 'Live Visitor Radar',
      icon: Radio,
      badge: onlineVisitorCount > 0 ? onlineVisitorCount : undefined,
      badgeColor: 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40',
      isSpecial: true,
    },
    {
      id: 'live_support',
      label: 'Live Support Desk (Chat)',
      icon: Headphones,
      badge: waitingSupportCount > 0 ? waitingSupportCount : undefined,
      badgeColor: 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40',
      isSpecial: true,
    },
    {
      id: 'transactions',
      label: 'Settlement Ledger',
      icon: CreditCard,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'investor_portfolios', label: 'Investor Portfolios', icon: UserCheck },
    { id: 'users', label: 'User Directory', icon: Users },
    {
      id: 'kyc',
      label: 'KYC & Compliance Desk',
      icon: ShieldCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
    },
    { id: 'wallets', label: 'Deposit Wallets', icon: Wallet },
    { id: 'notifications', label: 'Broadcasts & Messages', icon: Bell },
    { id: 'investments', label: 'Escrow Investments', icon: Layers },
    { id: 'plans', label: 'Plan Parameters', icon: Sliders },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#181A20] md:border-r border-[#2B313A] p-4 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto shrink-0">
      <div className="space-y-6 w-full">
        {/* Navigation List */}
        <nav className="flex md:flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 shadow-sm shadow-[#F0B90B]/10 font-bold'
                    : item.isSpecial && waitingSupportCount > 0
                    ? 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/40 animate-pulse font-bold'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#1E2329]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#F0B90B]' : item.isSpecial ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge !== undefined ? (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    item.badgeColor ? `${item.badgeColor} animate-pulse` : 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40'
                  }`}>
                    {item.badge}
                  </span>
                ) : item.isSpecial ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse"></span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cross-Link to Investor Portal and Marketing Site */}
      <div className="hidden md:block pt-6 border-t border-[#2B313A] space-y-2">
        <a
          href="https://app.heronassetstrusteess.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs text-[#848E9C] hover:text-[#EAECEF] transition-all font-mono"
        >
          <span>Investor Portal ↗</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#848E9C]" />
        </a>
        <a
          href="https://heronassetstrusteess.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs text-[#848E9C] hover:text-[#EAECEF] transition-all font-mono"
        >
          <span>Public Website ↗</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#848E9C]" />
        </a>
      </div>
    </aside>
  );
};
