import { db } from "@/lib/db"; // your Drizzle instance
import {
  aceInvestor,
  acePortfolioWide,
  aceQuarterColumnMap,
  stocks,
  userStocks,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// Optional: light normalization so "Ltd"/"Limited" don’t break matches
function normName(s: string | null | undefined) {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\blimited\b|\bltd\b|\bco\.?\b|\bcorp\.?\b/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type AceHoldingRow = {
  stockId: number;
  symbol: string;
  name: string;

  aceId: number;
  aceName: string;
  firmName: string | null;

  // wide table fields
  stakeC4: number | null;
  stakeC5: number | null; // latest
  valueCr: number | null;
};

export type AceMatchGrouped = {
  stockId: number;
  symbol: string;
  name: string;
  investment?: number;
  aces: Array<{
    aceId: number;
    aceName: string;
    firmName: string | null;
    stakeC5: number | null;
    stakeC4: number | null;
    valueCr: number | null;
    deltaPct?: number | null; // c5 - c4
    status: "active" | "exited";
  }>;
};

// Fetch human labels for c5 (latest) and c4 (previous)
export async function getQuarterLabels() {
  const rows = await db.select().from(aceQuarterColumnMap);
  const map = new Map(rows.map((r) => [r.columnName, r.quarter]));

  return {
    latest: map.get("C5") ?? null,
    previous: map.get("C4") ?? null,
  };
}

/**
 * Get user's portfolio matches against ace portfolios.
 * @param userId current user id
 */
export async function getUserAceMatches(userId: number) {
  // 1) Pull user's portfolio + stock master
  const my = await db
    .select({
      stockId: stocks.id,
      symbol: stocks.symbol,
      name: stocks.name,
      quantity: userStocks.quantity,
      buyPrice: userStocks.buyPrice,
    })
    .from(userStocks)
    .innerJoin(stocks, eq(userStocks.stockId, stocks.id))
    .where(eq(userStocks.userId, userId));

  const totalStockHeldByUser = my.length;

  if (totalStockHeldByUser === 0) {
    return {
      active: [] as AceMatchGrouped[],
      exited: [] as AceMatchGrouped[],
      totalInvestment: 0,
      matchedInvestment: 0,
      totalStockHeldByUser,
    };
  }

  // 2) Match user stock with ace holdings
  const rows: AceHoldingRow[] = [];
  const investmentMap = new Map<number, number>();
  let totalInvestment = 0;

  for (const r of my) {
    const userSymbol = r.symbol?.trim().toUpperCase();
    const userNameNorm = normName(r.name);
    const userWords = new Set(userNameNorm.split(" "));

    const matches = await db
      .select({
        stockId: sql<number>`${r.stockId}`,
        symbol: sql<string>`${r.symbol}`,
        name: sql<string>`${r.name}`,

        aceId: aceInvestor.aceId,
        aceName: aceInvestor.aceName,
        firmName: aceInvestor.firmName,

        stakeC4: acePortfolioWide.c4,
        stakeC5: acePortfolioWide.c5,
        valueCr: acePortfolioWide.valueCr,

        aceSymbol: acePortfolioWide.symbol,
        aceCompany: acePortfolioWide.company,
      })
      .from(acePortfolioWide)
      .innerJoin(aceInvestor, eq(acePortfolioWide.aceId, aceInvestor.aceId));

    const matched: AceHoldingRow[] = [];
    const invested = Number(r.quantity ?? 0) * Number(r.buyPrice ?? 0);
    totalInvestment += invested;

    for (const ace of matches) {
      const aceSymbol = ace.aceSymbol?.trim().toUpperCase();
      const aceCompanyNorm = normName(ace.aceCompany);
      const aceWords = new Set(aceCompanyNorm.split(" "));

      // 1. Match by symbol
      if (userSymbol && aceSymbol && userSymbol === aceSymbol) {
        matched.push({
          stockId: r.stockId,
          symbol: r.symbol,
          name: r.name ?? "",
          aceId: ace.aceId,
          aceName: ace.aceName,
          firmName: ace.firmName,
          stakeC4: ace.stakeC4,
          stakeC5: ace.stakeC5,
          valueCr: ace.valueCr,
        });
        continue;
      }

      // 2. Fallback: fuzzy name match with same word count
      const intersection = new Set([...userWords].filter((w) => aceWords.has(w)));
      const matchScore = intersection.size;

      if (
        matchScore > 0 &&
        aceWords.size === userWords.size &&
        matchScore === userWords.size // all words must match
      ) {
        matched.push({
          stockId: r.stockId,
          symbol: r.symbol,
          name: r.name ?? "",
          aceId: ace.aceId,
          aceName: ace.aceName,
          firmName: ace.firmName,
          stakeC4: ace.stakeC4,
          stakeC5: ace.stakeC5,
          valueCr: ace.valueCr,
        });
      }
    }

    if (matched.length > 0) {
      investmentMap.set(r.stockId, invested);
    }

    rows.push(...matched);
  }

  // 3) Split into active (c5 > 0) and exited (c4 > 0 && c5 is null/0)
  const activeByStock = new Map<number, AceMatchGrouped>();
  const exitedByStock = new Map<number, AceMatchGrouped>();
  let matchedInvestment = 0;

  for (const r of rows) {
    const delta =
      r.stakeC5 != null && r.stakeC4 != null ? Number(r.stakeC5) - Number(r.stakeC4) : null;

    const target =
      r.stakeC5 && Number(r.stakeC5) > 0
        ? activeByStock
        : r.stakeC4 && Number(r.stakeC4) > 0 && (!r.stakeC5 || Number(r.stakeC5) === 0)
          ? exitedByStock
          : null;

    if (!target) continue;

    if (!target.has(r.stockId)) {
      const inv = investmentMap.get(r.stockId) ?? 0;
      matchedInvestment += inv;

      target.set(r.stockId, {
        stockId: r.stockId,
        symbol: r.symbol,
        name: r.name,
        investment: inv,
        aces: [],
      });
    }

    target.get(r.stockId)!.aces.push({
      aceId: r.aceId,
      aceName: r.aceName,
      firmName: r.firmName,
      stakeC5: r.stakeC5,
      stakeC4: r.stakeC4,
      valueCr: r.valueCr,
      deltaPct: delta,
      status: target === activeByStock ? "active" : "exited",
    });
  }

  const active = Array.from(activeByStock.values()).map((g) => ({
    ...g,
    aces: g.aces.sort((a, b) => Number(b.stakeC5 ?? 0) - Number(a.stakeC5 ?? 0)),
  }));

  const exited = Array.from(exitedByStock.values()).map((g) => ({
    ...g,
    aces: g.aces.sort((a, b) => Number(b.stakeC4 ?? 0) - Number(a.stakeC4 ?? 0)),
  }));

  return { active, exited, totalInvestment, matchedInvestment, totalStockHeldByUser };
}
