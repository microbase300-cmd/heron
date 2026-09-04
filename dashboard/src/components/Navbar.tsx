import React from 'react';
import { ShieldCheck, Plus, ArrowDownLeft, Lock } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  user: User | null;
  onOpenDeposit: () => void;
  onOpenInvest: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Portfolio Intelligence', subtitle: 'Real-time capital valuation and accrued programmatic yield' },
  mandates: { title: 'Active Mandates', subtitle: 'Live cryptographic timelocks and scheduled maturity releases' },
  invest: { title: 'Deploy Capital', subtitle: 'Select an institutional mandate tier with guaranteed return parameters' },
  deposit: { title: 'Multi-Asset Liquidity Hub', subtitle: 'Deposit BTC, ETH, USDT (TRC-20 / ERC-20), or SOL' },
  withdraw: { title: 'Disbursement Terminal', subtitle: 'Automated direct-to-wallet withdrawal pipeline' },
  referrals: { title: 'Partner Affiliate Network', subtitle: 'Earn up to 30% instant commission on referred client allocations' },
  ledger: { title: 'Cryptographic Audit Ledger', subtitle: 'Immutable transaction records and smart contract proofs' }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  user,
  onOpenDeposit,
  onOpenInvest
}) => {
  const meta = TAB_TITLES[currentTab] || TAB_TITLES.overview;

  return (
    <header className="h-20 border-b border-white/[0.08] bg-[#070908]/80 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
        <h1 className="text-xl font-serif font-bold text-white tracking-tight flex items-center gap-3" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'geometricPrecision' }}>
          {meta.title}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-glow border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse"></span>
            Escrow Verified
          </span>
        </h1>
        <p className="text-xs text-white/50">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-gold/30 text-xs font-semibold text-white transition-all shadow-sm"
        >
          <ArrowDownLeft className="w-4 h-4 text-gold" />
          <span>Add Liquidity</span>
        </button>

        <button
          onClick={onOpenInvest}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] text-xs font-bold tracking-wide transition-all shadow-lg shadow-gold/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Mandate</span>
        </button>
      </div>
    </header>
  );
};
