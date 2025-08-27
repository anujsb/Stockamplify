"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useUserStatus({
  redirectIfInactive = false,
}: {
  redirectIfInactive?: boolean;
} = {}) {
  const { data: session, status } = useSession();
  const [showInactiveBanner, setShowInactiveBanner] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    // No session → let NextAuth handle login redirection if needed
    if (!session?.user) return;

    // If user is inactive
    if (session.user.isActive === false) {
      if (redirectIfInactive && pathname !== "/dashboard") {
        // Redirect inactive users to dashboard if they're on a restricted page
        router.replace(`/dashboard?inactive=1`);
      } else if (pathname === "/dashboard") {
        // If already on dashboard, show banner
        setShowInactiveBanner(true);
      }
    } else {
      setShowInactiveBanner(false);
    }
  }, [session, status, redirectIfInactive, pathname, router]);

  return {
    isActive: session?.user?.isActive ?? false,
    showInactiveBanner,
    user: session?.user,
    status,
  };
}
