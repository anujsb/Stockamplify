import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { POST as addStock } from "@/app/api/portfolio/route";

interface RawRow {
  symbol?: any;
  quantity?: any;
  buyPrice?: any;
}

const REQUIRED_HEADERS = ["symbol", "quantity", "buyPrice"];

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  const s = String(v).trim();
  if (!s) return null;
  const cleaned = s.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // Read Excel/CSV
    const wb = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ success: false, error: "No sheets found" }, { status: 400 });
    }
    const ws = wb.Sheets[sheetName];

    // Extract headers from the first row
    const headers = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      range: 0,
      defval: null,
    })[0] as string[];
    const missingHeaders = REQUIRED_HEADERS.filter(
      (h) => !headers.map((x) => String(x).trim().toLowerCase()).includes(h.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format. Missing headers: ${missingHeaders.join(", ")}`,
          requiredHeaders: REQUIRED_HEADERS,
          foundHeaders: headers,
        },
        { status: 400 }
      );
    }

    const rawRows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: null });

    if (!rawRows.length) {
      return NextResponse.json({ success: false, error: "No rows found in file" }, { status: 400 });
    }

    const results: { row: RawRow; success: boolean; error?: string }[] = [];

    for (const row of rawRows) {
      const symbol = row.symbol ? String(row.symbol).trim() : null;
      const quantity = toNumberOrNull(row.quantity);
      const buyPrice = toNumberOrNull(row.buyPrice);

      if (!symbol || quantity === null || buyPrice === null) {
        results.push({ row, success: false, error: "Missing required fields" });
        continue;
      }

      try {
        const fakeReq = new Request(new URL("/api/portfolio", req.url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: req.headers.get("cookie") || "",
          },
          body: JSON.stringify({ symbol, quantity, buyPrice }),
        });

        const res = await addStock(fakeReq as any);
        const data = await res.json();

        if (!res.ok || !data.success) {
          results.push({ row, success: false, error: data.error || "Failed to add" });
        } else {
          results.push({ row, success: true });
        }
      } catch (err: any) {
        results.push({ row, success: false, error: err?.message ?? "Error adding stock" });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      processed: results.length,
      added: successCount,
      failed: failureCount,
      results: results.slice(0, 50),
    });
  } catch (err: any) {
    console.error("Error in POST /api/portfolio/upload:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
