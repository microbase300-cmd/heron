import { Router, Request, Response } from 'express';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                      INTENT DEFINITIONS & KNOWLEDGE BASE                   */
/* -------------------------------------------------------------------------- */

interface IntentHandler {
  id: string;
  patterns: (string | RegExp)[];
  responses: string[];
  followUps?: string[];
  supportRequired?: boolean;
}

const INTENTS: IntentHandler[] = [
  // 1. GREETINGS & CASUAL INTERACTION
  {
    id: 'greeting',
    patterns: [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo|sup|howdy)(\b|!|\?)/i,
      'hello there',
      'hi there',
      'anyone here',
      'is anyone online'
    ],
    responses: [
      "Hello! Welcome to Heron Assets Trustee. How may I assist your portfolio today? You can ask me about our investment tiers, how to deposit or withdraw, our multi-sig security, or the affiliate program.",
      "Greetings! I am your Heron AI Concierge. Are you looking to explore our investment yield tiers, deposit funds, or review account security?",
      "Hello there! I'm here to assist you with all information regarding Heron Trustee services. What can I help you check today?"
    ],
    followUps: ["What investment tiers do you have?", "How do I deposit?", "What are the withdrawal rules?"]
  },

  // 2. BOT IDENTITY & ROLE
  {
    id: 'identity',
    patterns: [
      /who are you/i,
      /what are you/i,
      /what is your name/i,
      /are you a bot/i,
      /are you ai/i,
      /are you human/i,
      /what can you do/i,
      /how can you help/i
    ],
    responses: [
      "I am the Heron Institutional AI Concierge, dedicated to helping investors navigate our yield mandates, deposit & withdrawal steps, cold-custody safety measures, and partner incentives.",
      "I am Heron's 24/7 AI Trustee Assistant. I can guide you through our four investment packages, fund management protocols, wallet whitelist setups, and connect you with human support whenever needed."
    ],
    followUps: ["Tell me about investment plans", "How are funds protected?"]
  },

  // 3. ABOUT HERON / COMPANY OVERVIEW
  {
    id: 'company_about',
    patterns: [
      /what is heron/i,
      /about heron/i,
      /tell me about (the )?company/i,
      /who owns heron/i,
      /where is heron located/i,
      /what does (this )?company do/i,
      /about your platform/i
    ],
    responses: [
      "Heron Assets Trustee is an institutional digital asset stewardship firm. We specialize in automated escrow-backed yield compounding across high-liquidity decentralized markets, protected by multi-signature cold custody.",
      "At Heron Assets Trustee, we combine disciplined asset management strategies with transparent reporting and automated smart-escrow compounding for private and institutional crypto investors."
    ],
    followUps: ["What are your investment plans?", "How do I get started?"]
  },

  // 4. SPECIFIC PLAN: AMATEUR
  {
    id: 'plan_amateur',
    patterns: [
      /amateur plan/i,
      /amateur tier/i,
      /100 dollar/i,
      /minimum investment/i,
      /min deposit/i,
      /starter plan/i,
      /cheapest plan/i
    ],
    responses: [
      "The Amateur Plan is our entry-level tier:\n• Minimum Capital: $100\n• Expected Yield: 4.5%\n• Duration: 24 Hours\n• Payout: Automated at maturity directly to your wallet or balance.",
      "Starting with the Amateur Plan requires only $100. It yields 4.5% over a 24-hour cycle, making it ideal for testing our automated compounding flow."
    ],
    followUps: ["How do I deposit $100?", "What is the Standard Plan?"]
  },

  // 5. SPECIFIC PLAN: STANDARD
  {
    id: 'plan_standard',
    patterns: [
      /standard plan/i,
      /standard tier/i,
      /2000 dollar/i,
      /2,000/i
    ],
    responses: [
      "The Standard Plan offers enhanced returns for active capital:\n• Minimum Capital: $2,000\n• Expected Yield: 9.5%\n• Duration: 48 Hours\n• Auto-settlement at cycle end.",
      "Under the Standard Plan ($2,000 minimum), your allocation generates 9.5% net yield across a 48-hour management mandate."
    ],
    followUps: ["View all plans", "How to deposit USDT?"]
  },

  // 6. SPECIFIC PLAN: PREMIUM
  {
    id: 'plan_premium',
    patterns: [
      /premium plan/i,
      /premium tier/i,
      /6000 dollar/i,
      /6,000/i
    ],
    responses: [
      "The Premium Plan is designed for high-yield portfolio expansion:\n• Minimum Capital: $6,000\n• Expected Yield: 15.5%\n• Duration: 72 Hours\n• Priority cold-vault settlement.",
      "The Premium Plan requires a $6,000 minimum allocation and delivers a 15.5% yield return over 72 hours."
    ],
    followUps: ["View Retirement Plan", "How are profits withdrawn?"]
  },

  // 7. SPECIFIC PLAN: RETIREMENT
  {
    id: 'plan_retirement',
    patterns: [
      /retirement plan/i,
      /retirement tier/i,
      /11000/i,
      /11,000/i,
      /pension/i,
      /highest yield/i,
      /best plan/i,
      /max plan/i
    ],
    responses: [
      "Our premier tier is the Retirement Plan:\n• Minimum Capital: $11,000\n• Expected Yield: 22.5%\n• Duration: 96 Hours\n• Dedicated liquidity pipeline & priority escrow status.",
      "The Retirement Plan is our top institutional tier ($11,000 minimum) providing a 22.5% yield over 96 hours with continuous compound protection."
    ],
    followUps: ["How do I deposit funds?", "Are funds guaranteed?"]
  },

  // 8. ALL PLANS SUMMARY
  {
    id: 'plans_all',
    patterns: [
      /plans/i,
      /packages/i,
      /tiers/i,
      /rates/i,
      /how much can i earn/i,
      /what are the returns/i,
      /roi/i,
      /yields/i,
      /investment options/i
    ],
    responses: [
      "Heron Assets Trustee offers four structured investment tiers:\n\n1. Amateur Plan: Min $100 | 4.5% yield (24h)\n2. Standard Plan: Min $2,000 | 9.5% yield (48h)\n3. Premium Plan: Min $6,000 | 15.5% yield (72h)\n4. Retirement Plan: Min $11,000 | 22.5% yield (96h)\n\nAll tiers feature automated smart-contract maturity and 0% withdrawal fees.",
      "We manage 4 risk-adjusted tiers ranging from the Amateur Plan ($100 at 4.5% in 24h) up to the Retirement Plan ($11,000 at 22.5% in 96h). Would you like specific details on any of these?"
    ],
    followUps: ["How do I deposit?", "What is the Amateur Plan?", "How does withdrawal work?"]
  },

  // 9. HOW TO DEPOSIT
  {
    id: 'deposit_process',
    patterns: [
      /how (do|can) i deposit/i,
      /deposit steps/i,
      /how to add (funds|money|crypto)/i,
      /how to invest/i,
      /where do i send/i,
      /wallet address/i,
      /crypto deposit/i,
      /accepted (coins|crypto|currencies)/i
    ],
    responses: [
      "Depositing capital is quick and automated:\n1. Log into your dashboard (https://app.stealthssolutions.com).\n2. Click 'Deposit Capital'.\n3. Choose your asset: USDT (TRC20/ERC20), BTC, ETH, or SOL.\n4. Transfer the amount to the provided wallet address.\n5. Click 'I Have Made Deposit' to initiate instant ledger confirmation.",
      "To fund your account, navigate to 'Deposit Capital' in your dashboard, copy your designated receiving address (USDT, Bitcoin, Ethereum, or Solana), complete the transaction, and submit the notice. The settlement desk automatically credits verified transfers."
    ],
    followUps: ["Which coins are accepted?", "How long does deposit take?"]
  },

  // 10. DEPOSIT TIME / PENDING STATUS
  {
    id: 'deposit_speed',
    patterns: [
      /how long (does|for) deposit/i,
      /deposit confirmation time/i,
      /pending deposit/i,
      /deposit pending/i,
      /not received deposit/i
    ],
    responses: [
      "Crypto deposits are typically confirmed within 5 to 30 minutes, depending on blockchain network traffic (USDT-TRC20 and SOL are usually fastest). You will see a live 'Deposit in Progress' modal while nodes confirm the block.",
      "Blockchain confirmations generally clear in 10-20 minutes. Please keep your transaction ID (TXID) handy. If a deposit takes longer than 1 hour, our support team can verify the ledger manually."
    ],
    followUps: ["Contact Human Support", "How to withdraw?"]
  },

  // 11. WITHDRAWAL PROCESS & RULES
  {
    id: 'withdraw_process',
    patterns: [
      /how (do|can) i withdraw/i,
      /withdrawal steps/i,
      /cashout/i,
      /payout/i,
      /get my money/i,
      /withdrawal fee/i,
      /minimum withdrawal/i
    ],
    responses: [
      "Withdrawals are seamless and zero-fee:\n1. Open 'Withdraw Terminal' on your dashboard.\n2. Input the payout amount and your destination wallet address.\n3. A 6-digit one-time security OTP will be dispatched to your registered email.\n4. Enter the OTP to authorize release; funds disburse automatically.",
      "You can withdraw accrued yield or principal at any time with 0% settlement fees. For institutional security, every withdrawal requires an email verification code (OTP) before automated release to your destination wallet."
    ],
    followUps: ["Is there a withdrawal fee?", "How long does withdrawal take?"]
  },

  // 12. WITHDRAWAL TIME
  {
    id: 'withdraw_speed',
    patterns: [
      /how long (does|for) withdraw/i,
      /instant withdraw/i,
      /when will i receive (my )?withdrawal/i
    ],
    responses: [
      "Once authorized via your email OTP, withdrawal transactions are queued to our hot/warm disbursement gateway and typically arrive within 15 to 45 minutes.",
      "Most withdrawals arrive in under 30 minutes following OTP verification. Network conditions on Bitcoin or Ethereum may occasionally cause minor block delays."
    ],
    followUps: ["Contact Support", "What are the security safeguards?"]
  },

  // 13. SECURITY & CUSTODY
  {
    id: 'security_custody',
    patterns: [
      /security/i,
      /is it safe/i,
      /are my funds safe/i,
      /custody/i,
      /cold storage/i,
      /insurance/i,
      /hack/i,
      /legit/i,
      /scam/i
    ],
    responses: [
      "Security is our primary institutional pillar:\n• 100% of client capital is sequestered in offline multi-signature cold custody vaults.\n• Withdrawals and sensitive profile updates require multi-factor email OTP authorization.\n• Strict end-to-end SSL/TLS encryption and audited smart escrow contracts.",
      "We operate an institutional cold-storage model where the majority of reserves remain in distributed hardware enclaves. No individual employee can authorize a transaction unilaterally."
    ],
    followUps: ["Tell me about KYC", "What are your investment plans?"]
  },

  // 14. AFFILIATE / REFERRAL PROGRAM
  {
    id: 'affiliate_referral',
    patterns: [
      /referral/i,
      /affiliate/i,
      /invite/i,
      /commission/i,
      /partner program/i,
      /earn without investing/i
    ],
    responses: [
      "Our Affiliate Partner Network allows you to earn up to 30% instant commission when your referred clients deposit into any plan. You can find your personal referral link in the 'Affiliate Network' tab on your dashboard.",
      "Yes! You can share your custom invitation link with partners and colleagues. When they fund an investment package, commissions are credited directly to your settlement ledger immediately."
    ],
    followUps: ["Where do I find my referral link?", "What are the investment plans?"]
  },

  // 15. KYC / VERIFICATION
  {
    id: 'kyc_verification',
    patterns: [
      /kyc/i,
      /verify identity/i,
      /id verification/i,
      /passport/i,
      /documents/i,
      /is kyc required/i
    ],
    responses: [
      "KYC verification can be completed directly in your dashboard under 'Account & Security' -> 'KYC Verification Desk'. Simply upload a clear government-issued photo ID or passport for regulatory compliance approval.",
      "To comply with international anti-money laundering standards, investors can submit identity verification in the KYC portal. Approvals are typically processed within 2 to 6 business hours."
    ],
    followUps: ["How to deposit?", "Contact Support"]
  },

  // 16. CONTACT HUMAN SUPPORT / ESCALATION
  {
    id: 'support_contact',
    patterns: [
      /contact (human|support|admin|help|team|desk)/i,
      /human support/i,
      /speak to a person/i,
      /talk to (someone|human|agent)/i,
      /email address/i,
      /customer service/i,
      /support email/i
    ],
    responses: [
      "Our human support desk is available 24/7. You can email us directly at support@stealthssolutions.com or click the 'Contact Human Support Desk' button below to open an immediate email draft.",
      "If you need specialized account assistance, transaction investigations, or private wealth advisory, please reach out to support@stealthssolutions.com. An institutional specialist will respond promptly."
    ],
    supportRequired: true,
    followUps: ["What plans do you offer?", "How do I deposit?"]
  },

  // 17. GRATITUDE / COURTESY
  {
    id: 'courtesy',
    patterns: [
      /^(thanks|thank you|thx|appreciate it|great|awesome|cool|perfect|good job)(\b|!)/i
    ],
    responses: [
      "You're very welcome! If there's anything else about Heron Assets Trustee you'd like to check, just let me know. Have a productive trading day!",
      "Glad I could assist you! Feel free to ask anytime if you need help with your investments or transactions.",
      "My pleasure! Let me know if you need help funding an account or exploring our packages."
    ],
    followUps: ["View all plans", "How to deposit?"]
  }
];

const FALLBACK_RESPONSES = [
  "I am the Heron AI Concierge. While I am well versed in Heron's 4 investment plans, deposit protocols, 0%-fee withdrawals, and cold-storage security, I didn't quite catch the specifics of your request. Could you rephrase, or would you like to speak to our human support desk?",
  "I couldn't locate a precise answer in our institutional documentation for that question. For personalized assistance or account-specific inquiries, our human support team is ready to help at support@stealthssolutions.com.",
  "That appears to be outside my immediate platform knowledge base. If this is regarding a specific account balance or technical question, please click below to contact our support desk directly."
];

/* -------------------------------------------------------------------------- */
/*                      CONVERSATIONAL INTENT MATCHER                         */
/* -------------------------------------------------------------------------- */

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post('/chat', (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const cleaned = message.trim();
    if (!cleaned) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    // Match intents with score ranking
    let bestIntent: IntentHandler | null = null;
    let highestScore = 0;

    for (const intent of INTENTS) {
      let score = 0;
      for (const pattern of intent.patterns) {
        if (pattern instanceof RegExp) {
          if (pattern.test(cleaned)) {
            score += 4; // Regex pattern match has high confidence
          }
        } else {
          const lowerPattern = pattern.toLowerCase();
          const lowerMsg = cleaned.toLowerCase();
          if (lowerMsg === lowerPattern) {
            score += 5; // Exact match
          } else if (lowerMsg.includes(lowerPattern)) {
            score += 2; // Substring match
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestIntent = intent;
      }
    }

    if (bestIntent && highestScore > 0) {
      const reply = getRandomElement(bestIntent.responses);
      res.json({
        reply,
        matched: true,
        supportRequired: !!bestIntent.supportRequired,
        suggestions: bestIntent.followUps || []
      });
    } else {
      const fallback = getRandomElement(FALLBACK_RESPONSES);
      res.json({
        reply: fallback,
        matched: false,
        supportRequired: true,
        suggestions: ["What investment tiers do you have?", "How do I deposit funds?", "How are assets secured?"]
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'AI Assistant processing error.' });
  }
});

export default router;
