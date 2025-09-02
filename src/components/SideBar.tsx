"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { useUpdateManager } from "@/lib/hooks/useUpdateManager";
import {
  IconChartBar,
  IconHome2,
  IconNews,
  IconSearch
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { BrainCircuit, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function SideBar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
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
    // {
    //   label: "AI Portfolio Advisor",
    //   href: "/ai-portfolio-advisor",
    //   icon: IconBulb,
    // },
    {
      label: "AI Stock Analysis",
      href: "/ai-stock-analytics",
      icon: BrainCircuit,
    },
    // {
    //   label: "Trade Signals",
    //   href: "/trade-signals",
    //   icon: IconAntennaBars5,
    // },
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

  //const handleSignOut = () => {
  //  if (confirm("Sign out?")) signOut();
  //};

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
                          className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? "text-blue-600" : "text-gray-800"
                            }`}
                          aria-hidden="true"
                        />
                      ),
                    }}
                    className={`${isActive
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
              {/* User section */}
              {session && (
                <div
                  className={`mt-auto border-t border-gray-200 ${open ? "p-4" : "px-0 py-4"}`}
                >
                  <div
                    className={`flex items-center w-full ${open ? "space-x-3" : "justify-center"}`}
                  >
                    {/* Avatar: fixed square, won't grow/shrink, circular */}
                    <div
                      className="w-8 h-8 min-w-[32px] min-h-[32px] flex-none bg-blue-500 rounded-full flex items-center justify-center overflow-hidden"
                      title={
                        (session.user as any)?.username || session.user?.email
                      }
                    >
                      <span className="text-white text-sm font-medium select-none">
                        {(session.user as any)?.username?.[0]?.toUpperCase() ||
                          session.user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* Name + logout only when open */}
                    {open && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {(session.user as any)?.username ||
                              session.user?.email}
                          </p>
                        </div>
                        {/* <button
                          onClick={() => signOut()}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          title="Sign out"
                        >
                          <LogOut className="w-4 h-4" />
                        </button> */}

                        <button
                          onClick={() => signOut()}
                          title="Sign out"
                          aria-label="Sign out"
                          className={`${open
                            ? "inline-flex items-center gap-2 px-2 py-1 rounded-md"
                            : "p-2 rounded-full"
                            } bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 text-gray-600`}
                        >
                          <LogOut className="w-4 h-4" />
                          {open && (
                            <span className="text-xs font-medium">
                              Sign out
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
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
        <img
          src="/logo.png"
          alt="StockAmplify Logo"
          className="w-5 h-5 object-contain"
        />
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
      <img
        src="/logo.png"
        alt="StockAmplify Logo"
        className="w-5 h-5 object-contain"
      />
    </div>
  );
};
