import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  Sliders,
  Award,
  Wallet,
  History,
  Eye,
  EyeOff,
  ArrowUpRight,
  X,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Scan
} from 'lucide-react';
import { User, WhitelistedWallet, SecurityLogItem } from '../types';
import { api } from '../services/api';
import { ClientVerificationPortal } from './ClientVerificationPortal';
import { ExchangeRatesData, convertCurrency, formatCurrency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../utils/currency';

interface ProfileViewProps {
  user: User | null;
  onUpdateUser?: (updated: User) => void;
  onNavigate?: (tab: string) => void;
  onOpenWithdraw?: (prefilledAddress?: string) => void;
  exchangeRates?: ExchangeRatesData;
}

const DEFAULT_WHITELISTED_WALLETS: WhitelistedWallet[] = [
  {
    id: 'w_default_1',
    asset: 'USDT',
    network: 'Tron (TRC-20)',
    address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    label: 'Cold Vault Ledger (Institutional Primary)',
    addedAt: '2026-08-15T10:20:00Z'
  },
  {
    id: 'w_default_2',
    asset: 'BTC',
    network: 'Bitcoin Native SegWit',
    address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082',
    label: 'Treasury Cold Multisig Destination',
    addedAt: '2026-08-20T14:45:00Z'
  },
  {
    id: 'w_default_3',
    asset: 'ETH',
    network: 'Ethereum Mainnet',
    address: '0x882194f8a7e6d5c4b3a201948572615049382710',
    label: 'Institutional Primary Custody',
    addedAt: '2026-09-01T08:12:00Z'
  }
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onOpenWithdraw,
  exchangeRates
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'verification' | 'wallets' | 'activity' | 'preferences'>('security');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Profile fields state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [antiPhishingCode, setAntiPhishingCode] = useState(user?.antiPhishingCode || 'HERON-SEC-2026');
  const [isSavingPhishing, setIsSavingPhishing] = useState(false);
  const [phishingSavedAlert, setPhishingSavedAlert] = useState(false);

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? true);
  const [whitelistEnabled, setWhitelistEnabled] = useState(user?.whitelistEnabled ?? true);
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
  const [currencySaving, setCurrencySaving] = useState(false);
  const [currencySuccess, setCurrencySuccess] = useState<string | null>(null);

  // Sync preferred currency with user profile updates
  useEffect(() => {
    if (user?.preferredCurrency) {
      setPreferredCurrency(user.preferredCurrency);
    }
  }, [user?.preferredCurrency]);

  const handleSelectCurrency = async (curr: string) => {
    setPreferredCurrency(curr);
    setCurrencySaving(true);
    setCurrencySuccess(null);
    try {
      const res = await api.updateProfile({ preferredCurrency: curr });
      if (res?.user && onUpdateUser) {
        onUpdateUser(res.user);
      } else if (onUpdateUser && user) {
        onUpdateUser({ ...user, preferredCurrency: curr });
      }
      setCurrencySuccess(`Valuation currency changed to ${curr} (${CURRENCY_SYMBOLS[curr] || '$'})`);
      setTimeout(() => setCurrencySuccess(null), 3500);
    } catch (err: any) {
      console.error('Failed to update preferred currency:', err);
    } finally {
      setCurrencySaving(false);
    }
  };

  // Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Whitelisted Wallets State
  const [wallets, setWallets] = useState<WhitelistedWallet[]>(
    user?.whitelistedWallets && user.whitelistedWallets.length > 0
      ? user.whitelistedWallets
      : DEFAULT_WHITELISTED_WALLETS
  );
  const [walletFilter, setWalletFilter] = useState<string>('ALL');
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [newWalletAsset, setNewWalletAsset] = useState('USDT');
  const [newWalletNetwork, setNewWalletNetwork] = useState('Tron (TRC-20)');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [addWalletLoading, setAddWalletLoading] = useState(false);
  const [addWalletError, setAddWalletError] = useState('');

  // Security Logs State
  const [securityLogs, setSecurityLogs] = useState<SecurityLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Notification Preferences
  const [notifTrade, setNotifTrade] = useState(true);
  const [notifYield, setNotifYield] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);

  // Load Security Logs
  useEffect(() => {
    let isMounted = true;
    const loadLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await api.getSecurityLogs();
        if (isMounted && res.logs) {
          setSecurityLogs(res.logs);
        }
      } catch {
        // Handled in api fallback
      } finally {
        if (isMounted) setLoadingLogs(false);
      }
    };
    loadLogs();
    return () => { isMounted = false; };
  }, []);

  const handleRefreshLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getSecurityLogs();
      if (res && res.logs) {
        setSecurityLogs(res.logs);
      }
    } catch {
      // Handled in api fallback
    } finally {
      setLoadingLogs(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate consistent UID if not set
  const userUID = user?.uid || (user ? `8${Math.abs(user.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 8923).toString().slice(0, 7)}` : '8942104');
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Aug 2026';

  // Save Name
  const handleSaveName = async () => {
    if (!nameInput.trim() || !user) return;
    try {
      const res = await api.updateProfile({ name: nameInput.trim() });
      if (onUpdateUser && res.user) {
        onUpdateUser({ ...user, name: nameInput.trim() });
      }
      setIsEditingName(false);
    } catch {
      setIsEditingName(false);
    }
  };

  // Save Anti-Phishing Code
  const handleSavePhishingCode = async () => {
    setIsSavingPhishing(true);
    try {
      await api.updateProfile({ antiPhishingCode: antiPhishingCode.trim() });
      setPhishingSavedAlert(true);
      setTimeout(() => setPhishingSavedAlert(false), 3000);
    } finally {
      setIsSavingPhishing(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    await api.updateProfile({ twoFactorEnabled: nextVal });
  };

  // Toggle Whitelist
  const handleToggleWhitelist = async () => {
    const nextVal = !whitelistEnabled;
    setWhitelistEnabled(nextVal);
    await api.updateProfile({ whitelistEnabled: nextVal });
  };

  // Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully.');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 1800);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Add Whitelisted Wallet
  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddWalletError('');

    if (!newWalletAddress.trim() || !newWalletLabel.trim()) {
      setAddWalletError('Please provide both destination address and account label.');
      return;
    }

    setAddWalletLoading(true);
    try {
      const res = await api.addWhitelistedWallet({
        asset: newWalletAsset,
        network: newWalletNetwork,
        address: newWalletAddress.trim(),
        label: newWalletLabel.trim()
      });

      if (res.wallet) {
        setWallets(prev => [res.wallet, ...prev]);
      }
      setIsAddWalletOpen(false);
      setNewWalletAddress('');
      setNewWalletLabel('');
    } catch (err: any) {
      setAddWalletError(err.message || 'Failed to add address.');
    } finally {
      setAddWalletLoading(false);
    }
  };

  // Delete Whitelisted Wallet
  const handleDeleteWallet = async (id: string) => {
    try {
      await api.deleteWhitelistedWallet(id);
      setWallets(prev => prev.filter(w => w.id !== id));
    } catch {
      setWallets(prev => prev.filter(w => w.id !== id));
    }
  };

  const filteredWallets = walletFilter === 'ALL'
    ? wallets
    : wallets.filter(w => w.asset.toUpperCase() === walletFilter.toUpperCase());

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. INSTITUTIONAL TOP PROFILE CARD */}
      <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#0ECB81]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B]/20 via-[#2B313A] to-[#181A20] border-2 border-[#F0B90B]/60 p-1 shadow-lg shadow-[#F0B90B]/10 flex items-center justify-center">
                <img
                  src="/heron_logo.jpg"
                  alt="Heron Assets Trustee"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0ECB81] border-2 border-[#1E2329] flex items-center justify-center text-[10px] text-white" title="Verified Session">
                ✓
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="px-2.5 py-1 text-sm bg-[#181A20] border border-[#F0B90B] rounded text-[#EAECEF] focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2 py-1 text-xs bg-[#F0B90B] text-[#181A20] font-bold rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setIsEditingName(false); setNameInput(user?.name || ''); }}
                      className="text-xs text-[#848E9C] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight truncate">
                      {user?.name || 'Institutional Client'}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-[#848E9C] hover:text-[#F0B90B] transition-colors"
                      title="Edit Display Name"
                    >
                      ✎
                    </button>
                  </div>
                )}

                {/* Dynamic KYC Badge */}
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold transition-all ${
                    user?.kycStatus === 'verified'
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 hover:bg-[#0ECB81]/25'
                      : user?.kycStatus === 'pending'
                      ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 animate-pulse'
                      : (user?.kycStatus === 'action_required' || user?.kycStatus === 'rejected' || user?.forceReverification)
                      ? 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30 hover:bg-[#F6465D]/25'
                      : 'bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                  title="Click to view verification status"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.kycStatus === 'verified'
                    ? 'Level 2 Verified'
                    : user?.kycStatus === 'pending'
                    ? 'Verification Pending'
                    : (user?.kycStatus === 'action_required' || user?.kycStatus === 'rejected' || user?.forceReverification)
                    ? 'KYC Action Required'
                    : 'Unverified (Tier 1)'}
                </button>

                {/* VIP Institutional Tier */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                  <Award className="w-3.5 h-3.5" />
                  VIP 1 Institutional
                </span>
              </div>

              {/* Subtitle credentials: Email, UID, Registered Date */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-[#848E9C] font-mono">
                <div className="flex items-center gap-1">
                  <span>{user?.email || 'investor@heronassets.com'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81]" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#5E6673]">UID:</span>
                  <span className="text-[#EAECEF] font-semibold">{userUID}</span>
                  <button
                    onClick={() => handleCopy(userUID, 'uid')}
                    className="p-1 text-[#848E9C] hover:text-[#F0B90B] transition-colors"
                    title="Copy UID"
                  >
                    {copiedKey === 'uid' ? <Check className="w-3 h-3 text-[#0ECB81]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[#5E6673]">
                  <span>Member Since:</span>
                  <span className="text-[#848E9C]">{memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Tier Highlights Card */}
          <div className="bg-[#181A20] rounded-xl border border-[#2B313A] p-4 sm:p-5 shrink-0 flex items-center justify-between sm:justify-start gap-6">
            <div>
              <div className="text-[10px] uppercase font-mono text-[#848E9C] tracking-wider">Settlement Privilege</div>
              <div className="text-sm font-sans font-bold text-[#0ECB81] mt-0.5 flex items-center gap-1.5">
                <span>Direct Cold Vault Custody</span>
              </div>
              <div className="text-[11px] text-[#848E9C] font-sans mt-0.5">Zero gas fee institutional treasury waiver</div>
            </div>

            <div className="border-l border-[#2B313A] pl-5 hidden sm:block">
              <div className="text-[10px] uppercase font-mono text-[#848E9C] tracking-wider">Daily Disbursement Quota</div>
              <div className="text-sm font-mono font-bold text-[#EAECEF] mt-0.5">$2,000,000.00 / 24h</div>
              <div className="text-[11px] text-[#0ECB81] font-mono mt-0.5">100% Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INSTITUTIONAL TAB SELECTOR */}
      <div className="border-b border-[#2B313A] flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'security', label: 'Security & Protection', icon: ShieldCheck },
          { id: 'verification', label: 'Identity Verification (KYC)', icon: Scan },
          { id: 'wallets', label: 'Whitelisted Wallets', icon: Wallet },
          { id: 'activity', label: 'Login & Session Log', icon: History },
          { id: 'preferences', label: 'Preferences & Limits', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 pt-2 px-1 sm:px-2 text-xs sm:text-sm font-sans font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-[#F0B90B] text-[#F0B90B]'
                  : 'border-transparent text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: IDENTITY VERIFICATION & OCR CLEARANCE */}
      {activeTab === 'verification' && user && (
        <ClientVerificationPortal
          user={user}
          onVerificationUpdated={async () => {
            const res = await api.getMe();
            if (res?.user && onUpdateUser) onUpdateUser(res.user);
          }}
        />
      )}

      {/* TAB A: SECURITY & PROTECTION CENTER */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Score Meter */}
          <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center justify-center text-[#0ECB81]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-sans font-bold text-[#EAECEF]">Security Status: High Protection</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0ECB81]/20 text-[#0ECB81]">95% RATING</span>
                  </div>
                  <p className="text-xs text-[#848E9C] mt-0.5">
                    Your account is shielded with multi-factor authentication, anti-phishing safeguards, and vault whitelist enforcement.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-48 bg-[#181A20] rounded-full h-2.5 overflow-hidden border border-[#2B313A]">
                <div className="bg-gradient-to-r from-[#0ECB81] to-[#F0B90B] h-full rounded-full w-[95%]" />
              </div>
            </div>
          </div>

          {/* Core Security Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Module 1: Login Password */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 flex flex-col justify-between space-y-4 hover:border-[#F0B90B]/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B313A] flex items-center justify-center text-[#F0B90B]">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-[#EAECEF]">Login Password</h4>
                    <p className="text-xs text-[#848E9C] mt-0.5">Used for authentication into your dashboard</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                  Active
                </span>
              </div>

              <div className="pt-2 border-t border-[#2B313A] flex items-center justify-between">
                <span className="text-[11px] text-[#848E9C] font-mono">Last changed: Verified</span>
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-xs font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-all"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Module 2: Two-Factor Authentication (2FA) */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 flex flex-col justify-between space-y-4 hover:border-[#F0B90B]/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B313A] flex items-center justify-center text-[#0ECB81]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-[#EAECEF]">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-[#848E9C] mt-0.5">Required for capital withdrawal & security authorization</p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                  twoFactorEnabled ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30' : 'bg-[#F6465D]/15 text-[#F6465D]'
                }`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#2B313A] flex items-center justify-between">
                <span className="text-[11px] text-[#848E9C] font-mono">Email OTP Verification</span>
                <button
                  onClick={handleToggle2FA}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    twoFactorEnabled
                      ? 'bg-[#2B313A] border-[#363D47] text-[#EAECEF] hover:text-[#F6465D]'
                      : 'bg-[#F0B90B] text-[#181A20] font-bold'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {/* Module 3: Anti-Phishing Code */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 flex flex-col justify-between space-y-4 hover:border-[#F0B90B]/30 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2B313A] flex items-center justify-center text-[#F0B90B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-[#EAECEF]">Anti-Phishing Verification Code</h4>
                    <p className="text-xs text-[#848E9C] mt-0.5">Verifies official communications from Heron Assets Trustee</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#848E9C] mt-2">
                  When set, this personalized code will be embedded in every email alert and security dispatch to prevent spoofing.
                </p>
              </div>

              <div className="pt-2 border-t border-[#2B313A] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={antiPhishingCode}
                    onChange={e => setAntiPhishingCode(e.target.value)}
                    placeholder="e.g. HERON-SEC-2026"
                    className="flex-1 px-3 py-1.5 bg-[#181A20] border border-[#2B313A] rounded-lg text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                  />
                  <button
                    onClick={handleSavePhishingCode}
                    disabled={isSavingPhishing}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {isSavingPhishing ? 'Saving...' : 'Update'}
                  </button>
                </div>
                {phishingSavedAlert && (
                  <p className="text-[10px] text-[#0ECB81] font-mono">✓ Anti-phishing code synchronized successfully.</p>
                )}
              </div>
            </div>

            {/* Module 4: Whitelist Protection Toggle */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 flex flex-col justify-between space-y-4 hover:border-[#F0B90B]/30 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2B313A] flex items-center justify-center text-[#0ECB81]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-[#EAECEF]">Withdrawal Whitelist Enforcement</h4>
                    <p className="text-xs text-[#848E9C] mt-0.5">Restrict capital disbursements exclusively to approved addresses</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#848E9C] mt-2">
                  When enabled, withdrawals cannot be sent to newly entered addresses unless they have been whitelisted for at least 24 hours.
                </p>
              </div>

              <div className="pt-2 border-t border-[#2B313A] flex items-center justify-between">
                <span className="text-[11px] text-[#848E9C] font-mono">
                  {whitelistEnabled ? 'Protection Active' : 'Unrestricted Disbursements'}
                </span>
                <button
                  onClick={handleToggleWhitelist}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    whitelistEnabled
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30 hover:bg-[#0ECB81]/25'
                      : 'bg-[#2B313A] text-[#848E9C] border-[#363D47]'
                  }`}
                >
                  {whitelistEnabled ? '✓ Enforced' : 'Enable Whitelist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: WHITELISTED WALLETS */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-sans font-bold text-[#EAECEF]">Approved Withdrawal Destinations</h3>
              <p className="text-xs text-[#848E9C] mt-0.5">
                Pre-authorized cryptographic custody addresses for 1-click automated disbursements.
              </p>
            </div>

            <button
              onClick={() => setIsAddWalletOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs transition-all shadow-md shadow-[#F0B90B]/10 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Whitelisted Address</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['ALL', 'USDT', 'BTC', 'ETH', 'SOL'].map(f => (
              <button
                key={f}
                onClick={() => setWalletFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  walletFilter === f
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Wallets List */}
          <div className="space-y-3">
            {filteredWallets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#1E2329] border border-[#2B313A] text-center space-y-3">
                <Wallet className="w-8 h-8 text-[#5E6673] mx-auto" />
                <p className="text-xs text-[#848E9C]">No whitelisted addresses found for this asset filter.</p>
              </div>
            ) : (
              filteredWallets.map(w => (
                <div
                  key={w.id}
                  className="rounded-xl bg-[#1E2329] border border-[#2B313A] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#F0B90B]/40 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                        {w.asset} • {w.network}
                      </span>
                      <h4 className="text-sm font-sans font-bold text-[#EAECEF] truncate">{w.label}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#848E9C]">
                      <span className="truncate max-w-xs sm:max-w-md">{w.address}</span>
                      <button
                        onClick={() => handleCopy(w.address, w.id)}
                        className="p-1 hover:text-[#F0B90B] transition-colors shrink-0"
                        title="Copy Address"
                      >
                        {copiedKey === w.id ? <Check className="w-3.5 h-3.5 text-[#0ECB81]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-[10px] text-[#5E6673] font-mono">
                      Added on {new Date(w.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenWithdraw ? onOpenWithdraw(w.address) : onNavigate?.('withdraw')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-xs font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-all"
                    >
                      <span>Withdraw Here</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWallet(w.id)}
                      className="p-2 rounded-lg text-[#848E9C] hover:text-[#F6465D] hover:bg-[#2B313A] transition-all"
                      title="Remove Whitelisted Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB C: LOGIN & SECURITY AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-sans font-bold text-[#EAECEF]">Recent Login & Session Audit Trail</h3>
              <p className="text-xs text-[#848E9C] mt-0.5">
                Cryptographic log of authenticated sessions, geographical edge nodes, and hardware clients.
              </p>
            </div>

            <button
              onClick={handleRefreshLogs}
              disabled={loadingLogs}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-xs font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-all self-start sm:self-auto disabled:opacity-50"
            >
              <History className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin text-[#F0B90B]' : 'text-[#848E9C]'}`} />
              <span>{loadingLogs ? 'Refreshing...' : 'Refresh Audit Trail'}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#181A20] text-[#848E9C] border-b border-[#2B313A]">
                  <tr>
                    <th className="py-3 px-4 sm:px-6 font-semibold">Timestamp (UTC)</th>
                    <th className="py-3 px-4 font-semibold">Device / Client</th>
                    <th className="py-3 px-4 font-semibold">Masked IP Address</th>
                    <th className="py-3 px-4 font-semibold">Edge Node / Region</th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B313A]/50 text-[#EAECEF]">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#848E9C]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
                          <span>Refreshing cryptographic audit records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#848E9C]">No audit records captured yet.</td>
                    </tr>
                  ) : (
                    securityLogs.map((log, idx) => {
                      const isCurrentSession = idx === 0;
                      const isAuthorized = log.status === 'Authorized';
                      const isBlocked = log.status === 'Blocked';
                      const isChallenge = log.status === 'Challenge';

                      return (
                        <tr key={log.id} className="hover:bg-[#2B313A]/30 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 text-[#848E9C]">
                            <div className="flex items-center gap-2">
                              {isCurrentSession && (
                                <span className="relative flex h-2 w-2" title="Active Live Session">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ECB81] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ECB81]"></span>
                                </span>
                              )}
                              <span>
                                {new Date(log.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                              {isCurrentSession && (
                                <span className="text-[10px] text-[#0ECB81] font-sans font-bold bg-[#0ECB81]/10 px-1.5 py-0.5 rounded border border-[#0ECB81]/30">
                                  Current
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-sans font-medium flex items-center gap-2">
                            {log.device.includes('Mobile') || log.device.includes('Android') || log.device.includes('iOS') || log.device.includes('iPhone') ? (
                              <Smartphone className="w-4 h-4 text-[#F0B90B] shrink-0" />
                            ) : (
                              <Laptop className="w-4 h-4 text-[#0ECB81] shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">{log.device}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#848E9C]">{log.ip}</td>
                          <td className="py-3.5 px-4 text-[#848E9C] flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#5E6673] shrink-0" />
                            <span>{log.location}</span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isAuthorized
                                ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30'
                                : isBlocked
                                ? 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30'
                                : 'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/30'
                            }`}>
                              {isAuthorized ? '✓ ' : isBlocked ? '✕ ' : '⚠ '}
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#F0B90B] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#848E9C] leading-relaxed">
              <strong className="text-[#EAECEF]">Zero-Trust Session Architecture:</strong> Authenticated sessions, hardware devices, and edge routes are cryptographically pinned. If you notice any unverified authorization attempts or blocked logins from unfamiliar locations, immediately update your security password and enable Two-Factor Authentication.
            </p>
          </div>
        </div>
      )}

      {/* TAB D: PREFERENCES & LIMITS */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency & Live Converter Card */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-sans font-bold text-[#EAECEF] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#F0B90B]" />
                  <span>Base Display Currency & Live Converter</span>
                </h4>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse"></span>
                  Live Forex Rates
                </div>
              </div>
              <p className="text-xs text-[#848E9C]">
                Select your primary fiat valuation unit. All portfolio balances, yields, and statistics dynamically recalculate across your dashboard using real-time forex exchange rates.
              </p>

              {currencySuccess && (
                <div className="p-3 rounded-xl bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-xs text-[#0ECB81] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{currencySuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2">
                {(['USD', 'EUR', 'GBP'] as const).map(curr => {
                  const isSelected = preferredCurrency === curr;
                  const rate = (exchangeRates?.rates && exchangeRates.rates[curr]) || (curr === 'EUR' ? 0.860364 : curr === 'GBP' ? 0.738631 : 1.0);
                  return (
                    <button
                      key={curr}
                      onClick={() => handleSelectCurrency(curr)}
                      disabled={currencySaving}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0B90B] text-[#181A20] border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10'
                          : 'bg-[#181A20] text-[#848E9C] border-[#2B313A] hover:border-[#363D47] hover:text-[#EAECEF]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs">
                          {curr} ({CURRENCY_SYMBOLS[curr]})
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`text-[10px] font-sans ${isSelected ? 'text-[#181A20]/80 font-medium' : 'text-[#848E9C]'}`}>
                        {CURRENCY_NAMES[curr]}
                      </div>
                      <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-[#181A20] font-bold' : 'text-[#F0B90B]'}`}>
                        {curr === 'USD' ? '1.0000 USD' : `1 USD = ${rate.toFixed(4)}`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Converted Balance Simulator */}
              <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#848E9C] flex items-center gap-1.5 font-sans">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0ECB81]" />
                    Live Account Balance Equivalent
                  </span>
                  <span className="font-mono font-semibold text-[#848E9C]">
                    Base: ${Number(user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-mono font-bold text-[#EAECEF]">
                    {formatCurrency(user?.balance ?? 0, preferredCurrency, exchangeRates?.rates)}
                  </span>
                  <span className="text-xs font-mono text-[#F0B90B]">
                    {preferredCurrency !== 'USD' ? `Rate: 1 USD = ${((exchangeRates?.rates && exchangeRates.rates[preferredCurrency]) || 1).toFixed(4)} ${preferredCurrency}` : 'Benchmark Base (USD)'}
                  </span>
                </div>
                <p className="text-[10px] text-[#848E9C]">
                  Exchange rate timestamp: {exchangeRates?.lastUpdated ? new Date(exchangeRates.lastUpdated).toLocaleTimeString() : 'Real-time Live'} • Powered by Open Forex API
                </p>
              </div>
            </div>

            {/* Institutional Limits Card */}
            <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 space-y-4">
              <h4 className="text-sm font-sans font-bold text-[#EAECEF] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0ECB81]" />
                <span>Institutional Account Limits</span>
              </h4>
              <p className="text-xs text-[#848E9C]">Based on Level 2 Verified Institutional Clearance.</p>

              <div className="space-y-2.5 pt-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-[#2B313A]">
                  <span className="text-[#848E9C]">Daily Withdrawal Quota</span>
                  <span className="text-[#0ECB81] font-bold">$2,000,000.00 / 24h</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B313A]">
                  <span className="text-[#848E9C]">Single Transaction Limit</span>
                  <span className="text-[#EAECEF] font-bold">$500,000.00</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#848E9C]">Blockchain Gas Subsidy</span>
                  <span className="text-[#F0B90B] font-bold">100% Waived by Treasury</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 space-y-4">
            <h4 className="text-sm font-sans font-bold text-[#EAECEF]">Notification & Security Dispatch Channels</h4>
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#181A20] border border-[#2B313A] cursor-pointer">
                <div>
                  <div className="text-xs font-sans font-bold text-[#EAECEF]">Timelock Maturity & Yield Disbursals</div>
                  <div className="text-[11px] text-[#848E9C]">Receive real-time alerts when investments mature and yield credits to balance</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifYield}
                  onChange={e => setNotifYield(e.target.checked)}
                  className="w-4 h-4 accent-[#F0B90B] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#181A20] border border-[#2B313A] cursor-pointer">
                <div>
                  <div className="text-xs font-sans font-bold text-[#EAECEF]">Deposit & Liquidity Confirmations</div>
                  <div className="text-[11px] text-[#848E9C]">Notified upon blockchain block confirmations of incoming funds</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifTrade}
                  onChange={e => setNotifTrade(e.target.checked)}
                  className="w-4 h-4 accent-[#F0B90B] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#181A20] border border-[#2B313A] cursor-pointer">
                <div>
                  <div className="text-xs font-sans font-bold text-[#EAECEF]">Institutional Security Dispatches</div>
                  <div className="text-[11px] text-[#848E9C]">Immediate alerts for new device logins, password changes, or whitelist modifications</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifSecurity}
                  onChange={e => setNotifSecurity(e.target.checked)}
                  className="w-4 h-4 accent-[#F0B90B] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CHANGE PASSWORD */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#F0B90B]" />
                <h3 className="text-base font-sans font-bold text-[#EAECEF]">Change Login Password</h3>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-[#848E9C] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-[#F6465D]/15 border border-[#F6465D]/30 text-xs text-[#F6465D]">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/30 text-xs text-[#0ECB81]">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-sm text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">New Password (8+ characters)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-sm text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-sm text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#848E9C]">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 hover:text-[#EAECEF]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#2B313A] text-[#848E9C] hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD WHITELISTED WALLET */}
      {isAddWalletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#0ECB81]" />
                <h3 className="text-base font-sans font-bold text-[#EAECEF]">Add Whitelisted Address</h3>
              </div>
              <button
                onClick={() => setIsAddWalletOpen(false)}
                className="text-[#848E9C] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addWalletError && (
              <div className="p-3 rounded-lg bg-[#F6465D]/15 border border-[#F6465D]/30 text-xs text-[#F6465D]">
                {addWalletError}
              </div>
            )}

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#848E9C] mb-1">Asset</label>
                  <select
                    value={newWalletAsset}
                    onChange={e => {
                      setNewWalletAsset(e.target.value);
                      if (e.target.value === 'USDT') setNewWalletNetwork('Tron (TRC-20)');
                      else if (e.target.value === 'BTC') setNewWalletNetwork('Bitcoin Native SegWit');
                      else if (e.target.value === 'ETH') setNewWalletNetwork('Ethereum Mainnet');
                      else if (e.target.value === 'SOL') setNewWalletNetwork('Solana SPL');
                    }}
                    className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-sm text-[#EAECEF] focus:outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#848E9C] mb-1">Network</label>
                  <input
                    type="text"
                    value={newWalletNetwork}
                    readOnly
                    className="w-full px-3 py-2 bg-[#181A20]/60 border border-[#2B313A] rounded-lg text-xs font-mono text-[#848E9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Custom Account Label</label>
                <input
                  type="text"
                  value={newWalletLabel}
                  onChange={e => setNewWalletLabel(e.target.value)}
                  placeholder="e.g. Ledger Nano Vault / Cold Storage"
                  required
                  className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-sm text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Destination Address</label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={e => setNewWalletAddress(e.target.value)}
                  placeholder="Enter cryptographic wallet address"
                  required
                  className="w-full px-3 py-2 bg-[#181A20] border border-[#2B313A] rounded-lg text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#181A20] border border-[#2B313A] text-[11px] text-[#848E9C] font-mono">
                🛡️ Verified by Heron Protocol. Whitelisted destinations bypass manual compliance review for instant withdrawals.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddWalletOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#2B313A] text-[#848E9C] hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addWalletLoading}
                  className="flex-1 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {addWalletLoading ? 'Verifying...' : 'Whitelist Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
