import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { adminApi } from '../services/api';
import { AdminUser } from '../types';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-transparent' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-[#F6465D]' };
    if (score === 3 || score === 4) return { score: 2, label: 'Strong', color: 'bg-[#F0B90B]' };
    return { score: 3, label: 'Institutional Grade', color: 'bg-[#0ECB81]' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Current master password is required.' });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (currentPassword === newPassword) {
      setFeedback({ type: 'error', message: 'New password cannot be identical to current password.' });
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.changePassword(currentPassword, newPassword);
      setFeedback({ 
        type: 'success', 
        message: res.message || 'Administrator master password updated successfully!' 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 2500);
    } catch (err: any) {
      setFeedback({ 
        type: 'error', 
        message: err.message || 'Failed to update master password. Please verify current credentials.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#1E2329] border border-[#2B313A] p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2B313A] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B] shadow-md shadow-[#F0B90B]/10">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-[#EAECEF] tracking-tight">
                Update Master Executive Password
              </h3>
              <p className="text-xs font-mono text-[#848E9C] flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-[#F0B90B]" />
                <span>Account: {user.email}</span>
                <span className="text-[#F0B90B] font-bold">({user.role.toUpperCase()})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A] transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-5 border ${
              feedback.type === 'success'
                ? 'bg-[#0ECB81]/15 border-[#0ECB81]/40 text-[#0ECB81]'
                : 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0ECB81]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F6465D]" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Security Notice Box */}
        <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs text-[#848E9C] flex items-start gap-2.5 mb-5">
          <ShieldCheck className="w-4 h-4 text-[#F0B90B] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-[#EAECEF] font-semibold">Institutional Security Protocol: </span>
            Updating your master password takes effect immediately. Ensure you commit the new password to an approved enterprise password manager.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
              Current Master Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#181A20] border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-sm font-mono text-[#EAECEF]"
              />
              <Lock className="w-4 h-4 text-[#848E9C] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-[#848E9C] hover:text-[#EAECEF] transition-colors cursor-pointer"
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-[#848E9C]">
                New Master Password
              </label>
              {newPassword && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  strength.score === 3 ? 'text-[#0ECB81]' : strength.score === 2 ? 'text-[#F0B90B]' : 'text-[#F6465D]'
                }`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#181A20] border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-sm font-mono text-[#EAECEF]"
              />
              <KeyRound className="w-4 h-4 text-[#848E9C] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-[#848E9C] hover:text-[#EAECEF] transition-colors cursor-pointer"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {newPassword && (
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <div className={`h-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-[#2B313A]'}`} />
                <div className={`h-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-[#2B313A]'}`} />
                <div className={`h-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-[#2B313A]'}`} />
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
              Confirm New Master Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#181A20] border text-sm font-mono text-[#EAECEF] focus:outline-none ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-[#F6465D] focus:border-[#F6465D]'
                    : confirmPassword && confirmPassword === newPassword
                    ? 'border-[#0ECB81] focus:border-[#0ECB81]'
                    : 'border-[#2B313A] focus:border-[#F0B90B]'
                }`}
              />
              <Lock className="w-4 h-4 text-[#848E9C] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-[#848E9C] hover:text-[#EAECEF] transition-colors cursor-pointer"
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <div className="text-[11px] text-[#F6465D] font-mono mt-1">
                Passwords do not match
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#2B313A] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-[#EAECEF] font-semibold text-xs font-mono transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#F0B90B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
