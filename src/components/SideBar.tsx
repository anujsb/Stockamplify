"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { useUpdateManager } from "@/lib/hooks/useUpdateManager";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  IconAntennaBars5,
  IconBulb,
  IconChartBar,
  IconHome2,
  IconNews,
  IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Activity, BrainCircuit, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SideBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IconHome2,
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: IconChartBar,
    },
    {
      label: "AI Portfolio Advisor",
      href: "/ai-portfolio-advisor",
      icon: IconBulb,
    },
    {
      label: "AI Stock Analysis",
      href: "/ai-stock-analytics",
      icon: BrainCircuit,
    },
    {
      label: "Trade Signals",
      href: "/trade-signals",
      icon: IconAntennaBars5,
    },
    {
      label: "Market News",
      href: "/news",
      icon: IconNews,
    },
    {
      label: "Search Stocks",
      href: "/search",
      icon: IconSearch,
    },
  ];

  const updateManager = useUpdateManager();

  return (
    <div>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <nav className="mt-8 flex flex-col gap-2" aria-label="Sidebar navigation">
              {links.map((link, idx) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <SidebarLink
                    key={idx}
                    link={{
                      ...link,
                      icon: (
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                            isActive ? "text-blue-600" : "text-gray-800"
                          }`}
                          aria-hidden="true"
                        />
                      ),
                    }}
                    className={`${
                      isActive
                        ? "bg-secondary px-1 rounded-lg text-blue-600 font-semibold"
                        : "bg-transparent px-1 rounded-lg text-gray-800 hover:text-blue-600"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  />
                );
              })}
            </nav>
          </div>
          <div>
            <div className="flex flex-col space-y-2">
              <SignedIn>
                {open ? (
                  <div className="hidden sm:flex items-center space-x-2 text-sm mx-1">
                    {updateManager.status.realTime.isActive ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Activity className="h-4 w-4" />
                        <span>Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Offline</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center mx-1">
                    {updateManager.status.realTime.isActive ? (
                      <Activity className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center py-1 relative z-20"
      aria-label="StockAmplify Dashboard home"
    >
      <div
        className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
        aria-hidden="true"
      >
        <img src="/logo.png" alt="StockAmplify Logo" className="w-5 h-5 object-contain" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold whitespace-pre text-lg text-blue-700"
      >
        StockAmplify
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <div
      className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
      aria-label="StockAmplify logo"
    >
      <img src="/logo.png" alt="StockAmplify Logo" className="w-5 h-5 object-contain" />
    </div>
  );
};
