"use client";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useUpdateManager } from "@/lib/hooks/useUpdateManager";
import Link from "next/link";
import { TrendingUp, Activity, Clock, User, LogOut } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, user } = useUser();
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
