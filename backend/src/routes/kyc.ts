import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { OcrEngine } from '../services/ocrEngine';
import { KycDocumentType, KycSubmission } from '../types';

const router = Router();

// ============================================================================
// CLIENT VERIFICATION ROUTES (Authenticated)
// ============================================================================

// 1. GET /api/kyc/status - Get current user's verification state & latest submission
router.get('/status', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const submission = db.getKycSubmissionByUserId(userId);

    // Check if user has transactions on KYC hold
    const userTransactions = db.getTransactionsByUserId(userId);
    const kycHeldTransactions = userTransactions.filter(t => t.status === 'pending_kyc');

    res.json({
      kycLevel: user.kycLevel || 'unverified',
      kycStatus: user.kycStatus || 'unverified',
      kycRejectionReason: user.kycRejectionReason || null,
      forceReverification: Boolean(user.forceReverification),
      forceReverificationReason: user.forceReverificationReason || null,
      submission: submission || null,
      hasKycHold: kycHeldTransactions.length > 0,
      kycHeldTransactionsCount: kycHeldTransactions.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve verification status.' });
  }
});

// 2. POST /api/kyc/submit - Submit identity documents for automated OCR processing
router.post('/submit', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const {
      documentType,
      issuingCountry,
      documentNumber,
      fullName,
      dob,
      expiryDate,
      frontDocumentUrl,
      backDocumentUrl,
      selfieUrl,
      livenessVerified,
      livenessDetails,
      biometricVideoUrl
    } = req.body;

    if (!documentType || !issuingCountry || !documentNumber || !fullName || !frontDocumentUrl) {
      res.status(400).json({
        error: 'Missing required credentials: documentType, issuingCountry, documentNumber, fullName, and frontDocumentUrl are required.'
      });
      return;
    }

    // Run Automated OCR Extraction Pipeline
    const ocrResult = OcrEngine.processDocument({
      documentType: documentType as KycDocumentType,
      issuingCountry,
      documentNumber,
      fullName,
      dob,
      expiryDate,
      frontDocumentUrl,
      backDocumentUrl,
      selfieUrl,
      accountName: user.name
    });

    const submission: KycSubmission = {
      id: `kyc_${uuidv4().substring(0, 10)}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userUid: user.uid || `HAT-${Math.floor(10000000 + Math.random() * 90000000)}`,
      documentType: documentType as KycDocumentType,
      issuingCountry: issuingCountry.toUpperCase(),
      documentNumber: documentNumber.trim(),
      fullName: fullName.trim(),
      dob: dob || '1990-01-01',
      expiryDate: expiryDate || '2031-12-31',
      frontDocumentUrl,
      backDocumentUrl: backDocumentUrl || undefined,
      selfieUrl: selfieUrl || undefined,
      biometricVideoUrl: biometricVideoUrl || (livenessDetails && livenessDetails.videoUrl) || undefined,
      status: 'pending',
      ocrResult,
      livenessVerified: Boolean(livenessVerified),
      livenessDetails: livenessDetails || undefined,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createKycSubmission(submission);

    // Notify user of successful submission
    db.createNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      targetEmail: user.email,
      title: 'Verification Documents Received',
      message: `Your ${documentType.toUpperCase()} has been received and processed by our Automated OCR Engine (Score: ${ocrResult.confidenceScore}%). Final review is underway.`,
      type: 'info',
      sender: 'Automated Compliance Engine',
      readBy: [],
      createdAt: new Date().toISOString()
    });

    res.json({
      message: 'KYC documents received and analyzed successfully.',
      submission
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process KYC submission.' });
  }
});

// ============================================================================
// ADMINISTRATIVE COMPLIANCE DESK ROUTES (Admin Guarded)
// ============================================================================

// 3. GET /api/kyc/admin/submissions - List all submissions with optional status filter
router.get('/admin/submissions', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let submissions = db.getAllKycSubmissions();

    if (status && typeof status === 'string' && status !== 'all') {
      submissions = submissions.filter(s => s.status === status);
    }

    res.json({
      total: submissions.length,
      submissions
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch compliance submissions.' });
  }
});

// 4. GET /api/kyc/admin/submissions/:id - Single submission details with full OCR
router.get('/admin/submissions/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sub = db.getKycSubmissionById(id);
    if (!sub) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    res.json(sub);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve submission.' });
  }
});

// 5. POST /api/kyc/admin/submissions/:id/approve - Approve KYC Verification
router.post('/admin/submissions/:id/approve', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewer = req.user?.userId ? db.getUserById(req.user.userId) : null;
    const reviewerName = reviewer?.name || 'Compliance Officer';

    const updated = db.updateKycSubmissionStatus(id, 'verified', undefined, notes, reviewerName);
    if (!updated) {
      res.status(404).json({ error: 'Submission record not found.' });
      return;
    }

    res.json({
      message: `Verification for ${updated.userName} approved successfully. Level 2 status granted and any active KYC holds released.`,
      submission: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve verification.' });
  }
});

// 6. POST /api/kyc/admin/submissions/:id/reject - Reject KYC with Specific Reason
router.post('/admin/submissions/:id/reject', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'A specific rejection reason is required.' });
      return;
    }

    const reviewer = req.user?.userId ? db.getUserById(req.user.userId) : null;
    const reviewerName = reviewer?.name || 'Compliance Officer';
    const updated = db.updateKycSubmissionStatus(id, 'rejected', reason.trim(), notes, reviewerName);

    if (!updated) {
      res.status(404).json({ error: 'Submission record not found.' });
      return;
    }

    res.json({
      message: `Verification for ${updated.userName} rejected. Reason dispatched to user.`,
      submission: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject verification.' });
  }
});

// 7. POST /api/kyc/admin/users/:id/force-reverification - Force New Verification on a User
router.post('/admin/users/:id/force-reverification', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'A valid regulatory or risk rationale is required.' });
      return;
    }

    const success = db.forceUserReverification(id, reason.trim());
    if (!success) {
      res.status(404).json({ error: 'User record not found.' });
      return;
    }

    res.json({
      message: `Re-verification forced for user ${id}. Account flagged and investor notified.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to force re-verification.' });
  }
});

// 8. POST /api/kyc/admin/transactions/:id/pend-kyc - Pend Transaction for Verification Issues
router.post('/admin/transactions/:id/pend-kyc', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'A specific hold reason must be provided.' });
      return;
    }

    const tx = db.pendTransactionForKyc(id, reason.trim());
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    res.json({
      message: `Transaction ${id} successfully placed on KYC Compliance Hold.`,
      transaction: tx
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to place transaction on KYC hold.' });
  }
});

// 9. POST /api/kyc/admin/transactions/:id/release-kyc - Release KYC Hold on Transaction
router.post('/admin/transactions/:id/release-kyc', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tx = db.releaseTransactionKycHold(id);
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    res.json({
      message: `KYC hold cleared for transaction ${id}. Returned to standard settlement queue.`,
      transaction: tx
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to release KYC hold.' });
  }
});

export default router;
