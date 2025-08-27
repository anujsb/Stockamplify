-- Populate database with subscription system data
-- Run this in your database to set up the subscription system

-- Step 1: Insert plans
INSERT INTO plans (id, name, description, active, created_at, updated_at) 
VALUES 
  (1, 'free', 'Free plan with limited access', true, NOW(), NOW()),
  (2, 'basic', 'Basic plan for regular investors', true, NOW(), NOW()),
  (3, 'premium', 'Full access with advance features', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Step 2: Insert features
INSERT INTO features (id, code, name, description, created_at) 
VALUES 
  (1, 'PORTFOLIO', 'Portfolio Management', 'Comprehensive portfolio tracking and performance insights', NOW()),
  (2, 'AI_ANALYSIS', 'AI Stock Analytics', 'Advanced AI-driven market analysis and stock insights', NOW()),
  (3, 'MARKET_NEWS', 'Market News', 'Latest financial news and market updates', NOW()),
  (4, 'STOCK_SEARCH', 'Stock Search', 'Advanced stock discovery and exploration tools', NOW())
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Step 3: Insert plan features (quotas)
INSERT INTO plan_features (id, plan_id, feature_id, quota, reset_interval, created_at, updated_at) 
VALUES 
  -- Free plan features
  (1, 1, 1, 1, 'monthly', NOW(), NOW()),
  (2, 1, 2, 10, 'daily', NOW(), NOW()),
  (3, 1, 4, 10, 'daily', NOW(), NOW()),
  (4, 1, 3, 10, 'daily', NOW(), NOW()),
  
  -- Basic plan features
  (5, 2, 1, 3, 'monthly', NOW(), NOW()),
  (6, 2, 2, 20, 'daily', NOW(), NOW()),
  (7, 2, 4, 50, 'daily', NOW(), NOW()),
  (8, 2, 3, 100, 'daily', NOW(), NOW()),
  
  -- Premium plan features
  (9, 3, 1, 10, 'monthly', NOW(), NOW()),
  (10, 3, 2, 50, 'daily', NOW(), NOW()),
  (11, 3, 4, 100, 'daily', NOW(), NOW()),
  (12, 3, 3, 500, 'daily', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  feature_id = EXCLUDED.feature_id,
  quota = EXCLUDED.quota,
  reset_interval = EXCLUDED.reset_interval,
  updated_at = NOW();

-- Step 4: Create subscriptions for existing users who don't have one
INSERT INTO subscriptions (user_id, plan_id, type, start_date, end_date, created_at)
SELECT 
  u.id,
  1, -- free plan
  'monthly',
  CURRENT_DATE,
  '2099-12-31',
  NOW()
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE s.id IS NULL;

-- Step 5: Verify the setup
SELECT 'Database populated successfully!' as status;

-- Check the data
SELECT 'Plans:' as info;
SELECT * FROM plans;

SELECT 'Features:' as info;
SELECT * FROM features;

SELECT 'Plan Features:' as info;
SELECT 
  pf.id,
  p.name as plan_name,
  f.name as feature_name,
  pf.quota,
  pf.reset_interval
FROM plan_features pf
JOIN plans p ON pf.plan_id = p.id
JOIN features f ON pf.feature_id = f.id
ORDER BY pf.id;

SELECT 'User Subscriptions:' as info;
SELECT 
  s.id,
  u.email,
  p.name as plan_name,
  s.start_date,
  s.end_date
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id
ORDER BY s.id;
