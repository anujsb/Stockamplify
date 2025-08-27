import { db } from "@/lib/db";
import { plans, subscriptions, users } from "@/lib/db/schema";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      dbUserId: number;
      email: string;
      username?: string;
      nextAuthId: string;
      isActive: boolean;
      planName?: string;
      subscriptionType?: string;
      subscriptionStartDate?: string;
      subscriptionEndDate?: string;
    };
  }

  interface User {
    id: string;
    dbUserId: number;
    email: string;
    username?: string;
    nextAuthId: string;
    isActive: boolean;
    planName?: string;
    subscriptionType?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    dbUserId?: number;
    nextAuthId?: string;
    username?: string;
    email?: string | null;
    isActive?: boolean;
    planName?: string;
    subscriptionType?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        console.log("Attempting authentication for:", credentials.email);

        try {
          // Query the database for the user
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!userResult || userResult.length === 0) {
            console.log("User not found in database:", credentials.email);
            return null;
          }

          const user = userResult[0];
          console.log("User found in database:", user.email);

          // Check if user has a password
          if (!user.password) {
            console.log("User has no password:", user.email);
            return null;
          }

          // Check if user is Active
          if (!user.isActive) {
            console.log("User isActive:", user.isActive);
            return null;
          }

          // Compare password with hashed password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (isPasswordValid) {
            console.log("Authentication successful for:", user.email);
            return {
              id: user.id.toString(),
              dbUserId: user.id,
              email: user.email,
              username: user.username || undefined,
              nextAuthId: user.nextAuthId,
              isActive: user.isActive,
            };
          } else {
            console.log("Password mismatch for:", user.email);
            return null;
          }
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Ensure OAuth (google ...) users have a DB row
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await upsertUserForAuth({
          email: user.email,
          username: user.name ?? undefined,
          provider: "google",
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.dbUserId = user.dbUserId;
        token.nextAuthId = user.nextAuthId;
        token.username = user.username;
        token.isActive = user.isActive;
      }
      // Ensure dbId & nextAuthId are present (covers OAuth)
      if ((!token.dbUserId || !token.nextAuthId) && token.email) {
        const [row] = await db
          .select({
            id: users.id,
            nextAuthId: users.nextAuthId,
            username: users.username,
            isActive: users.isActive,
          })
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1);

        if (row) {
          token.dbUserId = row.id;
          token.nextAuthId = row.nextAuthId;
          token.username = token.username ?? row.username ?? undefined;
          token.isActive = row.isActive;
        }
      }

      // Fetch subscription + plan details for active user
      if (token.dbUserId) {
        const [subscription] = await db
          .select({
            type: subscriptions.type,
            startDate: subscriptions.startDate,
            endDate: subscriptions.endDate,
            planName: plans.name,
          })
          .from(subscriptions)
          .innerJoin(plans, eq(subscriptions.planId, plans.id))
          .where(eq(subscriptions.userId, token.dbUserId))
          .limit(1);

        if (subscription) {
          token.planName = subscription.planName;
          token.subscriptionType = subscription.type;
          token.subscriptionStartDate = subscription.startDate;
          token.subscriptionEndDate = subscription.endDate;
        } else {
          // Default to Free Plan if no active subscription found
          token.planName = "Free";
          token.subscriptionType = "Monthly";
          token.subscriptionStartDate = "";
          token.subscriptionEndDate = "";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.dbUserId = token.dbUserId as number;
        session.user.nextAuthId = token.nextAuthId as string;
        session.user.username = token.username as string;
        session.user.isActive = token.isActive as boolean;
        // Subscription Details
        session.user.planName = token.planName;
        session.user.subscriptionType = token.subscriptionType;
        session.user.subscriptionStartDate = token.subscriptionStartDate;
        session.user.subscriptionEndDate = token.subscriptionEndDate;
      }
      return session;
    },
  },
  // Disable CSRF protection for development
  trustHost: true,
});

// Function to add users to database (called from signup API)
type ProviderKind = "credentials" | "google" | "github" | "azuread" | string;

function generateNextAuthId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Upsert a user for either OAuth or credentials flows.
 * - OAuth: password is stored as null
 * - Credentials: password is required; won’t overwrite an existing password
 */
export async function upsertUserForAuth(opts: {
  email: string;
  provider: ProviderKind;
  password?: string | null;
  username?: string | null;
}) {
  const email = opts.email.trim().toLowerCase();
  const usernameFallback = email.split("@")[0];

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // If user already exists, update minimally based on provider
  if (existing.length) {
    const u = existing[0];

    if (opts.provider === "credentials") {
      // If credentials flow but user already has a password, don't override.
      if (u.password) {
        throw new Error("User already exists");
      }
      if (!opts.password) {
        throw new Error("Password is required for credentials signup.");
      }

      const hashed = await bcrypt.hash(opts.password, 12);

      const [updated] = await db
        .update(users)
        .set({
          password: hashed,
          username: u.username ?? opts.username ?? usernameFallback,
          nextAuthId: u.nextAuthId ?? generateNextAuthId(),
        })
        .where(eq(users.id, u.id))
        .returning();

      return updated;
    }

    // OAuth flow: ensure there is a nextAuthId and a username; don't touch password
    if (!u.nextAuthId || !u.username) {
      const [updated] = await db
        .update(users)
        .set({
          nextAuthId: u.nextAuthId ?? generateNextAuthId(),
          username: u.username ?? opts.username ?? usernameFallback,
        })
        .where(eq(users.id, u.id))
        .returning();

      return updated;
    }

    return u;
  }

  // No existing user → create new
  const isCredentials = opts.provider === "credentials";

  if (isCredentials && !opts.password) {
    throw new Error("Password is required for credentials signup.");
  }

  const hashed = isCredentials
    ? await bcrypt.hash(String(opts.password), 12)
    : null;

  const [created] = await db
    .insert(users)
    .values({
      email,
      password: hashed, // null for OAuth
      username: opts.username || usernameFallback,
      nextAuthId: generateNextAuthId(),
      isActive: isCredentials ? false : true,
    })
    .returning();

  // Create default subscription for the new user
  await SubscriptionService.createDefaultSubscription(created.id);

  return created;
}
