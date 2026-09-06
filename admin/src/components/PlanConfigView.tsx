import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Edit2,
  X,
  Save,
  RefreshCw,
  Zap,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { PlanConfig } from '../types';
import { adminApi } from '../services/api';

interface PlanConfigViewProps {
  plans: PlanConfig[];
  onRefreshPlans: () => void;
}

export const PlanConfigView: React.FC<PlanConfigViewProps> = ({
  plans,
  onRefreshPlans,
}) => {
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [formRate, setFormRate] = useState<number>(0);
  const [formReferralRate, setFormReferralRate] = useState<number>(0);
  const [formDuration, setFormDuration] = useState<number>(0);
  const [formMin, setFormMin] = useState<number>(0);
  const [formMax, setFormMax] = useState<number>(0);
  const [formBadge, setFormBadge] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const planList: PlanConfig[] = Array.isArray(plans) ? plans : Object.values((plans || {}) as Record<string, PlanConfig>);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshPlans();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const startEdit = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setFormRate(Number((plan.rate * 100).toFixed(2)));
    setFormReferralRate(Number(((plan.referralRate || 0.08) * 100).toFixed(2)));
    setFormDuration(plan.durationHours);
    setFormMin(plan.min);
    setFormMax(plan.max);
    setFormBadge(plan.badge || `${plan.durationHours}h • ${(plan.rate * 100).toFixed(1)}%`);
    setFormDesc(plan.description);
    setSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setSaving(true);
    setSuccessMsg(null);

    try {
      await adminApi.updatePlan(editingPlan.id, {
        rate: formRate / 100,
        referralRate: formReferralRate / 100,
        durationHours: Number(formDuration),
        min: Number(formMin),
        max: Number(formMax),
        badge: formBadge,
        description: formDesc,
      });

      setSuccessMsg(`Investment plan tier "${editingPlan.name}" updated successfully.`);
      await onRefreshPlans();
      setTimeout(() => {
        setEditingPlan(null);
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to update plan configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-gold" />
            Institutional Investment Tier Parameters ({planList.length} Tiers)
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Calibrate smart contract yield rates, lockup durations, minimum allocations, and partner affiliate incentives.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-gold' : ''}`} />
          <span>Refresh Parameters</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {planList.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-2xl glass-panel space-y-4 border transition-all ${
              plan.id === 'premium'
                ? 'border-gold/40 shadow-lg shadow-gold/5'
                : 'border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gold uppercase tracking-wider font-bold">
                    Tier ID: {plan.id}
                  </span>
                  {plan.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-white mt-1">{plan.name}</h3>
              </div>
              <button
                onClick={() => startEdit(plan)}
                className="px-3.5 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Configure
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed font-sans">{plan.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Fixed Yield</span>
                </div>
                <div className="text-emerald-glow font-bold text-base mt-0.5">
                  {(plan.rate * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gold" />
                  <span>Cycle Duration</span>
                </div>
                <div className="text-white font-bold text-base mt-0.5">{plan.durationHours} Hours</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-sky-400" />
                  <span>Min Allocation</span>
                </div>
                <div className="text-white font-bold text-sm mt-0.5">
                  ${plan.min.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-400" />
                  <span>Max Allocation</span>
                </div>
                <div className="text-white font-bold text-sm mt-0.5">
                  {(plan.max === null || plan.max === undefined || plan.max === Infinity || plan.max >= 99999999) ? 'Uncapped' : `$${Number(plan.max).toLocaleString()}`}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/50">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gold" />
                <span>Affiliate Commission: <strong className="text-gold">{((plan.referralRate || 0.08) * 100).toFixed(0)}%</strong></span>
              </span>
              <span className="text-emerald-400 font-bold">Active in Dashboard</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-gold/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gold" />
                Configure Investment Plan: {editingPlan.name}
              </h3>
              <button onClick={() => setEditingPlan(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Fixed Return Rate (% Return)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-emerald-glow font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Cycle Duration (Hours)
                  </label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Min Deposit ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMin}
                    onChange={(e) => setFormMin(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Max Deposit ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMax}
                    onChange={(e) => setFormMax(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Affiliate Commission (% of deposit)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formReferralRate}
                    onChange={(e) => setFormReferralRate(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    required
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. 72h • 15.5%"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1">Plan Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] text-xs font-mono font-bold shadow-lg shadow-gold/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating Tier...' : 'Save Parameters'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
