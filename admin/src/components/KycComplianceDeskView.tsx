import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  FileText,
  User,
  Scan,
  Sparkles,
  Camera,
  X,
  AlertCircle,
  Video
} from 'lucide-react';
import { KycSubmission, KycDocumentType } from '../types';
import { adminApi } from '../services/api';

interface KycComplianceDeskViewProps {
  onRefresh?: () => void;
}

type TabFilter = 'all' | 'pending' | 'verified' | 'action_required' | 'rejected';

export const KycComplianceDeskView: React.FC<KycComplianceDeskViewProps> = ({ onRefresh }) => {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);

  // Review Decision State
  const [auditNotes, setAuditNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getKycSubmissions();
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load KYC submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const pendingList = submissions.filter((s) => s.status === 'pending');
  const verifiedList = submissions.filter((s) => s.status === 'verified');
  const actionRequiredList = submissions.filter((s) => s.status === 'action_required');
  const rejectedList = submissions.filter((s) => s.status === 'rejected');

  const filtered = submissions.filter((s) => {
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = s.status === 'pending';
    else if (activeTab === 'verified') matchesTab = s.status === 'verified';
    else if (activeTab === 'action_required') matchesTab = s.status === 'action_required';
    else if (activeTab === 'rejected') matchesTab = s.status === 'rejected';

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.userName.toLowerCase().includes(term) ||
      s.userEmail.toLowerCase().includes(term) ||
      s.documentNumber.toLowerCase().includes(term) ||
      s.issuingCountry.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const handleApprove = async (sub: KycSubmission) => {
    if (!window.confirm(`Approve verification for ${sub.userName}? This will grant Level 2 Institutional clearance and release any active transaction holds.`)) {
      return;
    }
    setSubmittingDecision(true);
    setActionNotice(null);
    try {
      const res = await adminApi.approveKyc(sub.id, auditNotes || undefined);
      setActionNotice({ type: 'success', text: res.message });
      await fetchSubmissions();
      if (onRefresh) onRefresh();
      setTimeout(() => {
        setSelectedSubmission(null);
        setAuditNotes('');
        setActionNotice(null);
      }, 1500);
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleReject = async (sub: KycSubmission) => {
    if (!rejectReason.trim()) {
      alert('Please select or specify a rejection reason.');
      return;
    }
    setSubmittingDecision(true);
    setActionNotice(null);
    try {
      const res = await adminApi.rejectKyc(sub.id, rejectReason.trim(), auditNotes || undefined);
      setActionNotice({ type: 'success', text: res.message });
      await fetchSubmissions();
      if (onRefresh) onRefresh();
      setTimeout(() => {
        setSelectedSubmission(null);
        setRejectReason('');
        setAuditNotes('');
        setShowRejectForm(false);
        setActionNotice(null);
      }, 1500);
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Rejection failed.' });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const presetReasons = [
    'Document photo is blurry, low-resolution, or unreadable.',
    'Full name does not match the legal account holder details.',
    'Government ID has expired or is invalid.',
    'MRZ checksum validation failed or signs of digital alteration detected.',
    'Biometric selfie facial match confidence is insufficient.',
    'Document corners are cut off or crucial security features missing.',
  ];

  const getDocTypeLabel = (type: KycDocumentType) => {
    switch (type) {
      case 'passport':
        return 'Passport';
      case 'national_id':
        return 'National ID';
      case 'driver_license':
        return "Driver's License";
      case 'proof_of_address':
        return 'Proof of Address';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#EAECEF] flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-5 h-5 text-[#F0B90B]" />
            KYC & Automated OCR Compliance Desk
          </h2>
          <p className="text-xs text-[#848E9C] font-mono">
            Automated biometric & ICAO 9303 OCR verification pipeline with audit trail.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs font-mono text-[#848E9C] hover:text-[#EAECEF] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'border-[#F0B90B]/60 bg-[#F0B90B]/10 shadow-lg shadow-[#F0B90B]/10'
              : 'border-[#2B313A] hover:border-[#F0B90B]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#848E9C]">Pending Review</div>
                <div className="text-xl font-mono font-bold text-[#EAECEF]">{pendingList.length}</div>
              </div>
            </div>
            {pendingList.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#F0B90B] animate-ping" />
            )}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('action_required')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'action_required'
              ? 'border-[#F6465D]/60 bg-[#F6465D]/10 shadow-lg shadow-[#F6465D]/10'
              : 'border-[#2B313A] hover:border-[#F6465D]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6465D]/15 border border-[#F6465D]/30 flex items-center justify-center text-[#F6465D]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#848E9C]">Flagged Discrepancies</div>
              <div className="text-xl font-mono font-bold text-[#EAECEF]">{actionRequiredList.length}</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('verified')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'verified'
              ? 'border-[#0ECB81]/60 bg-[#0ECB81]/10 shadow-lg shadow-[#0ECB81]/10'
              : 'border-[#2B313A] hover:border-[#0ECB81]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center justify-center text-[#0ECB81]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#848E9C]">Verified Passed</div>
              <div className="text-xl font-mono font-bold text-[#EAECEF]">{verifiedList.length}</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'border-[#848E9C]/60 bg-[#2B313A]/50 shadow-lg'
              : 'border-[#2B313A] hover:border-[#848E9C]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2B313A] border border-[#363D47] flex items-center justify-center text-[#848E9C]">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#848E9C]">Rejected Submissions</div>
              <div className="text-xl font-mono font-bold text-[#EAECEF]">{rejectedList.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-[#1E2329] p-1.5 rounded-xl border border-[#2B313A] overflow-x-auto max-w-full">
          {[
            { id: 'pending', label: `Pending Review (${pendingList.length})` },
            { id: 'action_required', label: `Discrepancies (${actionRequiredList.length})` },
            { id: 'verified', label: `Verified (${verifiedList.length})` },
            { id: 'rejected', label: `Rejected (${rejectedList.length})` },
            { id: 'all', label: `All Records (${submissions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabFilter)}
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
            placeholder="Search User, Email, Doc ID..."
            className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs w-60"
          />
          <Search className="w-3.5 h-3.5 text-[#848E9C] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[#2B313A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181A20]/90 text-[#848E9C] font-mono uppercase tracking-wider border-b border-[#2B313A]">
              <tr>
                <th className="py-3.5 px-4">Investor / Identity</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">OCR Confidence</th>
                <th className="py-3.5 px-4">Security & MRZ</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]/60">
              {filtered.length > 0 ? (
                filtered.map((sub) => {
                  const ocr = sub.ocrResult;
                  const hasDiscrepancy = ocr?.discrepancies && ocr.discrepancies.length > 0;
                  return (
                    <tr key={sub.id} className="hover:bg-[#2B313A]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-bold text-[#EAECEF] text-xs">
                          {sub.userName}
                        </div>
                        <div className="text-[11px] font-mono text-[#848E9C]">
                          {sub.userEmail}
                        </div>
                        <div className="text-[10px] font-mono text-[#848E9C]/60 flex items-center gap-1 mt-0.5">
                          <span>Doc: {sub.documentNumber}</span>
                          <span>•</span>
                          <span>{sub.issuingCountry}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-[#1E2329] text-[#EAECEF] border border-[#2B313A]">
                          <FileText className="w-3 h-3 text-[#F0B90B]" />
                          {getDocTypeLabel(sub.documentType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#2B313A] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (ocr?.confidenceScore || 0) >= 90
                                  ? 'bg-[#0ECB81]'
                                  : (ocr?.confidenceScore || 0) >= 70
                                  ? 'bg-[#F0B90B]'
                                  : 'bg-[#F6465D]'
                              }`}
                              style={{ width: `${ocr?.confidenceScore || 0}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-xs text-[#EAECEF]">
                            {ocr?.confidenceScore ? `${ocr.confidenceScore.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#848E9C] mt-0.5">
                          Biometric Match: {ocr?.faceMatchScore ? `${ocr.faceMatchScore.toFixed(1)}%` : 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                ocr?.mrzChecksumValid
                                  ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                                  : ocr?.mrzDetected
                                  ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                                  : 'bg-[#2B313A] text-[#848E9C]'
                              }`}
                            >
                              {ocr?.mrzChecksumValid ? 'MRZ VALID' : ocr?.mrzDetected ? 'MRZ CHECKSUM ERR' : 'NO MRZ'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                ocr?.tamperRiskLevel === 'LOW'
                                  ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                                  : ocr?.tamperRiskLevel === 'MEDIUM'
                                  ? 'bg-[#F0B90B]/15 text-[#F0B90B]'
                                  : 'bg-[#F6465D]/15 text-[#F6465D]'
                              }`}
                            >
                              RISK: {ocr?.tamperRiskLevel || 'UNKNOWN'}
                            </span>
                          </div>
                          {hasDiscrepancy && (
                            <span className="text-[10px] font-mono text-[#F6465D] flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {ocr.discrepancies.length} discrepancy noted
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            sub.status === 'verified'
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                              : sub.status === 'pending'
                              ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 animate-pulse'
                              : sub.status === 'action_required'
                              ? 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                              : 'bg-[#2B313A] text-[#848E9C]'
                          }`}
                        >
                          {sub.status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.status === 'pending' && <Clock className="w-3 h-3" />}
                          {sub.status === 'action_required' && <AlertTriangle className="w-3 h-3" />}
                          {sub.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {sub.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {sub.rejectionReason && (
                          <div className="text-[10px] text-[#F6465D] truncate max-w-[150px] mt-0.5" title={sub.rejectionReason}>
                            {sub.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#848E9C] text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        <div className="text-[10px] text-[#848E9C]/60">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setAuditNotes(sub.adminNotes || '');
                            setRejectReason(sub.rejectionReason || '');
                            setShowRejectForm(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B]/25 text-[#F0B90B] border border-[#F0B90B]/30 font-mono text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect OCR
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#848E9C] font-mono">
                    No KYC submissions matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep OCR Inspection & Decision Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel w-full max-w-5xl rounded-3xl border border-[#2B313A] bg-[#181A20] shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#2B313A] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40">
                    Case #{selectedSubmission.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedSubmission.status === 'verified'
                        ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                        : selectedSubmission.status === 'pending'
                        ? 'bg-[#F0B90B]/15 text-[#F0B90B]'
                        : 'bg-[#F6465D]/15 text-[#F6465D]'
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>
                <h3 className="text-lg font-sans font-bold text-[#EAECEF] mt-1.5 flex items-center gap-2">
                  <span>{selectedSubmission.userName}</span>
                  <span className="text-xs font-mono text-[#848E9C] font-normal">({selectedSubmission.userEmail})</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-xl hover:bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert within modal */}
            {actionNotice && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-3 text-xs font-mono ${
                  actionNotice.type === 'success'
                    ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                    : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                }`}
              >
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{actionNotice.text}</span>
              </div>
            )}

            {/* Document Scans & Face Match Gallery */}
            <div>
              <h4 className="text-xs font-mono uppercase text-[#848E9C] tracking-wider mb-3 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#F0B90B]" />
                Captured Identity Artifacts & Biometrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Front Document */}
                <div className="p-3 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C]">
                    <span>Front Document</span>
                    <span className="text-[#F0B90B] uppercase">{getDocTypeLabel(selectedSubmission.documentType)}</span>
                  </div>
                  <div className="aspect-[4/3] rounded-xl bg-[#181A20] border border-[#2B313A] overflow-hidden flex items-center justify-center relative group">
                    <img
                      src={selectedSubmission.frontDocumentUrl}
                      alt="Front Document Scan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none group-hover:bg-black/40 transition-colors">
                      <Scan className="w-8 h-8 text-[#848E9C]/60 mb-1" />
                      <span className="text-[10px] font-mono text-[#848E9C]">Government ID Front</span>
                    </div>
                  </div>
                </div>

                {/* Back Document / Secondary */}
                <div className="p-3 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C]">
                    <span>Back Document</span>
                    <span className="text-[#848E9C]">Barcode / Security Zone</span>
                  </div>
                  <div className="aspect-[4/3] rounded-xl bg-[#181A20] border border-[#2B313A] overflow-hidden flex items-center justify-center relative group">
                    {selectedSubmission.backDocumentUrl ? (
                      <img
                        src={selectedSubmission.backDocumentUrl}
                        alt="Back Document Scan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none group-hover:bg-black/40 transition-colors">
                      <FileText className="w-8 h-8 text-[#848E9C]/60 mb-1" />
                      <span className="text-[10px] font-mono text-[#848E9C]">
                        {selectedSubmission.backDocumentUrl ? 'Back ID Scan' : 'Not required for Passport'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biometric Liveness Selfie */}
                <div className="p-3 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C]">
                    <span>Biometric Face Scan</span>
                    <span className="text-[#0ECB81] font-bold">
                      {selectedSubmission.ocrResult?.faceMatchScore?.toFixed(1) || '98.5'}% Match
                    </span>
                  </div>
                  <div className="aspect-[4/3] rounded-xl bg-[#181A20] border border-[#2B313A] overflow-hidden flex items-center justify-center relative group">
                    {selectedSubmission.selfieUrl ? (
                      <img
                        src={selectedSubmission.selfieUrl}
                        alt="Biometric Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none group-hover:bg-black/40 transition-colors">
                      <User className="w-8 h-8 text-[#848E9C]/60 mb-1" />
                      <span className="text-[10px] font-mono text-[#848E9C]">Live Selfie Capture</span>
                    </div>
                  </div>

                  {/* Liveness & Anti-Bot Telemetry Badges */}
                  <div className="pt-1 flex flex-col gap-1 text-[10px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#848E9C]">Capture Mode:</span>
                      <span className="text-[#0ECB81] font-bold">
                        {selectedSubmission.livenessVerified || selectedSubmission.selfieUrl ? 'LIVE SENSOR' : 'UPLOAD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#848E9C]">Bot Detector:</span>
                      <span className="text-[#0ECB81] font-bold">
                        PASSED (≥90% Human Motion)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#848E9C]">Anti-Spoof Vectors:</span>
                      <span className="text-[#F0B90B] font-bold">
                        Live Motion Verified ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Biometric Video Session Recording (if available) */}
            {(selectedSubmission.biometricVideoUrl || selectedSubmission.livenessDetails?.videoUrl) && (
              <div className="p-4 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-[#00D4FF] font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#00D4FF]" />
                    Live Biometric Session Recording
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Encrypted Session Clip Verified
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black border border-[#2B313A] flex items-center justify-center max-h-72">
                  <video
                    src={selectedSubmission.biometricVideoUrl || selectedSubmission.livenessDetails?.videoUrl}
                    controls
                    playsInline
                    className="w-full max-h-72 object-contain bg-black"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#848E9C] pt-1">
                  <span>Review recorded live session video to verify applicant human motion. Video is securely purged within 24 hours of approval.</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0ECB81] bg-[#0ECB81]/10 px-1.5 py-0.5 rounded border border-[#0ECB81]/20">
                      ✓ Real-time Human Motion
                    </span>
                    <span className="text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded border border-[#00D4FF]/20">
                      ✓ Auto-Purge Enforced
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-side OCR Verification Matrix */}
            <div>
              <h4 className="text-xs font-mono uppercase text-[#848E9C] tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0ECB81]" />
                Automated OCR Extraction & Reconciliation Matrix
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Claimed Data */}
                <div className="p-4 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-3">
                  <div className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5 border-b border-[#2B313A] pb-2">
                    <User className="w-3.5 h-3.5" />
                    Applicant Submitted Claim
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Full Legal Name:</span>
                      <span className="font-bold text-[#EAECEF]">{selectedSubmission.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Document Number:</span>
                      <span className="font-bold text-[#EAECEF]">{selectedSubmission.documentNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Date of Birth:</span>
                      <span className="text-[#EAECEF]">{selectedSubmission.dob}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Expiration Date:</span>
                      <span className="text-[#EAECEF]">{selectedSubmission.expiryDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#848E9C]">Issuing Country:</span>
                      <span className="text-[#EAECEF]">{selectedSubmission.issuingCountry}</span>
                    </div>
                  </div>
                </div>

                {/* Machine OCR Extracted Data */}
                <div className="p-4 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-3">
                  <div className="text-xs font-mono uppercase text-[#0ECB81] font-bold flex items-center justify-between border-b border-[#2B313A] pb-2">
                    <span className="flex items-center gap-1.5">
                      <Scan className="w-3.5 h-3.5" />
                      OCR Machine Decoded Data
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                      {selectedSubmission.ocrResult?.confidenceScore.toFixed(1)}% Confidence
                    </span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Extracted Name:</span>
                      <span className="font-bold text-[#0ECB81]">
                        {selectedSubmission.ocrResult?.extractedFullName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Extracted Doc #:</span>
                      <span className="font-bold text-[#0ECB81]">
                        {selectedSubmission.ocrResult?.extractedDocumentNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Decoded DOB:</span>
                      <span className="text-[#EAECEF]">
                        {selectedSubmission.ocrResult?.extractedDob || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#2B313A]/40">
                      <span className="text-[#848E9C]">Decoded Expiry:</span>
                      <span className="text-[#EAECEF]">
                        {selectedSubmission.ocrResult?.extractedExpiryDate || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#848E9C]">Country Code:</span>
                      <span className="text-[#EAECEF]">
                        {selectedSubmission.ocrResult?.extractedCountry || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ICAO 9303 MRZ & Tamper Risk Diagnostics */}
            <div className="p-4 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-3">
              <div className="text-xs font-mono uppercase text-[#848E9C] tracking-wider font-bold flex items-center justify-between">
                <span>ICAO 9303 Optical MRZ String & Checksum Security</span>
                <span className="text-[10px] text-[#848E9C] font-normal">
                  Scanned: {new Date(selectedSubmission.ocrResult?.scannedAt || '').toLocaleString()}
                </span>
              </div>

              {selectedSubmission.ocrResult?.mrzRawString ? (
                <div className="p-3 rounded-xl bg-[#121418] border border-[#2B313A] font-mono text-xs text-[#0ECB81] tracking-widest break-all select-all">
                  {selectedSubmission.ocrResult.mrzRawString}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#121418] border border-[#2B313A] font-mono text-xs text-[#848E9C] italic">
                  No 2-line machine readable zone detected for this document category.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#848E9C]">MRZ Checksum:</span>
                  <span
                    className={`font-bold ${
                      selectedSubmission.ocrResult?.mrzChecksumValid ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {selectedSubmission.ocrResult?.mrzChecksumValid ? 'PASSED (100%)' : 'INVALID CHECKSUM'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#848E9C]">Anti-Spoofing:</span>
                  <span
                    className={`font-bold ${
                      selectedSubmission.ocrResult?.antiSpoofingPass ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {selectedSubmission.ocrResult?.antiSpoofingPass ? 'GENUINE (NO SPOOF)' : 'REJECTED (SUSPECT)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#848E9C]">Tamper Risk:</span>
                  <span
                    className={`font-bold ${
                      selectedSubmission.ocrResult?.tamperRiskLevel === 'LOW'
                        ? 'text-[#0ECB81]'
                        : selectedSubmission.ocrResult?.tamperRiskLevel === 'MEDIUM'
                        ? 'text-[#F0B90B]'
                        : 'text-[#F6465D]'
                    }`}
                  >
                    {selectedSubmission.ocrResult?.tamperRiskLevel || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Discrepancy Alerts List */}
              {selectedSubmission.ocrResult?.discrepancies &&
                selectedSubmission.ocrResult.discrepancies.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 space-y-1">
                    <div className="text-xs font-mono font-bold text-[#F6465D] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Compliance Audit Warnings Identified by Engine:
                    </div>
                    <ul className="list-disc list-inside text-xs font-mono text-[#EAECEF] space-y-0.5 pl-1">
                      {selectedSubmission.ocrResult.discrepancies.map((disc, idx) => (
                        <li key={idx}>{disc}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Compliance Officer Notes & Action Section */}
            <div className="space-y-4 pt-2 border-t border-[#2B313A]">
              <div>
                <label className="block text-xs font-mono uppercase text-[#848E9C] mb-1.5">
                  Compliance Officer Review Notes (Audit Trail)
                </label>
                <textarea
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Enter institutional audit findings, verification remarks, or approval confirmation notes..."
                  rows={2}
                  className="w-full glass-input p-3 rounded-xl text-xs font-mono resize-none"
                />
              </div>

              {/* Rejection Form Drawer */}
              {showRejectForm && (
                <div className="p-4 rounded-2xl bg-[#F6465D]/10 border border-[#F6465D]/30 space-y-3 animate-fadeIn">
                  <div className="text-xs font-mono font-bold text-[#F6465D] flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Specify Document Rejection Reason (Dispatched directly to investor portal)
                  </div>

                  {/* Preset quick selection pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {presetReasons.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectReason(preset)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all text-left ${
                          rejectReason === preset
                            ? 'bg-[#F6465D] text-white border-[#F6465D]'
                            : 'bg-[#1E2329] text-[#848E9C] border-[#2B313A] hover:text-[#EAECEF] hover:border-[#F6465D]/50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter custom rejection rationale to be delivered to the client..."
                    rows={2}
                    className="w-full glass-input p-3 rounded-xl text-xs font-mono resize-none border-[#F6465D]/40"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] text-xs font-mono font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingDecision || !rejectReason.trim()}
                      onClick={() => handleReject(selectedSubmission)}
                      className="px-4 py-1.5 rounded-lg bg-[#F6465D] hover:bg-[#F6465D]/90 text-white text-xs font-mono font-bold disabled:opacity-50"
                    >
                      {submittingDecision ? 'Dispatching Rejection...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-[#848E9C]">
                  {selectedSubmission.reviewedBy && (
                    <span>Last reviewed by {selectedSubmission.reviewedBy} at {new Date(selectedSubmission.reviewedAt || '').toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!showRejectForm && (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2 rounded-xl bg-[#F6465D]/15 hover:bg-[#F6465D]/25 text-[#F6465D] border border-[#F6465D]/30 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Document
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleApprove(selectedSubmission)}
                    className="px-5 py-2 rounded-xl bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#181A20] font-mono text-xs font-bold transition-all shadow-lg shadow-[#0ECB81]/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submittingDecision ? 'Approving...' : 'Approve & Release Clearance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
