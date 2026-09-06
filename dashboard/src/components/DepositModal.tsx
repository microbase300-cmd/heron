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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-[#EAECEF] tracking-tight">Deposit Digital Assets</h3>
            <p className="text-xs text-[#848E9C] font-mono">Platform cold-custody receiving desk</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-[#0ECB81]/15 border border-[#0ECB81]/30 text-[#0ECB81]'
                : 'bg-[#F6465D]/15 border border-[#F6465D]/30 text-[#F6465D]'
            }`}
          >
            {feedback.type === 'success' ? (
              <Clock className="w-4 h-4 shrink-0 text-[#0ECB81]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2 mb-5">
          <label className="text-[11px] font-mono text-[#848E9C] uppercase tracking-wider">
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
                    ? 'bg-[#F0B90B]/15 border-[#F0B90B] text-[#EAECEF] font-semibold shadow-sm'
                    : 'bg-[#181A20] border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#242A32]'
                }`}
              >
                <div className="font-bold text-[#EAECEF] text-xs">{a.name}</div>
                <div className="text-[10px] text-[#F0B90B] font-mono truncate">{a.network}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code & Address Display */}
        <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-3 mb-5">
          <div>
            <div className="text-[10px] font-mono text-[#848E9C] uppercase tracking-widest mb-1">
              {currentNetwork} Receiving Address
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E2329] border border-[#2B313A] font-mono text-xs text-[#EAECEF]">
              <span className="truncate pr-2 select-all">{currentAddress}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-[#2B313A] text-[#F0B90B] hover:text-[#FCD535] transition-all flex items-center gap-1 text-[11px] font-bold"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form to Submit Inbound Deposit Proof */}
        <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2 border-t border-[#2B313A]">
          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1">
              Deposit Amount ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000.00"
              className="w-full px-4 py-2.5 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1">
              Blockchain Transaction Hash / Reference (Optional)
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x... or TRC20 TxID"
              className="w-full px-4 py-2.5 rounded-lg bg-[#181A20] border border-[#2B313A] text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none text-xs font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#181A20] border border-[#2B313A] text-[11px] font-mono text-[#848E9C] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0ECB81] shrink-0" />
            <span>Incoming deposits are verified by the settlement officer and credited upon 1 confirmation.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-[#F0B90B]/15 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Receipt...' : 'Notify Settlement Desk ↗'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

