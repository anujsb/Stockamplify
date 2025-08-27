// src/lib/services/subscriptionService.ts
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users, plans, subscriptions } from '@/lib/db/schema';

export class SubscriptionService {
  /**
   * Create a default free subscription for a new user
   * This creates an entry in the subscriptions table as requested
   */
  static async createDefaultSubscription(userId: number): Promise<void> {
    try {
      console.info(`[Subscription] Creating default subscription for user: ${userId}`);

      // Get the free plan (ID: 1 based on your plans.json)
      const [freePlan] = await db
        .select({ id: plans.id, name: plans.name })
        .from(plans)
        .where(eq(plans.id, 1)) // Free plan ID
        .limit(1);

      if (!freePlan) {
        throw new Error('Free plan not found in database. Please ensure plans table has data.');
      }

      // Check if user already has a subscription
      const existingSubscription = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      if (existingSubscription.length > 0) {
        console.info(`[Subscription] User ${userId} already has a subscription`);
        return;
      }

      // Create subscription with proper date format
      const startDate = new Date();
      const endDate = new Date('2099-12-31'); // Far future date for free plan

      await db.insert(subscriptions).values({
        userId: userId,
        planId: freePlan.id,
        type: 'monthly',
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
      });

      console.info(`[Subscription] ✅ Created subscription for user ${userId} with plan ${freePlan.name} (ID: ${freePlan.id})`);

    } catch (error) {
      console.error('[Subscription] ❌ Error creating default subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription details
   */
  static async getUserSubscription(userId: number) {
    try {
      const [subscription] = await db
        .select({
          id: subscriptions.id,
          userId: subscriptions.userId,
          planId: subscriptions.planId,
          type: subscriptions.type,
          startDate: subscriptions.startDate,
          endDate: subscriptions.endDate,
          createdAt: subscriptions.createdAt,
          planName: plans.name,
          planDescription: plans.description,
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      return subscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Update user's subscription to a new plan
   */
  static async updateUserSubscription(userId: number, planId: number): Promise<void> {
    try {
      // Verify plan exists
      const [plan] = await db
        .select({ id: plans.id, name: plans.name })
        .from(plans)
        .where(eq(plans.id, planId))
        .limit(1);

      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      // End the current subscription
      await db
        .update(subscriptions)
        .set({ endDate: new Date().toISOString().split('T')[0] })
        .where(eq(subscriptions.userId, userId));

      // Create new subscription
      const startDate = new Date();
      const endDate = new Date('2099-12-31'); // Far future date

      await db.insert(subscriptions).values({
        userId: userId,
        planId: planId,
        type: 'monthly',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      console.info(`[Subscription] ✅ Updated user ${userId} to plan ${plan.name} (ID: ${planId})`);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's current plan ID for rate limiting
   */
  static async getUserPlanId(userId: number): Promise<number> {
    try {
      const [subscription] = await db
        .select({ planId: subscriptions.planId })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(subscriptions.createdAt) // Get the most recent subscription
        .limit(1);

      if (!subscription) {
        // Fallback to free plan if no subscription found
        console.warn(`[Subscription] No subscription found for user ${userId}, using free plan`);
        return 1; // Free plan ID
      }

      return subscription.planId;
    } catch (error) {
      console.error('Error getting user plan ID:', error);
      return 1; // Fallback to free plan
    }
  }

  /**
   * Ensure user has a subscription (for existing users)
   */
  static async ensureUserHasSubscription(userId: number): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        console.info(`[Subscription] User ${userId} has no subscription, creating default`);
        await this.createDefaultSubscription(userId);
      } else {
        console.info(`[Subscription] User ${userId} already has subscription: ${subscription.planName}`);
      }
    } catch (error) {
      console.error('Error ensuring user has subscription:', error);
      throw error;
    }
  }
}
