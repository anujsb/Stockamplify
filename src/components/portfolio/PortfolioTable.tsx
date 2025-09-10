import { HoldingInput, recommendForHolding } from "@/lib/services/shared/personalizedRecommender";
import { formatPrice, formatSymbol } from "@/lib/utils/stockUtils";
import { ChevronRight, Eye, Info, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import PriceChangeIndicator from "./PriceChangeIndicator";
import StockDetailModal from "./StockDetailModal";

type SortField = "symbol" | "quantity" | "buyPrice" | "currentPrice" | "currentValue" | "gainLoss" | "advice";

interface PortfolioTableProps {
  portfolio: any[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({
  portfolio,
  onRefresh,
  isLoading = false,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showTip, setShowTip] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortPortfolio = (items: any[]) => {
    return [...items].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "symbol":
          aValue = a.stock?.symbol.toLowerCase();
          bValue = b.stock?.symbol.toLowerCase();
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "buyPrice":
          aValue = Number(a.buyPrice);
          bValue = Number(b.buyPrice);
          break;
        case "currentPrice":
          aValue = Number(a.realTimePrice?.price || 0);
          bValue = Number(b.realTimePrice?.price || 0);
          break;
        case "currentValue":
          aValue = calculateCurrentValue(a.realTimePrice?.price || 0, a.quantity);
          bValue = calculateCurrentValue(b.realTimePrice?.price || 0, b.quantity);
          break;
        case "gainLoss":
          aValue = calculateGainLoss(a.realTimePrice?.price || 0, a.buyPrice, a.quantity).gainLoss;
          bValue = calculateGainLoss(b.realTimePrice?.price || 0, b.buyPrice, b.quantity).gainLoss;
          break;
        case "advice":
          aValue = getAdviceRank(a);
          bValue = getAdviceRank(b);
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Order from best → worst (tweak to your liking)
  const ADVICE_ORDER: Record<string, number> = {
    strong_buy: 1,
    buy: 2,
    average_on_dips: 3,
    hold: 4,
    partial_sell: 5,
    sell: 6,
    need_attention: 7,
  };

  // Pull the decision action for a row (using your existing decisionsBySymbol)
  const getAdviceAction = (row: any) => decisionsBySymbol.get(row.stock?.symbol)?.action ?? null;

  const getAdviceRank = (row: any) => {
    const action = getAdviceAction(row);
    return action ? (ADVICE_ORDER[action] ?? 999) : 999; // unknowns go to bottom
  };

  // map rows → engine
  const decisionsBySymbol = new Map<string, ReturnType<typeof recommendForHolding>>();
  for (const row of portfolio) {
    const cur = Number(row.realTimePrice?.price ?? row.buyPrice);
    const prevClose =
      row.intradayPrice?.previousClose != null ? Number(row.intradayPrice.previousClose) : null;
    const analystUpsidePct =
      row.analystRating?.targetPriceHigh && cur
        ? ((Number(row.analystRating.targetPriceHigh) - cur) / cur) * 100
        : null;
    const input: HoldingInput = {
      symbol: row.stock?.symbol,
      buyPrice: Number(row.buyPrice),
      quantity: Number(row.quantity),
      currentPrice: cur,
      prevClose,
      volume: row.realTimePrice?.volume ? Number(row.realTimePrice.volume) : null,
      avgVolume3m: row.intradayPrice?.averageDailyVolume3Month
        ? Number(row.intradayPrice.averageDailyVolume3Month)
        : null,
      ma50: row.intradayPrice?.fiftyDayMovingAverage
        ? Number(row.intradayPrice.fiftyDayMovingAverage)
        : null,
      ma200: row.intradayPrice?.twoHundredDayMovingAverage
        ? Number(row.intradayPrice.twoHundredDayMovingAverage)
        : null,
      high52w: row.intradayPrice?.fiftyTwoWeekHigh
        ? Number(row.intradayPrice.fiftyTwoWeekHigh)
        : null,
      low52w: row.intradayPrice?.fiftyTwoWeekLow ? Number(row.intradayPrice.fiftyTwoWeekLow) : null,
      analystUpsidePct,
    };
    decisionsBySymbol.set(input.symbol, recommendForHolding(input));
  }

  const calculateCurrentValue = (Price: number, quantity: number) => {
    return Number(Price * quantity);
  };

  const calculateBuyValue = (buyPrice: number, quantity: number) => {
    return Number(buyPrice * quantity);
  };

  const calculateGainLoss = (Price: number, buyPrice: number, quantity: number) => {
    const currentValue = calculateCurrentValue(Price, quantity);
    const buyValue = calculateBuyValue(buyPrice, quantity);
    const gainLoss = Number(currentValue - buyValue);
    const gainLossPercentage = Number(((gainLoss / buyValue) * 100).toFixed(2));
    return { gainLoss, gainLossPercentage };
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this stock from your portfolio?")) {
      return;
    }
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/portfolio/?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onRefresh();
      } else {
        setErrorMessage("Failed to remove stock. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      setErrorMessage("Failed to remove stock. Please try again.");
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch("/api/portfolio/delete-all", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete all stocks");
        return;
      }
      onRefresh();
    } catch (err) {
      console.error("Delete all failed:", err);
      alert("Something went wrong while deleting stocks.");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleRowClick = (stock: any) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStock(null);
  };

  // helper for badge styles
  const badgeStyles: Record<string, string> = {
    need_attention: "bg-red-100 text-red-700",
    sell: "bg-red-100 text-red-700",
    partial_sell: "bg-orange-100 text-orange-700",
    hold: "bg-gray-100 text-gray-700",
    buy: "bg-green-100 text-green-700",
    strong_buy: "bg-emerald-100 text-emerald-700",
    average_on_dips: "bg-blue-100 text-blue-700",
  };

  // Check loading state FIRST
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="text-center text-gray-500 text-sm sm:text-base">
            Loading portfolio data...
          </div>
        </div>
      </div>
    );
  }

  // Then check for empty portfolio AFTER loading is complete
  if (!isLoading && portfolio.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-500 text-base sm:text-lg">No stocks in your portfolio yet.</div>
        <div className="text-gray-400 text-xs sm:text-sm mt-2">
          Add your first stock to get started!
        </div>
      </div>
    );
  }

  const sortedPortfolio = sortPortfolio(portfolio);

  return (
    <div>
      {/* Tip inside the same card */}
      {showTip && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-700 text-sm">
              <span>
                <strong>Tip:</strong> Click on any stock row to view detailed information and charts
              </span>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="Dismiss tip"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Holdings toolbar */}
      <div className="top-16 z-10 flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <h3 className="text-xs">Holdings</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
            {portfolio.length} {portfolio.length === 1 ? "stock" : "stocks"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {portfolio.length > 5 && (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={deletingAll}
              className={`rounded-md px-3 py-1.5 text-xs transition ${
                deletingAll
                  ? "cursor-not-allowed bg-red-400 text-white"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {deletingAll ? "Deleting…" : "Delete All"}
            </button>
          )}

          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDeleteAll}
            itemCount={portfolio.length}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("symbol")}
                >
                  Stock {sortField === "symbol" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity {sortField === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("buyPrice")}
                >
                  Purchase Price {sortField === "buyPrice" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("currentPrice")}
                >
                  Current Price{" "}
                  {sortField === "currentPrice" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("currentValue")}
                >
                  Current Value{" "}
                  {sortField === "currentValue" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("gainLoss")}
                >
                  Gain/Loss {sortField === "gainLoss" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => handleSort("advice")}
                >
                  Advice
                  {sortField === "advice" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPortfolio.map((item) => {
                const sym = item.stock?.symbol;
                const decision = decisionsBySymbol.get(sym);
                const recLabel = decision ? decision.action.replace(/_/g, " ").toUpperCase() : "--";
                const recCls = decision
                  ? (badgeStyles[decision.action] ?? "bg-gray-100 text-gray-700")
                  : "bg-gray-100 text-gray-700";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                    onClick={() => handleRowClick(item)}
                    title="Click to view detailed stock information"
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatSymbol(item.stock?.symbol)}{" "}
                          <span className="text-[10px] text-gray-500">{item.stock?.exchange}</span>
                        </div>
                        <div className="text-xs text-gray-500">{item.stock?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-md text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-md text-gray-900">{formatPrice(item.buyPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <PriceChangeIndicator
                        currentPrice={
                          item.realTimePrice?.price ? Number(item.realTimePrice.price) : null
                        }
                        previousPrice={
                          item.intradayPrice?.previousClose
                            ? Number(item.intradayPrice.previousClose)
                            : null
                        }
                        updatedAt={item.realTimePrice?.updatedAt}
                        className="justify-end"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-md text-gray-900">
                        {item.realTimePrice?.price ? (
                          `${formatPrice(calculateCurrentValue(item.realTimePrice.price, item.quantity))}`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-md font-medium gap-1 ${item.realTimePrice?.price ? (calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? "text-green-600" : "text-red-600") : ""}`}
                      >
                        {item.realTimePrice?.price ? (
                          `${formatPrice(calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss)}`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                      <div
                        className={`text-sm ${item.realTimePrice?.price ? (calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? "text-green-600" : "text-red-600") : ""}`}
                      >
                        {item.realTimePrice?.price ? (
                          `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-3">
                        {decision ? (
                          <span className={`text-[10px] px-2 py-1 rounded ${recCls}`}>
                            {recLabel}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View stock details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Remove from portfolio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedPortfolio.map((item) => {
          const sym = item.stock?.symbol;
          const decision = decisionsBySymbol.get(sym);
          const recLabel = decision ? decision.action.replace(/_/g, " ").toUpperCase() : "--";
          const recCls = decision
            ? (badgeStyles[decision.action] ?? "bg-gray-100 text-gray-700")
            : "bg-gray-100 text-gray-700";

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 relative group"
              onClick={() => handleRowClick(item)}
            >
              {/* Click indicator */}
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <div>
                  {decision ? (
                    <span className={`text-[11px] px-2 py-1 rounded ${recCls}`}>{recLabel}</span>
                  ) : null}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(item);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                  title="View stock details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                  title="Remove from portfolio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Enhanced hover indicator for mobile */}
              <div className="absolute top-12 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <span>Tap anywhere</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>

              {/* Stock Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-24">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-900 text-lg">
                      {formatSymbol(item.stock?.symbol)}
                    </div>
                    <div className="text-xs text-gray-400">{item.stock?.exchange}</div>
                  </div>
                  <div className="text-sm text-gray-500 truncate">{item.stock?.name}</div>
                </div>
              </div>

              {/* Stock Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Quantity</div>
                  <div className="font-medium text-gray-900">{item.quantity}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">
                    Purchase Price
                  </div>
                  <div className="font-medium text-gray-900">
                    {Number(item.buyPrice).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Current Price</div>
                  <PriceChangeIndicator
                    currentPrice={
                      item.realTimePrice?.price ? Number(item.realTimePrice.price) : null
                    }
                    previousPrice={
                      item.intradayPrice?.previousClose
                        ? Number(item.intradayPrice.previousClose)
                        : null
                    }
                    updatedAt={item.realTimePrice?.updatedAt}
                  />
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Current Value</div>
                  <div className="font-medium text-gray-900">
                    {item.realTimePrice?.price ? (
                      `${calculateCurrentValue(item.realTimePrice.price, item.quantity)}`
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gain/Loss Section */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Gain/Loss</div>
                <div className="flex justify-between items-center">
                  <div
                    className={`font-medium ${item.realTimePrice?.price ? (calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? "text-green-600" : "text-red-600") : "text-gray-400"}`}
                  >
                    {item.realTimePrice?.price
                      ? `${formatPrice(calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss)}`
                      : "N/A"}
                  </div>
                  <div
                    className={`text-sm font-medium ${item.realTimePrice?.price ? (calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? "text-green-600" : "text-red-600") : "text-gray-400"}`}
                  >
                    {item.realTimePrice?.price
                      ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Mobile click indicator at bottom */}
              <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center space-x-1 text-blue-500 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" />
                  <span>Tap to view details</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StockDetailModal
        open={showDetailModal}
        onClose={handleCloseDetailModal}
        stock={selectedStock}
      />
    </div>
  );
};

export default PortfolioTable;
