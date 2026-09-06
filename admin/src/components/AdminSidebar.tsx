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
  UserCheck
} from 'lucide-react';

export type AdminTab = 'metrics' | 'investor_portfolios' | 'users' | 'transactions' | 'wallets' | 'notifications' | 'investments' | 'plans';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'metrics', label: 'Platform Executive', icon: LayoutDashboard },
    { id: 'investor_portfolios', label: 'Investor Portfolios', icon: UserCheck },
    { id: 'users', label: 'User Directory', icon: Users },
    {
      id: 'transactions',
      label: 'Settlement Ledger',
      icon: CreditCard,
      badge: pendingCount > 0 ? pendingCount : undefined,
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
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#1E2329]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cross-Link to Investor Portal and Marketing Site */}
      <div className="hidden md:block pt-6 border-t border-[#2B313A] space-y-2">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs text-[#848E9C] hover:text-[#EAECEF] transition-all font-mono"
        >
          <span>Investor Portal (5173)</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#848E9C]" />
        </a>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs text-[#848E9C] hover:text-[#EAECEF] transition-all font-mono"
        >
          <span>Public Web (3000)</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#848E9C]" />
        </a>
      </div>
    </aside>
  );
};

