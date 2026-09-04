import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Investment, Transaction, ReferralCommission, PlanConfig, PlanId } from '../types';

export const PLANS: Record<PlanId, PlanConfig> = {
  amateur: {
    id: 'amateur',
    name: 'Amateur Plan',
    min: 100,
    max: 1999,
    durationHours: 24,
    rate: 0.045, // 4.5%
    referralRate: 0.08, // 8%
    description: 'Foundational 24-hour cycle with guaranteed capital & yield release.',
    badge: '24h • 4.5%'
  },
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    min: 2000,
    max: 5999,
    durationHours: 48,
    rate: 0.095, // 9.5%
    referralRate: 0.16, // 16%
    description: 'Balanced accumulation over 48 hours with priority queue allocation.',
    badge: '48h • 9.5%'
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    min: 6000,
    max: 10999,
    durationHours: 72,
    rate: 0.155, // 15.5%
    referralRate: 0.24, // 24%
    description: 'High-velocity institutional yield with dedicated VIP risk mitigation officer.',
    badge: '72h • 15.5%'
  },
  retirement: {
    id: 'retirement',
    name: 'Retirement Plan',
    min: 11000,
    max: Infinity,
    durationHours: 96,
    rate: 0.225, // 22.5%
    referralRate: 0.30, // 30%
    description: 'Sovereign reserve tier with maximum compounding power and uncapped limits.',
    badge: '96h • 22.5%'
  }
};

interface DatabaseSchema {
  users: User[];
  investments: Investment[];
  transactions: Transaction[];
  referralCommissions: ReferralCommission[];
}

const DB_FILE = path.join(__dirname, '../../data/db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db.json, reinitializing...', err);
    }
    const initial = this.seedInitial();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const d = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json', err);
    }
  }

  private seedInitial(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Heron2026!', salt);

    const now = Date.now();
    const demoUser: User = {
      id: 'usr_demo_882194',
      email: 'investor@heronassets.com',
      name: 'Alexander Sterling',
      passwordHash: demoPasswordHash,
      balance: 14500.00,
      referralCode: 'HERON-8821',
      referredBy: null,
      createdAt: new Date(now - 86400000 * 5).toISOString()
    };

    const referrerUser: User = {
      id: 'usr_downline_49201',
      email: 'clara.vance@genevacapital.ch',
      name: 'Clara Vance',
      passwordHash: demoPasswordHash,
      balance: 3200.00,
      referralCode: 'CLARA-9921',
      referredBy: 'HERON-8821',
      createdAt: new Date(now - 86400000 * 3).toISOString()
    };

    // Active investment for demo: Premium Plan ($8,000) started 20 hours ago, matures in 52 hours
    const activeInvestment: Investment = {
      id: 'inv_prem_9381',
      userId: demoUser.id,
      planId: 'premium',
      planName: 'Premium Plan',
      amount: 8000.00,
      rate: 0.155,
      durationHours: 72,
      expectedProfit: 1240.00,
      totalPayout: 9240.00,
      status: 'active',
      startedAt: new Date(now - 3600000 * 20).toISOString(),
      expiresAt: new Date(now + 3600000 * 52).toISOString(),
      completedAt: null
    };

    // Completed investment: Standard Plan ($3,000) completed yesterday
    const completedInvestment: Investment = {
      id: 'inv_std_4120',
      userId: demoUser.id,
      planId: 'standard',
      planName: 'Standard Plan',
      amount: 3000.00,
      rate: 0.095,
      durationHours: 48,
      expectedProfit: 285.00,
      totalPayout: 3285.00,
      status: 'completed',
      startedAt: new Date(now - 3600000 * 50).toISOString(),
      expiresAt: new Date(now - 3600000 * 2).toISOString(),
      completedAt: new Date(now - 3600000 * 2).toISOString()
    };

    const transactions: Transaction[] = [
      {
        id: 'tx_dep_109284',
        userId: demoUser.id,
        type: 'deposit',
        amount: 25000.00,
        asset: 'USDT',
        status: 'completed',
        txHash: '0x8f29c91d4e680a7114b03512e99d1469e71239aa8cf01b54a29c629811f0082a',
        note: 'Deposit via TRC-20 Smart Contract',
        createdAt: new Date(now - 86400000 * 4).toISOString()
      },
      {
        id: 'tx_inv_lock_01',
        userId: demoUser.id,
        type: 'investment_lock',
        amount: 3000.00,
        asset: 'USD',
        status: 'completed',
        txHash: '0x10b741ad5c2901a8efbc01289547aa2810a9bf4910cf91a823bf902840182741',
        note: 'Allocated to Standard Plan (48h)',
        createdAt: new Date(now - 3600000 * 50).toISOString()
      },
      {
        id: 'tx_yield_01',
        userId: demoUser.id,
        type: 'yield_payout',
        amount: 3285.00,
        asset: 'USD',
        status: 'completed',
        txHash: '0x991a0c88ef290bca2957110195ab47c819a82bbef49910cf91a823bf90184719',
        note: 'Standard Plan Matured: Principal $3,000 + Yield $285',
        createdAt: new Date(now - 3600000 * 2).toISOString()
      },
      {
        id: 'tx_inv_lock_02',
        userId: demoUser.id,
        type: 'investment_lock',
        amount: 8000.00,
        asset: 'USD',
        status: 'completed',
        txHash: '0x33cf81b10a2894ca91028374928174aa910cbe88102819cf8192801928472918',
        note: 'Allocated to Premium Plan (72h)',
        createdAt: new Date(now - 3600000 * 20).toISOString()
      },
      {
        id: 'tx_ref_01',
        userId: demoUser.id,
        type: 'referral_bonus',
        amount: 320.00,
        asset: 'USD',
        status: 'completed',
        txHash: '0x77ab102948ca9182740182739481726354819201948271049281740294817263',
        note: 'Referral Bonus: Clara Vance invested in Standard Plan (16% of $2,000)',
        createdAt: new Date(now - 86400000 * 2).toISOString()
      }
    ];

    const referralCommissions: ReferralCommission[] = [
      {
        id: 'ref_comm_101',
        referrerId: demoUser.id,
        referredUserId: referrerUser.id,
        referredUserEmail: referrerUser.email,
        planId: 'standard',
        depositAmount: 2000.00,
        rate: 0.16,
        commissionAmount: 320.00,
        createdAt: new Date(now - 86400000 * 2).toISOString()
      }
    ];

    return {
      users: [demoUser, referrerUser],
      investments: [activeInvestment, completedInvestment],
      transactions,
      referralCommissions
    };
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByReferralCode(code: string): User | undefined {
    return this.data.users.find(u => u.referralCode.toUpperCase() === code.toUpperCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUserBalance(userId: string, newBalance: number): void {
    const user = this.getUserById(userId);
    if (user) {
      user.balance = Math.max(0, Number(newBalance.toFixed(2)));
      this.save();
    }
  }

  // Investments
  getInvestmentsByUserId(userId: string): Investment[] {
    return this.data.investments.filter(i => i.userId === userId);
  }

  getAllActiveInvestments(): Investment[] {
    return this.data.investments.filter(i => i.status === 'active');
  }

  createInvestment(investment: Investment): Investment {
    this.data.investments.push(investment);
    this.save();
    return investment;
  }

  completeInvestment(investmentId: string): void {
    const inv = this.data.investments.find(i => i.id === investmentId);
    if (inv) {
      inv.status = 'completed';
      inv.completedAt = new Date().toISOString();
      this.save();
    }
  }

  // Transactions
  getTransactionsByUserId(userId: string): Transaction[] {
    return this.data.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createTransaction(tx: Transaction): Transaction {
    this.data.transactions.push(tx);
    this.save();
    return tx;
  }

  // Referrals
  getReferralCommissionsByReferrerId(referrerId: string): ReferralCommission[] {
    return this.data.referralCommissions.filter(r => r.referrerId === referrerId);
  }

  getReferredUsers(referralCode: string): User[] {
    return this.data.users.filter(u => u.referredBy?.toUpperCase() === referralCode.toUpperCase());
  }

  createReferralCommission(comm: ReferralCommission): ReferralCommission {
    this.data.referralCommissions.push(comm);
    this.save();
    return comm;
  }
}

export const db = new DatabaseService();
