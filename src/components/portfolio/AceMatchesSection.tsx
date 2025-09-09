// src/components/portfolio/AceMatchesSection.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AceMatchGrouped } from "@/lib/services/aceMatches";
import { formatQuarterDate, formatSymbol } from "@/lib/utils/stockUtils";
import { ChevronDown, ChevronRight, HandCoins, LogOutIcon } from "lucide-react";
import React from "react";

function pct(n?: number | null) {
  return n == null ? "—" : `${Number(n).toFixed(2)}%`;
}
function cr(n?: number | null) {
  return n == null ? "—" : Number(n).toLocaleString();
}

export default function AceMatchesSection({
  active,
  exited,
  labels,
}: {
  active: AceMatchGrouped[];
  exited: AceMatchGrouped[];
  labels: { latest: Date | null; previous: Date | null };
}) {
  const qLatest = labels.latest ? formatQuarterDate(labels.latest) : "Latest quarter";
  const qPrev = labels.previous ? formatQuarterDate(labels.previous) : "Previous quarter";

  const [activeExpandedId, setActiveExpandedId] = React.useState<number | null>(null);
  const [exitedExpandedId, setExitedExpandedId] = React.useState<number | null>(null);

  const toggleActive = (id: number) => setActiveExpandedId((cur) => (cur === id ? null : id));
  const toggleExited = (id: number) => setExitedExpandedId((cur) => (cur === id ? null : id));

  const ActiveRow = ({ g }: { g: AceMatchGrouped }) => {
    const extra = Math.max(0, g.aces.length - 2);
    const isOpen = activeExpandedId === g.stockId;

    return (
      <>
        {" "}
        <tr className="border-b last:border-0 hover:bg-slate-50">
          {" "}
          {/* Stock */}{" "}
          <td className="py-2 pr-2 align-top">
            {" "}
            <div className="font-medium">{formatSymbol(g.symbol)}</div>{" "}
            <div className="text-xs text-muted-foreground">{g.name}</div>{" "}
          </td>{" "}
          {/* Ace chips (first 2 + +N more) */}{" "}
          <td className="py-2 pr-2 align-top">
            {" "}
            <div className="flex flex-wrap items-center gap-2">
              {" "}
              {g.aces.slice(0, 2).map((a) => (
                <Badge key={a.aceId} variant="secondary">
                  {" "}
                  {a.aceName}{" "}
                </Badge>
              ))}{" "}
              {extra > 0 && (
                <button
                  type="button"
                  onClick={() => toggleActive(g.stockId)}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {" "}
                  +{extra} more{" "}
                </button>
              )}{" "}
            </div>{" "}
          </td>{" "}
          {/* Chevron */}{" "}
          <td className="py-2 pl-2 pr-1 w-10 text-right">
            {" "}
            <button
              type="button"
              onClick={() => toggleActive(g.stockId)}
              aria-label={isOpen ? "Hide details" : "Show details"}
              className="inline-flex items-center justify-center rounded hover:bg-slate-100 w-7 h-7"
            >
              {" "}
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}{" "}
            </button>{" "}
          </td>{" "}
        </tr>{" "}
        {/* Details */}{" "}
        {isOpen && (
          <tr className="bg-slate-50/60">
            {" "}
            <td colSpan={3} className="py-3">
              {" "}
              <div className="rounded-lg border border-slate-200 bg-white">
                {" "}
                <div className="overflow-x-auto">
                  {" "}
                  <table className="w-full text-sm">
                    {" "}
                    <thead className="text-xs text-muted-foreground">
                      {" "}
                      <tr className="border-y">
                        {" "}
                        <th className="text-left py-2 pl-3">Investor</th>{" "}
                        <th className="text-right py-2">Stake (c5)</th>{" "}
                        <th className="text-right py-2">Change vs {qPrev}</th>{" "}
                        <th className="text-right py-2 pr-3">Value (₹ Cr)</th>{" "}
                      </tr>{" "}
                    </thead>{" "}
                    <tbody>
                      {" "}
                      {g.aces.map((a) => (
                        <tr key={a.aceId} className="border-b last:border-0">
                          {" "}
                          <td className="py-2 pl-3">
                            {" "}
                            <div className="font-medium">{a.aceName}</div>{" "}
                          </td>{" "}
                          <td className="py-2 text-right">{pct(a.stakeC5)}</td>{" "}
                          <td className="py-2 text-right">
                            {" "}
                            {a.deltaPct == null ? "—" : pct(a.deltaPct)}{" "}
                          </td>{" "}
                          <td className="py-2 pr-3 text-right">{cr(a.valueCr)}</td>{" "}
                        </tr>
                      ))}{" "}
                    </tbody>{" "}
                  </table>{" "}
                </div>{" "}
              </div>{" "}
            </td>{" "}
          </tr>
        )}{" "}
      </>
    );
  };

  const ExitedRow = ({ g }: { g: AceMatchGrouped }) => {
    const isOpen = exitedExpandedId === g.stockId;
    const extra = Math.max(0, g.aces.length - 2);

    return (
      <>
        <tr className="border-b last:border-0 hover:bg-slate-50">
          <td className="py-2 pr-2 align-top">
            <div className="font-medium">{g.symbol}</div>
            <div className="text-xs text-muted-foreground">{g.name}</div>
          </td>

          <td className="py-2 pr-2 align-top">
            <div className="flex flex-wrap gap-2">
              {g.aces.slice(0, 2).map((a) => (
                <Badge key={a.aceId} variant="outline">
                  {a.aceName}
                </Badge>
              ))}
              {extra > 0 && (
                <button
                  type="button"
                  onClick={() => toggleExited(g.stockId)}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  +{extra} more
                </button>
              )}
            </div>
          </td>

          <td className="py-2 pl-2 pr-1 w-10 text-right">
            <button
              type="button"
              onClick={() => toggleExited(g.stockId)}
              aria-label={isOpen ? "Hide details" : "Show details"}
              className="inline-flex items-center justify-center rounded hover:bg-slate-100 w-7 h-7"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </td>
        </tr>

        {isOpen && (
          <tr className="bg-slate-50/60">
            <td colSpan={3} className="py-3">
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr className="border-y">
                        <th className="text-left py-2 pl-3">Investor</th>
                        <th className="text-right py-2 pr-3">Last Stake (c4)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.aces.map((a) => (
                        <tr key={a.aceId} className="border-b last:border-0">
                          <td className="py-2 pl-3">
                            <div className="font-medium">{a.aceName}</div>
                          </td>
                          <td className="py-2 pr-3 text-right">{pct(a.stakeC4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* ACTIVE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-blue-600" />
              Currently held by Ace Investors
            </div>
            <span className="text-xs text-gray-400">{qLatest}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {active.length === 0 ? (
            <div className="text-sm text-muted-foreground">No matches in the latest quarter.</div>
          ) : (
            <table className="min-w-[640px] w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left w-[40%]">Stock</th>
                  <th className="py-2 text-left">Ace Investors</th>
                  <th className="py-2 w-10">{/* chevron column */}</th>
                </tr>
              </thead>
              <tbody>
                {active.map((g) => (
                  <ActiveRow key={g.stockId} g={g} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* EXITED */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOutIcon className="h-5 w-5 text-blue-600" />
              Recently Exited by Ace Investors
            </div>
            <span className="text-xs text-gray-400">
              Held in {qPrev}, absent in {qLatest}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {exited.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No exits detected among your holdings.
            </div>
          ) : (
            <table className="min-w-[640px] w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left w-[40%]">Stock</th>
                  <th className="py-2 text-left">Exiting Ace(s)</th>
                  <th className="py-2 w-10">{/* chevron column */}</th>
                </tr>
              </thead>
              <tbody>
                {exited.map((g) => (
                  <ExitedRow key={g.stockId} g={g} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
