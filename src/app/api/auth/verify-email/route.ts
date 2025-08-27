import { db } from "@/lib/db";
import { emailVerificationTokens, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // Redirect helper
  const redirect = (status: string) =>
    Response.redirect(
      `${process.env.NEXTAUTH_URL}/verify-email?status=${status}`
    );

  if (!token) return redirect("invalid");

  const tokenEntry = await db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(emailVerificationTokens.token, token),
      eq(emailVerificationTokens.isUsed, false)
    ),
  });

  if (!tokenEntry) return redirect("invalid");
  if (new Date(tokenEntry.expiresAt) < new Date()) return redirect("expired");

  await db
    .update(users)
    .set({ isActive: true })
    .where(eq(users.email, tokenEntry.email));

  await db
    .update(emailVerificationTokens)
    .set({ isUsed: true })
    .where(eq(emailVerificationTokens.token, token));

  return redirect("success");
}
