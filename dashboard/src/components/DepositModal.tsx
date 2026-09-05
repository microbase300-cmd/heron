import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowDownLeft, ShieldCheck, AlertCircle, Clock, Send } from 'lucide-react';
import { api } from '../services/api';
import { DepositAddressConfig } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

const DEFAULT_ASSETS = [
  { key: 'USDT_TRC20', name: 'Tether (USDT)', network: 'Tron (TRC-20)', address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a' },
  { key: 'USDT_ERC20', name: 'Tether (USDT)', network: 'Ethereum (ERC-20)', address: '0x882194f8a7e6d5c4b3a201948572615049382710' },
  { key: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Native SegWit', address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082' },
  { key: 'ETH', name: 'Ethereum (ETH)', network: 'Ethereum Mainnet', address: '0x882194f8a7e6d5c4b3a201948572615049382710' },
  { key: 'SOL', name: 'Solana (SOL)', network: 'Solana SPL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' }
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess
}) => {
  const [addresses, setAddresses] = useState<Record<string, DepositAddressConfig>>({});
  const [selectedKey, setSelectedKey] = useState('USDT_TRC20');
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<string>('2500');
  const [txHash, setTxHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getDepositAddresses()
        .then((res) => {
          if (res.addresses) setAddresses(res.addresses);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAddressObj = addresses[selectedKey] || DEFAULT_ASSETS.find((a) => a.key === selectedKey);
  const currentAddress = currentAddressObj?.address || 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a';
  const currentNetwork = currentAddressObj?.network || 'Tron (TRC-20)';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid deposit amount.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const assetLabel = selectedKey.split('_')[0];
      const res = await api.deposit(num, assetLabel, txHash || undefined);
      setFeedback({ type: 'success', message: res.message });
      setTxHash('');
      setTimeout(() => {
        onDepositSuccess();
        onClose();
        setFeedback(null);
      }, 1800);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Deposit submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-card-featured border-gold/40 p-6 sm:p-8 shadow-2xl shadow-black max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Deposit Digital Assets</h3>
            <p className="text-xs text-white/50 font-mono">Platform cold-custody receiving desk</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2 mb-5">
          <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider">
            Select Asset & Receiving Network
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEFAULT_ASSETS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setSelectedKey(a.key)}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  selectedKey === a.key
                    ? 'bg-gold/15 border-gold text-white font-semibold shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="font-bold text-white text-xs">{a.name}</div>
                <div className="text-[10px] text-gold font-mono truncate">{a.network}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code & Address Display */}
        <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] space-y-3 mb-5">
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              {currentNetwork} Receiving Address
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-xs text-white">
              <span className="truncate pr-2 select-all">{currentAddress}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-white/[0.08] text-gold hover:text-gold-light transition-all flex items-center gap-1 text-[11px]"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-glow" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form to Submit Inbound Deposit Proof */}
        <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2 border-t border-white/[0.08]">
          <div>
            <label className="block text-xs font-mono text-white/60 mb-1">
              Deposit Amount ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000.00"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1">
              Blockchain Transaction Hash / Reference (Optional)
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x... or TRC20 TxID"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-white/50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-glow shrink-0" />
            <span>Incoming deposits are verified by the settlement officer and credited upon 1 confirmation.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Receipt...' : 'Notify Settlement Desk ↗'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

