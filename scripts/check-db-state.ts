// scripts/check-db-state.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check plans table
    console.log('📋 Plans table:');
    const plans = await db.execute(sql`SELECT * FROM plans ORDER BY id`);
    console.log(plans.rows);
    console.log('');

    // Check features table
    console.log('🔧 Features table:');
    const features = await db.execute(sql`SELECT * FROM features ORDER BY id`);
    console.log(features.rows);
    console.log('');

    // Check plan_features table
    console.log('📊 Plan Features table:');
    const planFeatures = await db.execute(sql`
      SELECT pf.id, p.name as plan_name, f.name as feature_name, pf.quota, pf.reset_interval
      FROM plan_features pf
      JOIN plans p ON pf.plan_id = p.id
      JOIN features f ON pf.feature_id = f.id
      ORDER BY pf.id
    `);
    console.log(planFeatures.rows);
    console.log('');

    // Check users table
    console.log('👥 Users table (first 5):');
    const users = await db.execute(sql`
      SELECT u.id, u.email, u.default_plan_id, p.name as plan_name
      FROM users u
      LEFT JOIN plans p ON u.default_plan_id = p.id
      ORDER BY u.id
      LIMIT 5
    `);
    console.log(users.rows);
    console.log('');

    // Check subscriptions table
    console.log('💳 Subscriptions table (first 5):');
    const subscriptions = await db.execute(sql`
      SELECT s.id, s.user_id, s.plan_id, s.type, s.start_date, s.end_date, p.name as plan_name
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.id
      LIMIT 5
    `);
    console.log(subscriptions.rows);
    console.log('');

    // Count users without default plans
    console.log('❌ Users without default plans:');
    const usersWithoutPlan = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE default_plan_id IS NULL
    `);
    console.log(usersWithoutPlan.rows[0]);
    console.log('');

    console.log('✅ Database state check completed!');

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  }
}

checkDatabaseState()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
