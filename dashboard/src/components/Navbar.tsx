import React from 'react';
import { Plus, ArrowDownLeft, Menu, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  currentTab: string;
  user: User | null;
  onOpenDeposit: () => void;
  onOpenInvest: () => void;
  onOpenMobileNav?: () => void;
  onOpenProfile?: () => void;
  onRefreshData?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Portfolio Intelligence', subtitle: 'Real-time capital valuation and accrued programmatic yield' },
  mandates: { title: 'Active Investments', subtitle: 'Live cryptographic timelocks and scheduled maturity releases' },
  invest: { title: 'Deploy Capital', subtitle: 'Select an institutional investment tier with guaranteed return parameters' },
  deposit: { title: 'Multi-Asset Liquidity Hub', subtitle: 'Deposit BTC, ETH, USDT (TRC-20 / ERC-20), or SOL' },
  withdraw: { title: 'Disbursement Terminal', subtitle: 'Automated direct-to-wallet withdrawal pipeline' },
  referrals: { title: 'Partner Affiliate Network', subtitle: 'Earn up to 30% instant commission on referred client allocations' },
  ledger: { title: 'Cryptographic Audit Ledger', subtitle: 'Immutable transaction records and smart contract proofs' },
  profile: { title: 'Account Intelligence & Security', subtitle: 'Identity verification, multi-factor cryptographic security, and whitelisted destinations' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  user,
  onOpenDeposit,
  onOpenInvest,
  onOpenMobileNav,
  onOpenProfile,
  onRefreshData
}) => {
  const meta = TAB_TITLES[currentTab] || TAB_TITLES.overview;

  return (
    <header className="h-16 md:h-20 border-b border-[#2B313A] bg-[#181A20]/95 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3" style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
        {/* Mobile Hamburger Menu Toggle */}
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="p-2 rounded-lg bg-[#2B313A] border border-[#363D47] text-[#848E9C] hover:text-[#EAECEF] md:hidden transition-all"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#F0B90B]" />
          </button>
        )}

        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-sans font-bold text-[#EAECEF] tracking-tight flex items-center gap-2 md:gap-3">
            <span>{meta.title}</span>
            <span className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse"></span>
              Live Sync
            </span>
          </h1>
          <p className="hidden sm:block text-xs text-[#848E9C] font-sans mt-0.5">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Account & Security Profile Quick Access */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B]'
                : 'bg-[#2B313A] border-[#363D47] hover:border-[#F0B90B]/50 text-[#848E9C] hover:text-[#EAECEF]'
            }`}
            title="Account & Security Center"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        {/* Real-time Notification Center */}
        <NotificationCenter onNotificationRead={onRefreshData} />

        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] hover:border-[#F0B90B]/40 text-[11px] sm:text-xs font-semibold text-[#EAECEF] transition-all shadow-sm active:scale-95"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F0B90B]" />
          <span className="hidden xs:inline">Add</span> Liquidity
        </button>

        <button
          onClick={onOpenInvest}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] text-[11px] sm:text-xs font-bold tracking-wide transition-all shadow-md shadow-[#F0B90B]/15 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>New Investment</span>
        </button>
      </div>
    </header>
  );
};
