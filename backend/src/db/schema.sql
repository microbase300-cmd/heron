-- PostgreSQL Production Schema for Heron Institutional Digital Capital Platform

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user', -- 'user' | 'admin' | 'compliance'
    balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Refresh Tokens Table (Token Rotation & Revocation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Plan Configurations Table
CREATE TABLE IF NOT EXISTS plan_configs (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    min_amount NUMERIC(18, 2) NOT NULL,
    max_amount NUMERIC(18, 2) NOT NULL,
    duration_hours INTEGER NOT NULL,
    rate NUMERIC(8, 4) NOT NULL, -- e.g. 0.0450 for 4.5%
    referral_rate NUMERIC(8, 4) NOT NULL, -- e.g. 0.0800 for 8%
    description TEXT NOT NULL,
    badge VARCHAR(32) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(32) NOT NULL REFERENCES plan_configs(id),
    plan_name VARCHAR(64) NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    rate NUMERIC(8, 4) NOT NULL,
    duration_hours INTEGER NOT NULL,
    expected_profit NUMERIC(18, 2) NOT NULL,
    total_payout NUMERIC(18, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Transactions / Immutable Ledger Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL, -- 'deposit' | 'withdrawal' | 'yield_payout' | 'referral_bonus' | 'investment_lock' | 'admin_adjustment'
    amount NUMERIC(18, 2) NOT NULL,
    asset VARCHAR(16) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'completed', -- 'completed' | 'pending' | 'rejected'
    tx_hash VARCHAR(128) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Referral Commissions Table
CREATE TABLE IF NOT EXISTS referral_commissions (
    id VARCHAR(64) PRIMARY KEY,
    referrer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_email VARCHAR(255) NOT NULL,
    plan_id VARCHAR(32) NOT NULL REFERENCES plan_configs(id),
    deposit_amount NUMERIC(18, 2) NOT NULL,
    rate NUMERIC(8, 4) NOT NULL,
    commission_amount NUMERIC(18, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Platform Notifications & Executive Dispatches Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE, -- NULL for platform broadcast
    target_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'announcement', -- 'announcement' | 'alert' | 'info' | 'success'
    sender VARCHAR(128) NOT NULL DEFAULT 'Chief Risk Officer',
    read_by JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Platform Deposit Receiving Addresses Table
CREATE TABLE IF NOT EXISTS deposit_addresses (
    key VARCHAR(64) PRIMARY KEY,
    asset VARCHAR(32) NOT NULL,
    network VARCHAR(64) NOT NULL,
    address VARCHAR(255) NOT NULL,
    memo VARCHAR(128),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Two-Factor OTP Security Records Table
CREATE TABLE IF NOT EXISTS otp_codes (
    email VARCHAR(255) NOT NULL,
    code VARCHAR(16) NOT NULL,
    purpose VARCHAR(32) NOT NULL, -- 'registration' | 'withdrawal'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, purpose)
);

-- Indices for rapid querying and performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_email ON notifications(target_email);
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_is_active ON deposit_addresses(is_active);
