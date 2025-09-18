"use client";
import { useForceSignOutOnExpiry } from "@/lib/hooks/useForceSignOutOnExpiry";
import { useUpdateManager } from "@/lib/hooks/useUpdateManager";
import { useSession } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const updateManager = useUpdateManager();
  useForceSignOutOnExpiry();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
