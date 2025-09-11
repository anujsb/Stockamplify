"use client";

import SideBar from "@/components/SideBar";
import AceMatchesSection from "@/components/portfolio/AceMatchesSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStatus } from "@/lib/hooks/useUserStatus";
import { AceMatchGrouped } from "@/lib/services/aceMatches";
import { cn } from "@/lib/utils";
import { FEATURE_CODES, type FeatureCode } from "@/lib/utils/constants";
import { formatQuarterDate } from "@/lib/utils/stockUtils";
import { IconArchive, IconMoneybag, IconTargetArrow } from "@tabler/icons-react";
import {
  AlertTriangle,
  BarChart2,
  ChartBar,
  CrownIcon,
  LogOut,
  PieChart,
  PinIcon,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

interface RateLimit {
  count: number;
  remaining: number;
  limit: number;
  resetTime?: string;
}

type ApiResponse =
  | {
      data?: {
        matches?: { active?: unknown[]; exited?: unknown[]; labels?: any };
        labels?: { latest?: string | null; previous?: string | null };
        totalInvestment?: number;
        matchedInvestment?: number;
      };
    }
  | any;

export default function SmartMoneyPage() {
  const { isActive } = useUserStatus({ redirectIfInactive: true });

  const [active, setActive] = useState<AceMatchGrouped[]>([]);
  const [exited, setExited] = useState<AceMatchGrouped[]>([]);
  const [labels, setLabels] = useState<{ latest: Date | null; previous: Date | null }>({
    latest: null,
    previous: null,
  });
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [matchedInvestment, setMatchedInvestment] = useState<number>(0);
  const [totalStockHeldByUser, setTotalStockHeldByUser] = useState(0);
  const [aceLoading, setAceLoading] = useState(true);
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit>({
    count: 0,
    remaining: 10,
    limit: 10,
    resetTime: undefined,
  });
  const [remainingTokens, setRemainingTokens] = useState<number>(1);

  // Fetch current rate limit status
  const fetchTokenStatus = async (featureCode: FeatureCode) => {
    try {
      const response = await fetch(
        `/api/rate-limit-status?feature=${encodeURIComponent(featureCode)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (response.ok) {
        setRateLimit({
          count: data.count ?? 0,
          remaining: data.remaining ?? 0,
          limit: data.limit ?? 0,
          resetTime: data.resetTime,
        });
        setRemainingTokens(data.remaining);
      } else {
        setError(data.message || data.error || "Failed to get rate limit");
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  useEffect(() => {
    if (!FEATURE_CODES || !FEATURE_CODES.SMART_MONEY) {
      setError("Server misconfiguration: feature codes missing");
      return;
    }
    fetchTokenStatus(FEATURE_CODES.SMART_MONEY);
  }, []);

  useEffect(() => {
    if (rateLimit == null) return;
    const rem = rateLimit?.remaining ?? 0;
    setRemainingTokens(rem);

    if (rem <= 0) {
      setError("You've reached your monthly limit. Please try again next month.");
    } else {
      if (error === "You've reached your monthly limit. Please try again next month.") {
        setError(null);
      }
    }
  }, [rateLimit]);

  const normalize = (arr: any[]): AceMatchGrouped[] =>
    (arr ?? []).map((g: any) => ({
      stockId: Number(g.stockId),
      symbol: String(g.symbol ?? ""),
      name: String(g.name ?? ""),
      investment: Number(g.investment ?? 0),
      aces: (g.aces ?? []).map((a: any) => ({
        aceId: Number(a.aceId),
        aceName: String(a.aceName ?? ""),
        stakeC5: a.stakeC5 ?? null,
        stakeC4: a.stakeC4 ?? null,
        deltaPct: a.deltaPct ?? null,
        valueCr: a.valueCr ?? null,
        firmName: String(a.firmName ?? ""),
        status: a.status === "exited" ? "exited" : "active",
      })),
    }));

  useEffect(() => {
    let cancel = false;

    const fetchData = async () => {
      try {
        setAceLoading(true);
        setError(null);

        const res = await fetch("/api/ace-matches");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = (await res.json()) as ApiResponse;
        if (cancel) return;

        const root = raw?.data ?? raw ?? {};
        const matches = root?.matches ?? root;

        const act = Array.isArray(matches?.active) ? matches.active : [];
        const ex = Array.isArray(matches?.exited) ? matches.exited : [];

        const lab = root.labels ?? matches.labels ?? { latest: null, previous: null };

        setActive(normalize(act));
        setExited(normalize(ex));
        setLabels({
          latest: lab?.latest ? new Date(lab.latest) : null,
          previous: lab?.previous ? new Date(lab.previous) : null,
        });
        setTotalInvestment(Number(root.totalInvestment ?? 0));
        setMatchedInvestment(Number(root.matchedInvestment ?? 0));
        setTotalStockHeldByUser(Number(root.totalStockHeldByUser ?? 0));
        setRateLimit(root.rateLimit);
      } catch (e: any) {
        if (!cancel) {
          setError((prev) => prev || e?.message || "Failed to load ace matches");
        }
      } finally {
        if (!cancel) setAceLoading(false);
      }
    };

    if (status === "authenticated") fetchData();
    return () => {
      cancel = true;
    };
  }, [status]);

  const { topInvestorName, topInvestorAmt, topInvestorPct, topOverlapList } = useMemo(() => {
    const groups = [...active, ...exited];
    const groupsWithInv = groups.filter((g) => Number(g.investment ?? 0) > 0);
    const useValueMode = groupsWithInv.length > 0;
    const baseGroups = useValueMode ? groupsWithInv : groups;

    const byInvestor = baseGroups.reduce(
      (acc, g) => {
        const weight = useValueMode ? Number(g.investment) || 0 : 1;
        if (!weight) return acc;
        for (const a of g.aces) {
          acc[a.aceName] = (acc[a.aceName] || 0) + weight;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const top = Object.entries(byInvestor)
      .sort(([, va], [, vb]) => (vb ?? 0) - (va ?? 0))
      .slice(0, 3);

    const name = top[0]?.[0] ?? "—";
    const amt = useValueMode ? Number(top[0]?.[1] ?? 0) : 0;
    const pct = useValueMode && totalInvestment > 0 ? (amt / totalInvestment) * 100 : 0;

    return { topInvestorName: name, topInvestorAmt: amt, topInvestorPct: pct, topOverlapList: top };
  }, [active, exited, totalInvestment]);

  const fmtINR = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);
  const overlapPct =
    totalInvestment > 0 ? Math.min(100, (matchedInvestment / totalInvestment) * 100) : 0;

  const Progress = ({ value }: { value: number }) => (
    <div className="w-full h-2 rounded bg-gray-200/70">
      <div
        className="h-2 rounded bg-gradient-to-r from-emerald-400 via-green-500 to-lime-500 shadow-sm"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Please sign in to use StockAmplify</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
        <SideBar />
        <div className="flex-1 p-6">
          {/* show error if any */}
          {error ? (
            <div className="mb-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="font-medium">Error</div>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (aceLoading) {
    return (
      <div
        className={cn(
          "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
          "min-h-screen"
        )}
      >
        {" "}
        <SideBar />{" "}
        <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
          {" "}
          <div className="flex items-center justify-center min-h-[400px]">
            {" "}
            <div className="flex flex-col items-center gap-4">
              {" "}
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>{" "}
              <p className="text-slate-600">Loading your data...</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }

  const subtitle =
    labels.latest && labels.previous
      ? `Latest quarter: ${formatQuarterDate(labels.latest)} • Previous: ${formatQuarterDate(
          labels.previous
        )}`
      : "";

  const matchedCount = active.length + exited.length;
  const holdingsMatchPct =
    totalStockHeldByUser > 0 ? Math.round((matchedCount / totalStockHeldByUser) * 100) : 0;

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row min-h-screen">
      <SideBar />
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Analytics Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <ChartBar className="h-5 w-5 text-yellow-600" />
                Smart Money Analytics (Ace Investors & Institutions)
              </CardTitle>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              {/* Stat tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Matching stocks */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-indigo-100 bg-indigo-50/60">
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <Users className="h-4 w-4" />
                    <span>Total Matching Stocks</span>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {matchedCount} / {totalStockHeldByUser}
                  </div>
                  <div className="text-xs text-slate-600">
                    ({holdingsMatchPct}% of your holdings align with Ace Investors)
                  </div>
                </div>

                {/* Exited */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-rose-100 bg-rose-50/60">
                  <div className="flex items-center gap-2 text-rose-700 mb-1">
                    <LogOut className="h-4 w-4" />
                    <span>Exited Holdings</span>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">{exited.length}</div>
                </div>

                {/* Smart money total value */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-fuchsia-100 bg-fuchsia-50/60">
                  <div className="flex items-center gap-2 text-fuchsia-700 mb-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>Smart Money Total Value (Cr)</span>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    ₹
                    {fmtINR.format(
                      [...active.flatMap((g) => g.aces), ...exited.flatMap((g) => g.aces)].reduce(
                        (sum, a) => sum + (a.valueCr ?? 0),
                        0
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Investment + overlap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total investment */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-emerald-100 bg-emerald-50/60">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <IconMoneybag className="h-4 w-4" />
                    <span>Total User Investment</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    ₹{fmtINR.format(totalInvestment)}
                  </div>
                </div>

                {/* Matched investment */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-cyan-100 bg-cyan-50/60">
                  <div className="flex items-center gap-2 text-cyan-700 mb-1">
                    <IconArchive className="h-4 w-4" />
                    <span>Matched Investment</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    ₹{fmtINR.format(matchedInvestment)}
                  </div>
                </div>

                {/* Overlap */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-lime-100 bg-lime-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-lime-700">
                      <PieChart className="h-4 w-4" />
                      <span>Portfolio Overlap</span>
                    </div>
                    <span className="text-slate-700 font-medium">{overlapPct.toFixed(2)}%</span>
                  </div>
                  <Progress value={overlapPct} />
                </div>
              </div>

              {/* Investors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top 3 by valueCr */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-amber-100 bg-amber-50/60">
                  <div className="mb-2 flex items-center gap-2 text-indigo-700 mb-1">
                    <CrownIcon className="h-4 w-4" /> <span>Top 3 Ace Investors</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 text-xs sm:text-sm">
                    {Array.from(
                      new Map(
                        [...active, ...exited].flatMap((g) => g.aces).map((a) => [a.aceName, a])
                      ).values()
                    )
                      .sort((a, b) => (b.valueCr ?? 0) - (a.valueCr ?? 0))
                      .slice(0, 3)
                      .map((a, i) => (
                        <li key={i} className="flex justify-between items-center">
                          <span>{a.aceName}</span>
                          <span>₹{fmtINR.format(a.valueCr ?? 0)} Cr</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Most frequent */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-sky-100 bg-sky-50/60">
                  <div className="mb-2 flex items-center gap-2 text-fuchsia-700 mb-1">
                    <PinIcon className="h-4 w-4" /> <span>Most Frequent Ace Investors</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 text-xs sm:text-sm">
                    {Object.entries(
                      [...active, ...exited]
                        .flatMap((g) => g.aces)
                        .reduce(
                          (acc, a) => {
                            acc[a.aceName] = (acc[a.aceName] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        )
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([name, count], i) => (
                        <li key={i} className="flex justify-between items-center">
                          <span>{name}</span>
                          <span className="text-right text-slate-600">
                            {count} match{count > 1 ? "es" : ""}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Biggest overlap */}
                <div className="rounded-xl p-4 shadow-sm ring-1 ring-rose-100 bg-rose-50/60">
                  <div className="mb-2 flex items-center gap-2 text-rose-700 mb-1">
                    <IconTargetArrow className="h-4 w-4" /> <span>Biggest Overlap Investor</span>
                  </div>
                  <p className="text-xs text-slate-600 -mt-1 mb-2">
                    Value of your holdings Investor also hold
                  </p>

                  <div className="text-sm text-slate-500">Investor</div>
                  <div className="text-lg font-semibold text-slate-900">{topInvestorName}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-600">Matched Amount</div>
                    <div className="text-right font-semibold">₹{fmtINR.format(topInvestorAmt)}</div>
                    <div className="text-slate-600">Share of Portfolio</div>
                    <div className="text-right font-semibold">{topInvestorPct.toFixed(2)}%</div>
                  </div>

                  {topOverlapList.length > 1 && (
                    <div className="mt-4 border-t pt-3">
                      <div className="text-xs text-slate-600 mb-1">Next</div>
                      <ul className="space-y-1 text-sm text-slate-700">
                        {topOverlapList.slice(1).map(([name, amt]) => (
                          <li key={name} className="flex items-center justify-between">
                            <span>{name}</span>
                            <span>₹{fmtINR.format(Number(amt) || 0)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches list */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-black">🧠 Ace Investor Matches</CardTitle>
              <p className="text-muted-foreground text-sm">
                You’re investing alongside ace investors. Explore who’s aligned with your picks.
              </p>
            </CardHeader>
            <CardContent>
              <AceMatchesSection active={active} exited={exited} labels={labels} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
