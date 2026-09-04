import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ArrowDownLeft, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

const ASSETS = [
  { id: 'USDT_TRC20', name: 'Tether (USDT)', network: 'Tron (TRC-20)', address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a', min: '$50', conf: '1 Network Block' },
  { id: 'USDT_ERC20', name: 'Tether (USDT)', network: 'Ethereum (ERC-20)', address: '0x882194f8a7e6d5c4b3a201948572615049382710', min: '$100', conf: '12 Confirmations' },
  { id: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Native SegWit', address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082', min: '0.001 BTC', conf: '2 Confirmations' },
  { id: 'ETH', name: 'Ethereum (ETH)', network: 'Ethereum Mainnet', address: '0x882194f8a7e6d5c4b3a201948572615049382710', min: '0.02 ETH', conf: '12 Confirmations' },
  { id: 'SOL', name: 'Solana (SOL)', network: 'Solana Mainnet', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', min: '0.5 SOL', conf: 'Instant' }
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState('USDT_TRC20');
  const [copied, setCopied] = useState(false);
  const [simAmount, setSimAmount] = useState<number>(5000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAsset = ASSETS.find(a => a.id === selectedAssetId) || ASSETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAsset.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatedDeposit = async () => {
    setIsDepositing(true);
    setFeedback(null);
    try {
      const res = await api.deposit(simAmount, currentAsset.name.split(' ')[0]);
      setFeedback(res.message);
      setTimeout(() => {
        onDepositSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback(err.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-card-featured border-gold/40 p-6 shadow-2xl shadow-black">
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
            <p className="text-xs text-white/50">Direct cryptographic multi-chain wallet custody</p>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-glow" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Asset Selector */}
        <div className="space-y-2 mb-5">
          <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Select Deposit Asset & Network</label>
          <div className="grid grid-cols-2 gap-2">
            {ASSETS.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAssetId(a.id)}
                className={`p-3 rounded-xl text-left border text-xs transition-all ${
                  selectedAssetId === a.id
                    ? 'bg-gold/15 border-gold text-white font-semibold shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="font-bold text-white">{a.name}</div>
                <div className="text-[10px] text-gold font-mono">{a.network}</div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code & Address Display */}
        <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08] text-center space-y-3 mb-5">
          <div className="w-32 h-32 mx-auto rounded-lg bg-white p-2 shadow-lg flex items-center justify-center">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" fill="#ffffff" />
              <path d="M10 10h30v30h-30z M15 15v20h20v-20z M60 10h30v30h-30z M65 15v20h20v-20z M10 60h30v30h-30z M15 65v20h20v-20z" fill="#0b0d0d" />
              <rect x="22" y="22" width="6" height="6" fill="#d6a84f" />
              <rect x="72" y="22" width="6" height="6" fill="#d6a84f" />
              <rect x="22" y="72" width="6" height="6" fill="#d6a84f" />
              <path d="M45 15h10v10h-10z M45 35h10v10h-10z M15 45h10v10h-10z M35 45h10v10h-10z M55 45h10v10h-10z M75 45h10v10h-10z M45 55h20v10h-20z M75 55h15v15h-15z M45 75h10v15h-10z M65 75h10v10h-10z" fill="#0b0d0d" />
            </svg>
          </div>

          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Your {currentAsset.network} Deposit Address
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-xs text-white">
              <span className="truncate pr-2">{currentAsset.address}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-white/[0.08] text-gold hover:text-gold-light transition-all"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-glow" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Instant Sandbox Testing Credit (Quick Test) */}
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gold font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instant Test Deposit
            </span>
            <span className="text-white/40">Zero gas fee</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
              step={500}
              className="w-1/2 p-2 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-xs font-bold outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={handleSimulatedDeposit}
              disabled={isDepositing}
              className="w-1/2 py-2 px-3 rounded-lg bg-gold hover:bg-gold-light text-[#0b0d0d] font-bold text-xs tracking-wide transition-all shadow-md shadow-gold/20 disabled:opacity-50"
            >
              {isDepositing ? 'Verifying...' : `Confirm +$${simAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
