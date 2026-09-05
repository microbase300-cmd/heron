import React, { useState } from 'react';
import {
  Users,
  Search,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { AdminUser } from '../types';
import { adminApi } from '../services/api';

interface UserManagementViewProps {
  users: AdminUser[];
  onRefreshUsers: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onRefreshUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'funded' | 'unfunded' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<'balance' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Balance adjustment & Top Up state
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshUsers();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(term));

    // Category filter
    let matchesCategory = true;
    if (filterType === 'funded') {
      matchesCategory = u.balance > 0;
    } else if (filterType === 'unfunded') {
      matchesCategory = u.balance === 0;
    } else if (filterType === 'active') {
      matchesCategory = u.status === 'active';
    } else if (filterType === 'suspended') {
      matchesCategory = u.status === 'suspended';
    }

    return matchesSearch && matchesCategory;
  });

  const totalFunded = users.filter(u => u.balance > 0).length;
  const totalUnfunded = users.filter(u => u.balance === 0).length;
  const totalPlatformBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionMessage(null);
    setLoadingAction(true);

    try {
      const amount = parseFloat(adjustAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid positive numerical amount.');
      }

      const res = await adminApi.adjustUserBalance(
        selectedUser.id,
        amount,
        adjustAction,
        adjustNote || (adjustAction === 'credit' ? 'Executive manual liquidity top-up' : 'Executive manual debit')
      );

      setActionMessage({ type: 'success', text: res.message });
      setAdjustAmount('');
      setAdjustNote('');
      onRefreshUsers();
      setTimeout(() => {
        setModalMode(null);
        setSelectedUser(null);
        setActionMessage(null);
      }, 1500);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Balance update failed.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (
      !window.confirm(
        `Are you sure you want to change ${user.name}'s status to ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      onRefreshUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const setPresetAmount = (val: number) => {
    setAdjustAmount(val.toString());
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            Investor Account Directory ({users.length})
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Direct ledger inspection, liquidity top-ups, and user verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-mono transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.06]">
          <div className="text-[11px] font-mono text-white/50">Total Registered</div>
          <div className="text-lg font-mono font-bold text-white mt-0.5">{users.length} Investors</div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.06]">
          <div className="text-[11px] font-mono text-white/50">Funded Accounts</div>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{totalFunded} Active</div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.06]">
          <div className="text-[11px] font-mono text-white/50">Zero Balance ($0)</div>
          <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">{totalUnfunded} New / Pending</div>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-white/[0.06]">
          <div className="text-[11px] font-mono text-white/50">Total User Balances</div>
          <div className="text-lg font-mono font-bold text-gold mt-0.5">
            ${totalPlatformBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
          {[
            { id: 'all', label: `All (${users.length})` },
            { id: 'funded', label: `Funded (${totalFunded})` },
            { id: 'unfunded', label: `Zero Balance (${totalUnfunded})` },
            { id: 'active', label: 'Active' },
            { id: 'suspended', label: 'Suspended' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-gold text-[#0b0d0d] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, referral code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-white/40 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-white/50 font-mono uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Investor Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Available Liquidity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isNewToday = new Date(u.createdAt).toDateString() === new Date().toDateString();

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isNewToday && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-white/60">{u.email}</div>
                            <div className="text-[10px] font-mono text-white/30">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-gold/15 text-gold border border-gold/30'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className={`font-bold text-sm ${u.balance > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                          ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {u.balance === 0 && (
                          <span className="text-[10px] text-white/30 font-mono">Zero Balance</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950/60 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/60">
                        {u.referralCode || 'N/A'}
                        {u.referredBy && (
                          <div className="text-[10px] text-gold/60">Ref by: {u.referredBy}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-white/50 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="text-[10px] text-white/30">
                          {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustAction('credit');
                            setModalMode('balance');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-xs font-mono font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Top Up / Adjust
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                              u.status === 'active'
                                ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                            }`}
                            title={u.status === 'active' ? 'Suspend Investor' : 'Reactivate Investor'}
                          >
                            {u.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40 font-mono">
                    No matching investor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust / Top Up Balance Modal */}
      {modalMode === 'balance' && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-gold/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold" />
                Ledger Balance Top-Up & Adjustment
              </h3>
              <button
                onClick={() => {
                  setModalMode(null);
                  setSelectedUser(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
              <div className="text-white/50">Target Investor Account:</div>
              <div className="font-bold text-white text-sm">{selectedUser.name}</div>
              <div className="text-white/40 text-[11px]">{selectedUser.email}</div>
              <div className="mt-2 text-white/70">
                Current Available Balance:{' '}
                <span className="text-gold font-bold">
                  ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {actionMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-950/60 text-red-300 border border-red-500/30'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('credit')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    adjustAction === 'credit'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  + Top Up / Credit Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('debit')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    adjustAction === 'debit'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  - Debit / Deduct Balance
                </button>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <label className="block text-[11px] font-mono text-white/50 mb-1">
                  Quick Amount Presets
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[100, 500, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPresetAmount(preset)}
                      className="py-1 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-mono text-white/80 hover:text-gold transition-all"
                    >
                      ${preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1">
                  Adjustment Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 2500.00"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1">
                  Executive Memo / Audit Reason
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Inbound OTC wire transfer confirmation / Initial top-up"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] text-xs font-mono font-bold shadow-lg shadow-gold/20 disabled:opacity-50"
                >
                  {loadingAction ? 'Updating Ledger...' : adjustAction === 'credit' ? 'Credit Account' : 'Debit Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
