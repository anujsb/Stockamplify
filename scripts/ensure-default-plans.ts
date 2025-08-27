// scripts/ensure-default-plans.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import { SubscriptionService } from '../src/lib/services/subscriptionService';

async function ensureDefaultPlans() {
  try {
    console.log('Starting to ensure default plans for all users...');

    // Find all users without a subscription
    const usersWithoutSubscription = await db.execute(sql`
      SELECT u.id, u.email
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE s.id IS NULL
    `);

    const usersWithoutPlan = usersWithoutSubscription.rows;

    console.log(`Found ${usersWithoutPlan.length} users without default plans`);

    if (usersWithoutPlan.length === 0) {
      console.log('All users already have default plans!');
      return;
    }

    // Assign default subscription to each user
    for (const user of usersWithoutPlan) {
      try {
        await SubscriptionService.createDefaultSubscription(Number(user.id));
        console.log(`✅ Created default subscription for user ${user.email} (ID: ${user.id})`);
      } catch (error) {
        console.error(`❌ Failed to create default subscription for user ${user.email} (ID: ${user.id}):`, error);
      }
    }

    console.log('✅ Default plan assignment completed!');

  } catch (error) {
    console.error('❌ Error ensuring default plans:', error);
    process.exit(1);
  }
}

// Run the script
ensureDefaultPlans()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
