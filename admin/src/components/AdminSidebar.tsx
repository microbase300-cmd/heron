import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  Sliders,
  ExternalLink,
  Wallet,
  Bell
} from 'lucide-react';

export type AdminTab = 'metrics' | 'users' | 'transactions' | 'wallets' | 'notifications' | 'investments' | 'plans';

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
    <aside className="w-full md:w-64 bg-[#090c0c]/90 md:border-r border-white/[0.08] p-4 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto shrink-0">
      <div className="space-y-6 w-full">
        {/* Navigation List */}
        <nav className="flex md:flex-col gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-gold/15 text-gold border border-gold/30 shadow-md shadow-gold/5'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-gold' : 'text-white/40'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cross-Link to Investor Portal and Marketing Site */}
      <div className="hidden md:block pt-6 border-t border-white/[0.08] space-y-2">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-white/50 hover:text-white transition-all font-mono"
        >
          <span>Investor Portal (5173)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-white/50 hover:text-white transition-all font-mono"
        >
          <span>Public Web (3000)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
