-- Seed Data for Heron Digital Capital Platform

-- 1. Insert Default Plan Configurations
INSERT INTO plan_configs (id, name, min_amount, max_amount, duration_hours, rate, referral_rate, description, badge, is_active)
VALUES
('amateur', 'Amateur Plan', 100.00, 1999.00, 24, 0.0450, 0.0800, 'Foundational 24-hour cycle with guaranteed capital & yield release.', '24h • 4.5%', true),
('standard', 'Standard Plan', 2000.00, 5999.00, 48, 0.0950, 0.1600, 'Balanced accumulation over 48 hours with priority queue allocation.', '48h • 9.5%', true),
('premium', 'Premium Plan', 6000.00, 10999.00, 72, 0.1550, 0.2400, 'High-velocity institutional yield with dedicated VIP risk mitigation officer.', '72h • 15.5%', true),
('retirement', 'Retirement Plan', 11000.00, 10000000.00, 96, 0.2250, 0.3000, 'Sovereign reserve tier with maximum compounding power and uncapped limits.', '96h • 22.5%', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    min_amount = EXCLUDED.min_amount,
    max_amount = EXCLUDED.max_amount,
    duration_hours = EXCLUDED.duration_hours,
    rate = EXCLUDED.rate,
    referral_rate = EXCLUDED.referral_rate,
    description = EXCLUDED.description,
    badge = EXCLUDED.badge;

-- 2. Insert Default Deposit Receiving Addresses
INSERT INTO deposit_addresses (key, asset, network, address, is_active, updated_at)
VALUES
('USDT_TRC20', 'USDT', 'Tron (TRC-20)', 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a', true, NOW()),
('USDT_ERC20', 'USDT', 'Ethereum (ERC-20)', '0x882194f8a7e6d5c4b3a201948572615049382710', true, NOW()),
('BTC', 'BTC', 'Bitcoin Native SegWit', 'bc1q9d8a7f6e5c4b3a201948572615049382710082', true, NOW()),
('ETH', 'ETH', 'Ethereum Mainnet', '0x882194f8a7e6d5c4b3a201948572615049382710', true, NOW()),
('SOL', 'SOL', 'Solana SPL', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', true, NOW())
ON CONFLICT (key) DO NOTHING;

-- 3. Insert Default Admin (Password: Heron2026!)
INSERT INTO users (id, email, name, password_hash, role, balance, referral_code, referred_by, status, created_at)
VALUES
('usr_admin_001', 'admin@heronassets.com', 'Chief Risk Officer', '$2a$10$s.jCimbuHB3TQwMko5JjDuCmkh65wAXmfcRwlevbzMLOqX6bY5aoC', 'admin', 0.00, 'HERON-ADMIN', NULL, 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Insert Default Welcoming Broadcast Notification
INSERT INTO notifications (id, user_id, target_email, title, message, type, sender, read_by, created_at)
VALUES
('notif_welcome_01', NULL, NULL, 'Institutional Smart Contract Protocol Activated', 'Welcome to Heron Digital Capital. Programmatic yield disbursals and cold-custody vault protections are fully active for the 2026 fiscal cycle.', 'announcement', 'Chief Risk Officer', '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
