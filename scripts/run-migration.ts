// scripts/run-migration.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    console.log('Starting subscription system migration...');

    // Step 1: Ensure plans table has the correct data
    console.log('Step 1: Setting up plans...');
    await db.execute(sql`
      INSERT INTO plans (id, name, description, active, created_at, updated_at) 
      VALUES 
        (1, 'free', 'Free plan with limited access', true, NOW(), NOW()),
        (2, 'basic', 'Basic plan for regular investors', true, NOW(), NOW()),
        (3, 'premium', 'Full access with advance features', true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        active = EXCLUDED.active,
        updated_at = NOW()
    `);

    // Step 2: Add default_plan_id column without default value
    console.log('Step 2: Adding default_plan_id column...');
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS default_plan_id integer
    `);

    // Step 3: Update existing users to have the free plan
    console.log('Step 3: Updating existing users...');
    await db.execute(sql`
      UPDATE users SET default_plan_id = 1 WHERE default_plan_id IS NULL
    `);

    // Step 4: Add the foreign key constraint
    console.log('Step 4: Adding foreign key constraint...');
    await db.execute(sql`
      ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_default_plan_id_plans_id_fk 
      FOREIGN KEY (default_plan_id) REFERENCES plans(id)
    `);

    // Step 5: Make the column NOT NULL with default value
    console.log('Step 5: Making column NOT NULL...');
    await db.execute(sql`
      ALTER TABLE users ALTER COLUMN default_plan_id SET NOT NULL
    `);
    await db.execute(sql`
      ALTER TABLE users ALTER COLUMN default_plan_id SET DEFAULT 1
    `);

    // Step 6: Ensure features table has the correct data
    console.log('Step 6: Setting up features...');
    await db.execute(sql`
      INSERT INTO features (id, code, name, description, created_at) 
      VALUES 
        (1, 'PORTFOLIO', 'Portfolio Management', 'Comprehensive portfolio tracking and performance insights', NOW()),
        (2, 'AI_ANALYSIS', 'AI Stock Analytics', 'Advanced AI-driven market analysis and stock insights', NOW()),
        (3, 'MARKET_NEWS', 'Market News', 'Latest financial news and market updates', NOW()),
        (4, 'STOCK_SEARCH', 'Stock Search', 'Advanced stock discovery and exploration tools', NOW())
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        description = EXCLUDED.description
    `);

    // Step 7: Ensure plan_features table has the correct data
    console.log('Step 7: Setting up plan features...');
    await db.execute(sql`
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
        updated_at = NOW()
    `);

    console.log('✅ Migration completed successfully!');
    console.log('✅ All users now have default plans');
    console.log('✅ Rate limiting is now functional');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
