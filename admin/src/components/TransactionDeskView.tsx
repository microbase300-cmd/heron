import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Transaction } from '../types';
import { adminApi } from '../services/api';

interface TransactionDeskViewProps {
  transactions: Transaction[];
  onRefreshTransactions: () => void;
}

type TabType = 'all' | 'pending_deposits' | 'pending_withdrawals' | 'completed' | 'rejected';

export const TransactionDeskView: React.FC<TransactionDeskViewProps> = ({
  transactions,
  onRefreshTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const totalPendingDepositAmount = pendingDeposits.reduce((acc, t) => acc + t.amount, 0);
  const totalPendingWithdrawalAmount = pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0);

  const filtered = transactions.filter((t) => {
    let matchesTab = true;
    if (activeTab === 'pending_deposits') {
      matchesTab = t.type === 'deposit' && t.status === 'pending';
    } else if (activeTab === 'pending_withdrawals') {
      matchesTab = t.type === 'withdrawal' && t.status === 'pending';
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'completed';
    } else if (activeTab === 'rejected') {
      matchesTab = t.status === 'rejected';
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(term) ||
      t.userId.toLowerCase().includes(term) ||
      (t.txHash && t.txHash.toLowerCase().includes(term)) ||
      (t.note && t.note.toLowerCase().includes(term)) ||
      t.asset.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const handleApproveDeposit = async (tx: Transaction) => {
    if (!window.confirm(`Confirm inbound deposit of $${tx.amount.toLocaleString()} ${tx.asset} for User ${tx.userId}? Balance will be credited instantly.`)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.approveTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm deposit.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdrawal = async (tx: Transaction) => {
    if (!window.confirm(`Authorize withdrawal disbursement of $${tx.amount.toLocaleString()} ${tx.asset} to client address?`)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.approveTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to approve withdrawal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: Transaction) => {
    const isWithdrawal = tx.type === 'withdrawal';
    const msg = isWithdrawal
      ? `Reject withdrawal of $${tx.amount.toLocaleString()}? The escrowed balance of $${tx.amount.toLocaleString()} will be automatically REFUNDED to the investor.`
      : `Reject inbound deposit record ${tx.id}?`;
    
    if (!window.confirm(msg)) return;
    setProcessingId(tx.id);
    try {
      await adminApi.rejectTransaction(tx.id);
      onRefreshTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to reject transaction.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and KPI Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <CreditCard className="w-5 h-5 text-[#F0B90B]" />
            Settlement Desk & Liquidity Verification
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Two-tier institutional clearance pipeline for inbound deposits & client disbursements.
          </p>
        </div>
      </div>

      {/* Settlement Queues Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveTab('pending_deposits')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'pending_deposits' ? 'border-[#0ECB81]/60 bg-[#0ECB81]/10 shadow-lg shadow-[#0ECB81]/10' : 'border-[#2B313A] hover:border-[#0ECB81]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center justify-center text-[#0ECB81]">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-[#848E9C] tracking-wider">Inbound Deposits Queue</h3>
                <div className="text-lg font-mono font-bold text-[#EAECEF] mt-0.5">
                  ${totalPendingDepositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              pendingDeposits.length > 0 ? 'bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40 animate-pulse' : 'bg-[#2B313A] text-[#848E9C]'
            }`}>
              {pendingDeposits.length} pending
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pending_withdrawals')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'pending_withdrawals' ? 'border-[#F0B90B]/60 bg-[#F0B90B]/10 shadow-lg shadow-[#F0B90B]/10' : 'border-[#2B313A] hover:border-[#F0B90B]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-[#848E9C] tracking-wider">Outbound Withdrawals Queue</h3>
                <div className="text-lg font-mono font-bold text-[#EAECEF] mt-0.5">
                  ${totalPendingWithdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              pendingWithdrawals.length > 0 ? 'bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40 animate-pulse' : 'bg-[#2B313A] text-[#848E9C]'
            }`}>
              {pendingWithdrawals.length} awaiting approval
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-[#1E2329] p-1.5 rounded-xl border border-[#2B313A] overflow-x-auto max-w-full">
          {[
            { id: 'all', label: `All Transactions (${transactions.length})` },
            { id: 'pending_deposits', label: `Pending Deposits (${pendingDeposits.length})` },
            { id: 'pending_withdrawals', label: `Pending Withdrawals (${pendingWithdrawals.length})` },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F0B90B] text-[#181A20] font-bold shadow-md shadow-[#F0B90B]/10'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TX, User, Hash, Note..."
            className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs w-60"
          />
          <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[#2B313A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181A20]/90 text-[#848E9C] font-mono uppercase tracking-wider border-b border-[#2B313A]">
              <tr>
                <th className="py-3.5 px-4">Transaction / User</th>
                <th className="py-3.5 px-4">Type & Asset</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]/60">
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#2B313A]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#EAECEF] text-xs flex items-center gap-1.5">
                        <span>{tx.id}</span>
                        {tx.txHash && (
                          <span className="text-[10px] text-[#F0B90B] font-mono truncate max-w-[140px]" title={tx.txHash}>
                            ({tx.txHash})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#848E9C] font-sans mt-0.5 max-w-sm truncate">
                        {tx.note || `User: ${tx.userId}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                          tx.type === 'deposit'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                            : tx.type === 'withdrawal'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            : tx.type === 'yield_payout'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            : 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                        }`}
                      >
                        {tx.type === 'deposit' && <ArrowDownLeft className="w-3 h-3" />}
                        {tx.type === 'withdrawal' && <ArrowUpRight className="w-3 h-3" />}
                        {tx.type.replace('_', ' ')} • {tx.asset}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#EAECEF] text-sm">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          tx.status === 'completed'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                            : tx.status === 'pending'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 animate-pulse'
                            : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                        }`}
                      >
                        {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {tx.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#848E9C] text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {tx.type === 'deposit' ? (
                            <button
                              onClick={() => handleApproveDeposit(tx)}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 rounded-lg bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#181A20] font-mono text-xs font-bold transition-all shadow-md shadow-[#0ECB81]/20 disabled:opacity-50 flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Confirm & Credit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveWithdrawal(tx)}
                              disabled={processingId === tx.id}
                              className="px-3 py-1.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-mono text-xs font-bold transition-all shadow-md shadow-[#F0B90B]/20 disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve Payout
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(tx)}
                            disabled={processingId === tx.id}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F6465D]/15 hover:bg-[#F6465D]/25 text-[#F6465D] border border-[#F6465D]/30 font-mono text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {tx.type === 'withdrawal' ? 'Reject & Refund' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#848E9C]/60 font-mono text-[11px]">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#848E9C] font-mono">
                    No transactions matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
