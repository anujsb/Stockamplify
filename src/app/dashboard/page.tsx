'use client';

import { SideBar } from "@/components/SideBar";
import { cn } from "@/lib/utils";
import React from "react";
import { useUser } from '@clerk/nextjs';



export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className={cn(
      " flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row ",
      "min-h-screen", // for your use case, use `h-screen` instead of `h-[60vh]`
    )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Investor'}!
          </h1>
          <p className="text-gray-600">
            Monitor your portfolio and track real-time stock updates
          </p>
        </div>
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg text-gray-700">Welcome to your dashboard!</p>
      </div>
    </div>

  );
}

