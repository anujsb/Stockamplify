import { db } from "@/lib/db";
import { acePortfolioWide } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const REQUIRED_HEADERS = [
  "company",
  "symbol",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "value_cr",
  "ace_id",
] as const;

type RawRow = {
  company?: any;
  symbol?: any;
  c1?: any;
  c2?: any;
  c3?: any;
  c4?: any;
  c5?: any;
  value_cr?: any;
  ace_id?: any;
};

type InsertShape = typeof acePortfolioWide.$inferInsert;

const BATCH_SIZE = 200;

const toDbNumeric = (n: number | null): any => (n == null ? null : n);

const normalizeCompany = (name: any) =>
  String(name ?? "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeSymbol = (s: string | number | null | undefined): string =>
  String(s ?? "")
    .trim()
    .toUpperCase();

const isNullishString = (s: unknown): boolean => {
  const t = String(s ?? "").trim();
  return !t || /^[-–—]+$/.test(t) || /^(na|n\/a|null|nil)$/i.test(t);
};

const toNumberOrNull = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  const s = String(v);
  if (isNullishString(s)) return null;
  let cleaned = s.replace(/,/g, "").replace(/%/g, "").trim();
  if (/^\(.*\)$/.test(cleaned)) cleaned = "-" + cleaned.slice(1, -1);
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
};

function coerceRow(r: RawRow) {
  const company = normalizeCompany(r.company);
  const symbol = isNullishString(r.symbol) ? null : normalizeSymbol(r.symbol);
  const c1 = toNumberOrNull(r.c1);
  const c2 = toNumberOrNull(r.c2);
  const c3 = toNumberOrNull(r.c3);
  const c4 = toNumberOrNull(r.c4);
  const c5 = toNumberOrNull(r.c5);
  const value_cr = toNumberOrNull(r.value_cr);
  const ace_id_num = toNumberOrNull(r.ace_id);
  const ace_id = ace_id_num !== null ? Math.trunc(ace_id_num) : null;
  return { company, symbol, c1, c2, c3, c4, c5, value_cr, ace_id };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const wb = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return NextResponse.json({ error: "No sheets found" }, { status: 400 });
    const ws = wb.Sheets[sheetName];

    const raw = XLSX.utils.sheet_to_json<RawRow>(ws, {
      defval: null,
      raw: true,
      header: REQUIRED_HEADERS as unknown as string[],
      range: 1,
    });

    // Deduplicate in-file by (ace_id, company, symbol) – last wins
    const byKey = new Map<string, RawRow>();
    for (const r of raw) {
      const company = normalizeCompany(r.company);
      const aceId = toNumberOrNull(r.ace_id);
      const symbol = isNullishString(r.symbol) ? null : normalizeSymbol(r.symbol);
      if (!company || aceId === null) continue;

      const key = `${aceId}__${company.toLowerCase()}__${symbol ?? "NULL"}`;
      byKey.set(key, { ...r, company, ace_id: aceId, symbol });
    }

    const cleaned = Array.from(byKey.values())
      .map(coerceRow)
      .filter((r) => r.company && r.ace_id !== null);

    if (!cleaned.length) {
      return NextResponse.json({ error: "No valid rows after validation" }, { status: 400 });
    }

    let upserted = 0;
    const failures: { company: string; ace_id: number; error: string }[] = [];

    // Batch insert with fallback for individual error detection
    for (let i = 0; i < cleaned.length; i += BATCH_SIZE) {
      const chunk = cleaned.slice(i, i + BATCH_SIZE);

      const values: InsertShape[] = chunk.map(
        (r) =>
          ({
            company: r.company,
            symbol: r.symbol,
            c1: toDbNumeric(r.c1),
            c2: toDbNumeric(r.c2),
            c3: toDbNumeric(r.c3),
            c4: toDbNumeric(r.c4),
            c5: toDbNumeric(r.c5),
            valueCr: toDbNumeric(r.value_cr),
            aceId: r.ace_id!,
            updatedAt: sql`now()`,
          }) as unknown as InsertShape
      );

      try {
        const res = await db
          .insert(acePortfolioWide)
          .values(values)
          .onConflictDoUpdate({
            target: [acePortfolioWide.aceId, acePortfolioWide.company, acePortfolioWide.symbol],
            set: {
              c1: sql`excluded.c1`,
              c2: sql`excluded.c2`,
              c3: sql`excluded.c3`,
              c4: sql`excluded.c4`,
              c5: sql`excluded.c5`,
              valueCr: sql`excluded.value_cr`,
              updatedAt: sql`now()`,
            },
          })
          .returning({ id: acePortfolioWide.id });

        upserted += res.length;
      } catch (e: any) {
        // Fallback: do row-by-row insert to identify bad rows
        for (const r of chunk) {
          try {
            const one: InsertShape = {
              company: r.company,
              symbol: r.symbol,
              c1: toDbNumeric(r.c1),
              c2: toDbNumeric(r.c2),
              c3: toDbNumeric(r.c3),
              c4: toDbNumeric(r.c4),
              c5: toDbNumeric(r.c5),
              valueCr: toDbNumeric(r.value_cr),
              aceId: r.ace_id!,
              updatedAt: sql`now()`,
            } as unknown as InsertShape;

            const res = await db
              .insert(acePortfolioWide)
              .values(one)
              .onConflictDoUpdate({
                target: [acePortfolioWide.aceId, acePortfolioWide.company, acePortfolioWide.symbol],
                set: {
                  c1: sql`excluded.c1`,
                  c2: sql`excluded.c2`,
                  c3: sql`excluded.c3`,
                  c4: sql`excluded.c4`,
                  c5: sql`excluded.c5`,
                  valueCr: sql`excluded.value_cr`,
                  updatedAt: sql`now()`,
                },
              })
              .returning({ id: acePortfolioWide.id });

            upserted += res.length;
          } catch (er: any) {
            const msg = er?.message || er?.toString?.() || "Unknown error";
            failures.push({ company: r.company, ace_id: r.ace_id!, error: msg });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      processed: cleaned.length,
      upserted,
      failed: failures.length,
      failures: failures.slice(0, 20),
      note: failures.length ? "Check `failures` to see the exact rows/DB errors." : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
