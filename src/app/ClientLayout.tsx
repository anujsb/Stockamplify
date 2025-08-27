"use client";
import { useSession, signOut } from "next-auth/react";
import { useUpdateManager } from "@/lib/hooks/useUpdateManager";
import Link from "next/link";
import { TrendingUp, Activity, Clock, User, LogOut } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const updateManager = useUpdateManager();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
