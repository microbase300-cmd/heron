import React, { useState } from 'react';
import {
  Layers,
  Clock,
  CheckCircle2,
  Zap,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Investment } from '../types';

interface EscrowMandatesViewProps {
  investments: Investment[];
  onRefreshInvestments: () => void;
  onSelectInvestor?: (userId: string) => void;
}

export const EscrowMandatesView: React.FC<EscrowMandatesViewProps> = ({
  investments,
  onRefreshInvestments,
  onSelectInvestor,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'matured' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshInvestments();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const maturedInvestments = investments.filter((i) => i.status === 'matured');
  const completedInvestments = investments.filter((i) => i.status === 'completed');
  const cancelledInvestments = investments.filter((i) => i.status === 'cancelled');

  const totalEscrowCapital = activeInvestments.reduce((acc, i) => acc + i.amount, 0);
  const totalMaturedCapital = maturedInvestments.reduce((acc, i) => acc + i.totalPayout, 0);
  const totalDisbursedPayouts = completedInvestments.reduce((acc, i) => acc + i.totalPayout, 0);

  const filteredInvestments = investments.filter((inv) => {
    // Tab Filter
    let matchesTab = true;
    if (selectedTab === 'matured') matchesTab = inv.status === 'matured';
    else if (selectedTab === 'active') matchesTab = inv.status === 'active';
    else if (selectedTab === 'completed') matchesTab = inv.status === 'completed';
    else if (selectedTab === 'cancelled') matchesTab = inv.status === 'cancelled';

    // Search Filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(term) ||
      inv.userId.toLowerCase().includes(term) ||
      inv.planName.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-[#F0B90B]" />
            Platform Escrow Ledger & Compounding Architecture
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Platform-wide institutional ledger tracking active locked capital, accrued returns, and historical settlements across all investors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] border border-[#2B313A] transition-all disabled:opacity-50"
            title="Refresh Escrow Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F0B90B]' : ''}`} />
          </button>

          {onSelectInvestor && (
            <button
              onClick={() => onSelectInvestor('')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg btn-binance text-xs font-mono font-bold transition-all shadow-md"
            >
              <span>Manage Investor Plans ↗</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-1">
          <div className="text-[#848E9C] text-[11px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>Active Locked in Escrow</span>
          </div>
          <div className="text-xl font-sans font-bold text-[#EAECEF] tracking-tight">
            ${totalEscrowCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C]">{activeInvestments.length} contracts generating yield</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#F0B90B]/30 bg-[#1E2329] space-y-1">
          <div className="text-[#F0B90B] text-[11px] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F0B90B] animate-pulse" />
            <span>Matured Settlement Queue</span>
          </div>
          <div className="text-xl font-sans font-bold text-[#F0B90B] tracking-tight">
            ${totalMaturedCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C]">{maturedInvestments.length} contracts awaiting disbursement</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#0ECB81]/30 bg-[#1E2329] space-y-1">
          <div className="text-[#0ECB81] text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81]" />
            <span>Lifetime Disbursed Payouts</span>
          </div>
          <div className="text-xl font-sans font-bold text-[#0ECB81] tracking-tight">
            +${totalDisbursedPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#848E9C]">{completedInvestments.length} settled & credited contracts</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#1E2329] border border-[#2B313A] overflow-x-auto">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
            }`}
          >
            All ({investments.length})
          </button>

          <button
            onClick={() => setSelectedTab('matured')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === 'matured'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : maturedInvestments.length > 0
                ? 'text-[#F0B90B] bg-[#F0B90B]/15 border border-[#F0B90B]/40'
                : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Matured Queue ({maturedInvestments.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('active')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              selectedTab === 'active'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
            }`}
          >
            Active in Escrow ({activeInvestments.length})
          </button>

          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              selectedTab === 'completed'
                ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
            }`}
          >
            Settled ({completedInvestments.length})
          </button>

          {cancelledInvestments.length > 0 && (
            <button
              onClick={() => setSelectedTab('cancelled')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                selectedTab === 'cancelled'
                  ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-sm'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
              }`}
            >
              Cancelled ({cancelledInvestments.length})
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by contract or user ID..."
            className="w-full glass-input text-xs font-mono py-2 pl-9 pr-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
          />
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="space-y-4">
        {filteredInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInvestments.map((inv) => {
              const isMatured = inv.status === 'matured';
              const isActive = inv.status === 'active';
              const isCompleted = inv.status === 'completed';
              const isCancelled = inv.status === 'cancelled';

              return (
                <div
                  key={inv.id}
                  className={`p-5 rounded-xl glass-panel border transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                    isMatured
                      ? 'border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10 bg-[#1E2329]'
                      : isActive
                      ? 'border-[#2B313A] bg-[#1E2329] hover:border-[#F0B90B]/30'
                      : isCancelled
                      ? 'border-[#F6465D]/30 bg-[#1E2329]'
                      : 'border-[#2B313A] bg-[#1E2329]/60 opacity-80'
                  }`}
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-bold text-[#EAECEF] text-base tracking-tight">{inv.planName}</span>
                      {isMatured && (
                        <span className="text-[10px] font-mono font-bold text-[#F0B90B] px-2.5 py-0.5 rounded-full bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" />
                          MATURED
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold text-[#0ECB81] px-2.5 py-0.5 rounded-full bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ACTIVE ({inv.durationHours}h)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-bold text-[#0ECB81] px-2.5 py-0.5 rounded-full bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          DISBURSED
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-[10px] font-mono font-bold text-[#F6465D] px-2.5 py-0.5 rounded-full bg-[#F6465D]/15 border border-[#F6465D]/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          CANCELLED
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-[#848E9C] mb-3">
                      Contract ID: <span className="text-[#EAECEF]">{inv.id}</span>
                      <br />
                      Investor: <span className="text-[#EAECEF] font-semibold">{inv.userId}</span>
                    </div>

                    {/* Capital & Payout */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                      <div className="p-2.5 rounded-lg bg-[#2B313A] border border-[#363D47]">
                        <div className="text-[#848E9C] text-[10px]">Principal Committed</div>
                        <div className="text-[#EAECEF] font-bold text-sm">${inv.amount.toLocaleString()}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#2B313A] border border-[#0ECB81]/30">
                        <div className="text-[#0ECB81] text-[10px]">Total Payout (With Yield)</div>
                        <div className="text-[#0ECB81] font-bold text-sm">
                          ${inv.totalPayout.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Active / Matured */}
                    {(isActive || isMatured) && (
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[10px] font-mono text-[#848E9C]">
                          <span>Compounding Horizon</span>
                          <span className="text-[#EAECEF]">{isMatured ? '100% Completed' : `${inv.progressPercent || 0}%`}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#2B313A] overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isMatured ? 'bg-[#F0B90B] w-full' : 'bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]'
                            }`}
                            style={{ width: isMatured ? '100%' : `${Math.max(5, inv.progressPercent || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="p-2.5 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/20 text-xs font-mono space-y-1 my-2">
                        <div className="text-[#F6465D] font-bold flex items-center gap-1 text-[10px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Breach Reason:
                        </div>
                        <div className="text-[#EAECEF] italic text-[11px]">
                          "{inv.cancellationReason || 'Rule violation'}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Cross-Link to Investor Management Deck */}
                  <div className="pt-3 border-t border-[#2B313A]">
                    {onSelectInvestor ? (
                      <button
                        onClick={() => onSelectInvestor(inv.userId)}
                        className="w-full py-2 rounded-lg bg-[#2B313A] hover:bg-[#F0B90B]/15 hover:border-[#F0B90B]/40 text-[#848E9C] hover:text-[#F0B90B] border border-[#363D47] text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Manage in Investor Portfolio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-center text-[10px] font-mono text-[#848E9C]">
                        Investor ID: {inv.userId}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-xl bg-[#1E2329] border border-[#2B313A] text-center text-[#848E9C] font-mono text-xs space-y-2">
            <Filter className="w-6 h-6 mx-auto text-[#848E9C]/40" />
            <p>No investment contracts found matching filter.</p>
          </div>
        )}
      </div>

      {/* Completed Ledger Table */}
      {completedInvestments.length > 0 && selectedTab === 'all' && (
        <div className="space-y-3 pt-6 border-t border-[#2B313A]">
          <h3 className="font-mono text-sm font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0ECB81]" />
            Platform Disbursed Settlement Audit ({completedInvestments.length})
          </h3>

          <div className="glass-panel rounded-xl overflow-hidden border border-[#2B313A] bg-[#1E2329]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2B313A]/60 text-[#848E9C] font-mono uppercase border-b border-[#2B313A]">
                <tr>
                  <th className="py-3 px-4">Investment ID</th>
                  <th className="py-3 px-4">Investor User</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Principal Committed</th>
                  <th className="py-3 px-4">Disbursed Payout</th>
                  <th className="py-3 px-4">Settled Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313A]">
                {completedInvestments.map((m) => (
                  <tr key={m.id} className="hover:bg-[#2B313A]/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#EAECEF]">{m.id}</td>
                    <td className="py-3 px-4 font-mono text-[#848E9C]">{m.userId}</td>
                    <td className="py-3 px-4 font-sans font-bold text-[#EAECEF] tracking-tight">{m.planName}</td>
                    <td className="py-3 px-4 font-mono text-[#EAECEF]">${m.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0ECB81]">
                      +${m.totalPayout.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#848E9C]">
                      {m.completedAt ? new Date(m.completedAt).toLocaleString() : 'Settled'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                        DISBURSED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

