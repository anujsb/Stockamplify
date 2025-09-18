// hooks/useForceSignOutOnExpiry.tsx
"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function useForceSignOutOnExpiry() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.expires) return;
    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();

    if (expiresAt <= now) {
      signOut({ callbackUrl: "/sign-in" });
      return;
    }

    const timeout = setTimeout(() => signOut({ callbackUrl: "/sign-in" }), expiresAt - now);
    return () => clearTimeout(timeout);
  }, [session]);
}
