import { Router, Request, Response } from 'express';

const router = Router();

// Platform Knowledgebase for Heron AI Trustee Assistant
const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['who', 'what is heron', 'company', 'about', 'platform', 'trustee'],
    answer: 'Heron Assets Trustee is an institutional digital asset wealth management platform. We provide automated smart escrow investment mandates with guaranteed yield compounding and 100% cold-custody security.'
  },
  {
    keywords: ['plan', 'investment', 'packages', 'tier', 'yield', 'rate', 'duration', 'amateur', 'standard', 'premium', 'retirement'],
    answer: 'We offer 4 institutional investment tiers:\n• Amateur Plan: Min $100 | 4.5% yield in 24 Hours\n• Standard Plan: Min $2,000 | 9.5% yield in 48 Hours\n• Premium Plan: Min $6,000 | 15.5% yield in 72 Hours\n• Retirement Plan: Min $11,000 | 22.5% yield in 96 Hours'
  },
  {
    keywords: ['deposit', 'fund', 'pay', 'crypto', 'usdt', 'btc', 'eth', 'sol', 'how to deposit'],
    answer: 'To deposit funds, click "Deposit Capital" on your dashboard. Select your asset (USDT TRC-20/ERC-20, BTC, ETH, or SOL), copy the receiving address, make the transfer, and click "I Have Made Deposit". Settlement will verify and credit your balance.'
  },
  {
    keywords: ['withdraw', 'cashout', 'payout', 'disbursement', 'how to withdraw', 'fee'],
    answer: 'Withdrawals are processed automatically to your whitelisted or destination crypto wallet. Click "Withdraw Terminal" on your dashboard, enter your amount and destination address, authorize with your 6-digit email OTP, and funds will be dispatched with 0% settlement fees.'
  },
  {
    keywords: ['security', 'safe', 'custody', 'cold', '2fa', 'otp'],
    answer: 'All client assets are stored in 100% multi-signature cold custody vaults. Account access and withdrawals require mandatory 6-digit email security OTP authorization and strict anti-phishing safeguards.'
  },
  {
    keywords: ['referral', 'affiliate', 'commission', 'bonus', 'invite'],
    answer: 'Our Partner Affiliate Network rewards up to 30% instant commission on referred client allocations. You can view your unique referral link and tracked commission in the "Affiliate Network" section.'
  },
  {
    keywords: ['kyc', 'verification', 'identity', 'passport', 'id'],
    answer: 'KYC compliance verification ensures regulatory safety. Navigate to "Account & Security" -> "KYC Verification Desk" to upload your government ID or passport for verification.'
  }
];

const DEFAULT_FALLBACK = "I am the Heron AI Trustee Assistant. I am trained on company plans, deposit/withdrawal procedures, and security protocols. For specific account issues or specialized inquiries, please click 'Contact Human Support' below or email us at support@stealthssolutions.com.";

router.post('/chat', (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const query = message.toLowerCase().trim();
    
    // Find best match in knowledge base
    let bestMatch: string | null = null;
    let maxMatchCount = 0;

    for (const item of KNOWLEDGE_BASE) {
      let count = 0;
      for (const kw of item.keywords) {
        if (query.includes(kw)) {
          count++;
        }
      }
      if (count > maxMatchCount) {
        maxMatchCount = count;
        bestMatch = item.answer;
      }
    }

    if (bestMatch && maxMatchCount > 0) {
      res.json({
        reply: bestMatch,
        matched: true,
        supportRequired: false
      });
    } else {
      res.json({
        reply: DEFAULT_FALLBACK,
        matched: false,
        supportRequired: true
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'AI Assistant processing error.' });
  }
});

export default router;
