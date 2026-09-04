import React, { useState } from 'react';
import { X, ArrowUpRight, Check, AlertCircle, ShieldCheck, Wallet } from 'lucide-react';
import { api } from '../services/api';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onWithdrawSuccess
}) => {
  const [asset, setAsset] = useState('USDT');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      setError(`Insufficient balance. You have $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }
    if (!address || address.trim().length < 10) {
      setError('Please provide a valid destination cryptocurrency address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.withdraw(amount, asset, address);
      setSuccess(res.message);
      setTimeout(() => {
        onWithdrawSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-card-featured border-gold/40 p-6 shadow-2xl shadow-black">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Disburse Liquidity</h3>
            <p className="text-xs text-white/50">Instant automated cryptographic withdrawal</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-glow" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
              <span>Withdrawal Asset</span>
              <span className="text-white/70">Available: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="USDT">Tether (USDT TRC-20)</option>
              <option value="BTC">Bitcoin (BTC Native)</option>
              <option value="ETH">Ethereum (ETH ERC-20)</option>
              <option value="SOL">Solana (SOL Native)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
              <span>Amount (USD)</span>
              <div className="flex gap-1">
                {[0.25, 0.5, 1].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setAmount(Number((availableBalance * pct).toFixed(2)))}
                    className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[10px] text-gold font-mono"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              step={10}
              min={10}
              className="w-full p-3 rounded-xl glass-input font-serif text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">Recipient Cryptographic Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. TX9d8b7a6c5d4e3f..."
              className="w-full p-3 rounded-xl glass-input font-mono text-xs"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono space-y-1.5 text-white/60">
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span className="text-emerald-glow font-bold">0.00% ($0.00)</span>
            </div>
            <div className="flex justify-between">
              <span>Network Gas:</span>
              <span className="text-white">Subsidized by Heron</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/[0.06] text-white font-bold">
              <span>Net Disbursement:</span>
              <span className="text-gold font-serif text-base">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || amount <= 0 || amount > availableBalance}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:brightness-105 text-[#0b0d0d] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 disabled:opacity-40"
          >
            {loading ? 'Processing Withdrawal...' : 'Disburse to Address ↗'}
          </button>
        </form>
      </div>
    </div>
  );
};
