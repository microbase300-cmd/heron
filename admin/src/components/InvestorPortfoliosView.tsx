import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  DollarSign,
  Layers,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  RefreshCw,
  PlusCircle,
  X,
  UserCheck
} from 'lucide-react';
import { AdminUser, Investment } from '../types';
import { adminApi } from '../services/api';

interface InvestorPortfoliosViewProps {
  users: AdminUser[];
  investments: Investment[];
  initialSelectedUserId?: string | null;
  onRefreshData: () => void;
}

const PRESET_BREACH_REASONS = [
  'Breach of Protocol: Multi-account / Sybil activity detected',
  'Compliance Violation: AML / Identity verification discrepancy',
  'Terms of Service Breach: Prohibited automated high-frequency arbitrage',
  'Administrative Action: Contract terminated per risk management policy',
  'Regulatory Disqualification: Jurisdictional restriction compliance',
];

export const InvestorPortfoliosView: React.FC<InvestorPortfoliosViewProps> = ({
  users,
  investments,
  initialSelectedUserId,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialSelectedUserId || (users.length > 0 ? users[0].id : null)
  );
  const [planFilter, setPlanFilter] = useState<'all' | 'matured' | 'active' | 'completed' | 'cancelled'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Balance Adjustment Modal State
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Cancellation Modal State
  const [cancellingInv, setCancellingInv] = useState<Investment | null>(null);
  const [breachReason, setBreachReason] = useState<string>(PRESET_BREACH_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [refundPrincipal, setRefundPrincipal] = useState<boolean>(true);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Filter investors list
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.role !== 'admin' &&
        (u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term) ||
          (u.referralCode && u.referralCode.toLowerCase().includes(term)))
    );
  }, [users, searchTerm]);

  // Selected Investor Object
  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || (filteredUsers.length > 0 ? filteredUsers[0] : null);
  }, [users, selectedUserId, filteredUsers]);

  // Investments belonging to selected investor
  const userInvestments = useMemo(() => {
    if (!selectedUser) return [];
    return investments.filter((i) => i.userId === selectedUser.id);
  }, [investments, selectedUser]);

  const activePlans = userInvestments.filter((i) => i.status === 'active');
  const maturedPlans = userInvestments.filter((i) => i.status === 'matured');
  const completedPlans = userInvestments.filter((i) => i.status === 'completed');
  const cancelledPlans = userInvestments.filter((i) => i.status === 'cancelled');

  const totalEscrowLocked = userInvestments
    .filter((i) => i.status === 'active' || i.status === 'matured')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalYieldAccrued = userInvestments
    .filter((i) => i.status === 'completed' || i.status === 'matured')
    .reduce((sum, i) => sum + i.expectedProfit, 0);

  const filteredUserPlans = userInvestments.filter((inv) => {
    if (planFilter === 'matured') return inv.status === 'matured';
    if (planFilter === 'active') return inv.status === 'active';
    if (planFilter === 'completed') return inv.status === 'completed';
    if (planFilter === 'cancelled') return inv.status === 'cancelled';
    return true;
  });

  const handleDisburse = async (inv: Investment) => {
    const isEarly = inv.status === 'active';
    const confirmMsg = isEarly
      ? `🚨 EARLY DISBURSEMENT OVERRIDE: Disburse payout for ${inv.planName} (ID: ${inv.id}) immediately?\n\nTotal payout of $${inv.totalPayout.toLocaleString()} will be credited to ${selectedUser?.name || inv.userId} and a celebration pop-up alert will be sent.`
      : `✅ CONFIRM DISBURSEMENT: Disburse matured payout for ${inv.planName} (ID: ${inv.id})?\n\nTotal payout of $${inv.totalPayout.toLocaleString()} ($${inv.amount.toLocaleString()} principal + $${inv.expectedProfit.toLocaleString()} yield) will be credited to ${selectedUser?.name || inv.userId}.`;

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(inv.id);
    try {
      const res = await adminApi.disburseInvestment(inv.id);
      alert(`✅ Success: ${res.message}`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to disburse investment payout.');
    } finally {
      setProcessingId(null);
    }
  };

  const openCancelModal = (inv: Investment) => {
    setCancellingInv(inv);
    setBreachReason(PRESET_BREACH_REASONS[0]);
    setCustomReason('');
    setRefundPrincipal(true);
  };

  const handleExecuteCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingInv) return;

    const finalReason = customReason.trim() ? customReason.trim() : breachReason;
    if (!finalReason) {
      alert('Please select or specify a reason for contract cancellation.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const res = await adminApi.cancelInvestment(cancellingInv.id, finalReason, refundPrincipal);
      alert(`⚠️ Investment #${cancellingInv.id} cancelled. ${res.message}`);
      setCancellingInv(null);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel investment.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive numerical amount.');
      return;
    }

    setLoadingBalance(true);
    try {
      const res = await adminApi.adjustUserBalance(
        selectedUser.id,
        amount,
        adjustAction,
        adjustNote || `Executive ${adjustAction === 'credit' ? 'liquidity deposit' : 'debit'}`
      );
      alert(`✅ Balance Updated: ${res.message}`);
      setShowBalanceModal(false);
      setAdjustAmount('');
      setAdjustNote('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update balance.');
    } finally {
      setLoadingBalance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <UserCheck className="w-5 h-5 text-[#F0B90B]" />
            Investor Portfolios & Plan Management
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Granular investor management: inspect individual accounts, settle matured plan yields, override active timelocks, and enforce compliance cancellations.
          </p>
        </div>

        <button
          onClick={onRefreshData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#F0B90B]" />
          <span>Refresh Portfolios</span>
        </button>
      </div>

      {/* Two-Column Layout: Left Investor Directory, Right Investor Dossier & Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Investors Selector (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-xl border border-[#2B313A] bg-[#1E2329] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
              <Users className="w-4 h-4 text-[#F0B90B]" />
              <span>Select Investor ({filteredUsers.length})</span>
            </h3>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full glass-input text-xs font-mono py-2 pl-9 pr-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
            />
          </div>

          {/* Investors Scrollable List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const userPlansCount = investments.filter(
                (i) => i.userId === user.id && (i.status === 'active' || i.status === 'matured')
              ).length;
              const hasMatured = investments.some((i) => i.userId === user.id && i.status === 'matured');

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all relative ${
                    isSelected
                      ? 'bg-[#F0B90B]/15 border-[#F0B90B] shadow-md shadow-[#F0B90B]/10'
                      : 'bg-[#2B313A]/60 hover:bg-[#2B313A] border-[#363D47]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#EAECEF] truncate max-w-[160px]">{user.name}</span>
                    {hasMatured ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40 animate-pulse">
                        MATURED
                      </span>
                    ) : userPlansCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                        {userPlansCount} ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#848E9C]">0 Plans</span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#848E9C] truncate">{user.email}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#848E9C] mt-2 pt-1.5 border-t border-[#363D47]">
                    <span>Balance: ${(user.balance || 0).toLocaleString()}</span>
                    <span className={user.status === 'active' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Investor Details & Dedicated Plans Deck (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedUser ? (
            <>
              {/* Selected Investor Financial Profile Banner */}
              <div className="glass-panel p-6 rounded-xl border border-[#F0B90B]/30 bg-[#1E2329] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B313A] pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C99400] text-[#181A20] font-sans font-black text-lg flex items-center justify-center shadow-lg shadow-[#F0B90B]/20">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-lg font-bold text-[#EAECEF] tracking-tight">{selectedUser.name}</h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            selectedUser.status === 'active'
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30'
                              : 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30'
                          }`}
                        >
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#848E9C]">
                        {selectedUser.email} • ID: <span className="text-[#F0B90B]">{selectedUser.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for this investor */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBalanceModal(true)}
                      className="px-3.5 py-2 rounded-lg btn-binance text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Adjust / Top-Up Balance</span>
                    </button>
                  </div>
                </div>

                {/* 4 Financial Metric Cards for Selected Investor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47]">
                    <div className="text-[#848E9C] text-[10px]">Available Balance</div>
                    <div className="text-base font-sans font-bold text-[#EAECEF] mt-1 tracking-tight">
                      ${(selectedUser.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#F0B90B]/20">
                    <div className="text-[#F0B90B] text-[10px]">Locked In Escrow</div>
                    <div className="text-base font-sans font-bold text-[#F0B90B] mt-1 tracking-tight">
                      ${totalEscrowLocked.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#0ECB81]/20">
                    <div className="text-[#0ECB81] text-[10px]">Accrued Yield Earnings</div>
                    <div className="text-base font-sans font-bold text-[#0ECB81] mt-1 tracking-tight">
                      +${totalYieldAccrued.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47]">
                    <div className="text-[#848E9C] text-[10px]">Investment Plans</div>
                    <div className="text-base font-sans font-bold text-[#EAECEF] mt-1 tracking-tight">
                      {userInvestments.length} Total ({activePlans.length + maturedPlans.length} active)
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Plan Deck for Selected Investor */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-sans text-base font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
                    <Layers className="w-4 h-4 text-[#F0B90B]" />
                    <span>Investment Contracts for {selectedUser.name} ({userInvestments.length})</span>
                  </h3>

                  {/* Plan Status Filter Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1E2329] border border-[#2B313A] text-xs font-mono overflow-x-auto">
                    <button
                      onClick={() => setPlanFilter('all')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        planFilter === 'all' ? 'bg-[#F0B90B] text-[#181A20] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      All ({userInvestments.length})
                    </button>
                    <button
                      onClick={() => setPlanFilter('matured')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        planFilter === 'matured'
                          ? 'bg-[#F0B90B] text-[#181A20] font-bold'
                          : maturedPlans.length > 0
                          ? 'text-[#F0B90B] bg-[#F0B90B]/10'
                          : 'text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      Matured ({maturedPlans.length})
                    </button>
                    <button
                      onClick={() => setPlanFilter('active')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        planFilter === 'active' ? 'bg-[#F0B90B] text-[#181A20] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      Active ({activePlans.length})
                    </button>
                    <button
                      onClick={() => setPlanFilter('completed')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        planFilter === 'completed' ? 'bg-[#F0B90B] text-[#181A20] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      Settled ({completedPlans.length})
                    </button>
                    {cancelledPlans.length > 0 && (
                      <button
                        onClick={() => setPlanFilter('cancelled')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          planFilter === 'cancelled' ? 'bg-[#F0B90B] text-[#181A20] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'
                        }`}
                      >
                        Cancelled ({cancelledPlans.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan Cards Grid for Selected Investor */}
                {filteredUserPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUserPlans.map((inv) => {
                      const isMatured = inv.status === 'matured';
                      const isActive = inv.status === 'active';
                      const isCompleted = inv.status === 'completed';
                      const isCancelled = inv.status === 'cancelled';
                      const isProcessing = processingId === inv.id;

                      return (
                        <div
                          key={inv.id}
                          className={`p-5 rounded-xl glass-panel border transition-all space-y-4 flex flex-col justify-between ${
                            isMatured
                              ? 'border-[#F0B90B] bg-[#1E2329] shadow-lg shadow-[#F0B90B]/10'
                              : isCancelled
                              ? 'border-[#F6465D]/30 bg-[#1E2329]'
                              : isActive
                              ? 'border-[#2B313A] bg-[#1E2329] hover:border-[#F0B90B]/40'
                              : 'border-[#2B313A] bg-[#1E2329]/60 opacity-80'
                          }`}
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-sans font-bold text-[#EAECEF] text-base tracking-tight">{inv.planName}</span>
                              {isMatured && (
                                <span className="text-[10px] font-mono font-bold text-[#F0B90B] px-2.5 py-0.5 rounded-full bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center gap-1 animate-pulse">
                                  <Zap className="w-3 h-3" />
                                  MATURED QUEUE
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
                              Contract ID: <span className="text-[#EAECEF] font-mono">{inv.id}</span>
                            </div>

                            {/* Numbers */}
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

                            {/* Progress bar for active / matured */}
                            {(isActive || isMatured) && (
                              <div className="space-y-1 mb-3">
                                <div className="flex justify-between text-[10px] font-mono text-[#848E9C]">
                                  <span>Maturity Cycle</span>
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

                            {/* Breach Notice if cancelled */}
                            {isCancelled && (
                              <div className="p-3 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/20 text-xs font-mono space-y-1 my-2">
                                <div className="text-[#F6465D] font-bold flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  Breach Reason:
                                </div>
                                <div className="text-[#EAECEF] italic text-[11px]">
                                  "{inv.cancellationReason || 'Rule violation'}"
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Individual Plan Actions (Disburse, Early Settle, Cancel for Rule Breach) */}
                          {(isMatured || isActive) && (
                            <div className="pt-3 border-t border-[#2B313A] space-y-2">
                              <button
                                onClick={() => handleDisburse(inv)}
                                disabled={isProcessing}
                                className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                                  isMatured
                                    ? 'btn-binance'
                                    : 'bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/30'
                                } disabled:opacity-50`}
                              >
                                <Zap className="w-4 h-4" />
                                <span>
                                  {isProcessing
                                    ? 'Processing Payout...'
                                    : isMatured
                                    ? `Disburse Matured Payout ($${inv.totalPayout.toLocaleString()})`
                                    : 'Force Early Settlement'}
                                </span>
                              </button>

                              <button
                                onClick={() => openCancelModal(inv)}
                                disabled={isProcessing}
                                className="w-full py-1.5 rounded-lg bg-[#F6465D]/10 hover:bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/20 text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel Contract (Rule Breach)</span>
                              </button>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="pt-2 border-t border-[#2B313A] flex items-center justify-between text-[11px] font-mono text-[#0ECB81]">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed to Balance
                              </span>
                              <span>+${inv.totalPayout.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass-panel p-10 rounded-xl bg-[#1E2329] border border-[#2B313A] text-center text-[#848E9C] font-mono text-xs space-y-2">
                    <Layers className="w-6 h-6 mx-auto text-[#848E9C]/40" />
                    <p>No investment contracts found matching "{planFilter}" for {selectedUser.name}.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-xl bg-[#1E2329] border border-[#2B313A] text-center text-[#848E9C] font-mono text-xs">
              Select an investor from the directory to manage their investment plans and balance.
            </div>
          )}
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#F0B90B]/30 rounded-xl w-full max-w-md p-6 space-y-5 shadow-2xl relative text-[#EAECEF]">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-[#EAECEF] text-base tracking-tight">Adjust Investor Balance</h3>
                  <p className="text-[11px] font-mono text-[#848E9C]">{selectedUser.name} ({selectedUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('credit')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    adjustAction === 'credit'
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/50'
                      : 'bg-[#2B313A] text-[#848E9C] border-[#363D47]'
                  }`}
                >
                  + Credit / Top-Up
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('debit')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    adjustAction === 'debit'
                      ? 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/50'
                      : 'bg-[#2B313A] text-[#848E9C] border-[#363D47]'
                  }`}
                >
                  - Debit / Deduct
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full glass-input text-sm font-mono py-2.5 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Audit Note</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Reason for balance modification..."
                  className="w-full glass-input text-xs font-mono py-2 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-[#848E9C] hover:text-[#EAECEF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingBalance}
                  className="px-5 py-2.5 rounded-lg btn-binance font-mono font-bold text-xs transition-all shadow-md disabled:opacity-50"
                >
                  {loadingBalance ? 'Updating...' : 'Execute Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Breach Cancellation Modal */}
      {cancellingInv && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#F6465D]/30 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-[#EAECEF]">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#F6465D]/15 border border-[#F6465D]/30 flex items-center justify-center text-[#F6465D]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-[#EAECEF] text-base tracking-tight">
                    Cancel Investment (Breach of Rules)
                  </h3>
                  <p className="text-[11px] font-mono text-[#848E9C]">
                    Contract ID: {cancellingInv.id} • {cancellingInv.planName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancellingInv(null)}
                className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCancel} className="space-y-4">
              {/* Contract Summary Box */}
              <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47] grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#848E9C] block text-[10px]">Investor User</span>
                  <span className="text-[#EAECEF] font-bold">{selectedUser?.name || cancellingInv.userId}</span>
                </div>
                <div>
                  <span className="text-[#848E9C] block text-[10px]">Principal Capital</span>
                  <span className="text-[#EAECEF] font-bold">${cancellingInv.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Breach Reason Selector */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  Select Institutional Rule Breach Category
                </label>
                <select
                  value={breachReason}
                  onChange={(e) => setBreachReason(e.target.value)}
                  className="w-full glass-input text-xs font-mono py-2.5 px-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47]"
                >
                  {PRESET_BREACH_REASONS.map((reason, idx) => (
                    <option key={idx} value={reason} className="bg-[#1E2329] text-[#EAECEF]">
                      {reason}
                    </option>
                  ))}
                  <option value="custom" className="bg-[#1E2329] text-[#F0B90B]">
                    -- Specify Custom Breach Notice --
                  </option>
                </select>
              </div>

              {/* Custom Reason Textarea */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  Custom Notice / Message Sent to Investor
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Optional custom clarification note dispatched in the priority alert pop-up to the investor..."
                  className="w-full glass-input text-xs font-mono p-3 text-[#EAECEF] rounded-lg bg-[#2B313A] border border-[#363D47] resize-none"
                />
              </div>

              {/* Principal Refund Option */}
              <div className="p-3.5 rounded-lg bg-[#2B313A] border border-[#363D47] flex items-center justify-between">
                <div>
                  <label className="text-xs font-mono font-bold text-[#EAECEF] block cursor-pointer">
                    Refund Principal Allocation
                  </label>
                  <p className="text-[11px] font-mono text-[#848E9C]">
                    Credit ${cancellingInv.amount.toLocaleString()} back to investor available balance
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={refundPrincipal}
                  onChange={(e) => setRefundPrincipal(e.target.checked)}
                  className="w-5 h-5 rounded text-[#F0B90B] focus:ring-[#F0B90B] bg-[#181A20] border-[#363D47]"
                />
              </div>

              {/* Alert Dispatch Notice */}
              <div className="p-3 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[11px] font-mono text-[#F0B90B] leading-relaxed">
                ⚠️ <strong>Instant Alert Notice</strong>: Executing this cancellation will immediately pop up a high-priority warning modal on the investor's dashboard informing them of this contract termination and the specified reason.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingInv(null)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="px-5 py-2.5 rounded-lg bg-[#F6465D] hover:bg-[#F6465D]/80 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-[#F6465D]/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isSubmittingCancel ? 'Terminating...' : 'Terminate Contract & Alert Investor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

