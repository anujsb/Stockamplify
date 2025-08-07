import { Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import StockDetailModal from './StockDetailModal';
import PriceChangeIndicator from './PriceChangeIndicator';
import { formatPercentage, formatPrice, formatLargeNumber, formatSymbol, getPriceChangeColor } from '@/lib/utils/stockUtils';

type SortField = 'symbol' | 'quantity' | 'buyPrice' | 'currentPrice' | 'currentValue' | 'gainLoss';

interface PortfolioTableProps {
    portfolio: any[];
    onRefresh: () => void;
    isLoading?: boolean;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolio, onRefresh, isLoading = false }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [sortField, setSortField] = useState<SortField>('symbol');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortPortfolio = (items: any[]) => {
        return [...items].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'symbol':
                    aValue = a.stock?.symbol.toLowerCase();
                    bValue = b.stock?.symbol.toLowerCase();
                    break;
                case 'quantity':
                    aValue = a.quantity;
                    bValue = b.quantity;
                    break;
                case 'buyPrice':
                    aValue = Number(a.buyPrice);
                    bValue = Number(b.buyPrice);
                    break;
                case 'currentPrice':
                    aValue = Number(a.realTimePrice?.price || 0);
                    bValue = Number(b.realTimePrice?.price || 0);
                    break;
                case 'currentValue':
                    aValue = calculateCurrentValue(a.realTimePrice?.price || 0, a.quantity);
                    bValue = calculateCurrentValue(b.realTimePrice?.price || 0, b.quantity);
                    break;
                case 'gainLoss':
                    aValue = calculateGainLoss(a.realTimePrice?.price || 0, a.buyPrice, a.quantity).gainLoss;
                    bValue = calculateGainLoss(b.realTimePrice?.price || 0, b.buyPrice, b.quantity).gainLoss;
                    break;
                default:
                    aValue = 0;
                    bValue = 0;
            }

            if (sortDirection === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
            }
        });
    };

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const calculateCurrentValue = (Price: number, quantity: number) => {
        return Number((Price * quantity));
    }

    const calculateBuyValue = (buyPrice: number, quantity: number) => {
        return Number((buyPrice * quantity));
    }

    const calculateGainLoss = (Price: number, buyPrice: number, quantity: number) => {
        const currentValue = calculateCurrentValue(Price, quantity);
        const buyValue = calculateBuyValue(buyPrice, quantity);
        const gainLoss = Number((currentValue - buyValue));
        const gainLossPercentage = Number(((gainLoss / buyValue) * 100).toFixed(2));
        return { gainLoss, gainLossPercentage };
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this stock from your portfolio?')) {
            return;
        }
        setErrorMessage(null);
        try {
            const response = await fetch(`/api/portfolio/?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                onRefresh();
            } else {
                setErrorMessage('Failed to remove stock. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting portfolio item:', error);
            setErrorMessage('Failed to remove stock. Please try again.');
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
                    <div className="text-center text-gray-500 text-sm sm:text-base">Loading portfolio data...</div>
                </div>
            </div>
        );
    }

    // Then check for empty portfolio AFTER loading is complete
    if (!isLoading && portfolio.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12">
                <div className="text-gray-500 text-base sm:text-lg">No stocks in your portfolio yet.</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-2">Add your first stock to get started!</div>
            </div>
        );
    }

    const sortedPortfolio = sortPortfolio(portfolio);

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('symbol')}
                                >
                                    Stock {sortField === 'symbol' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('quantity')}
                                >
                                    Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('buyPrice')}
                                >
                                    Purchase Price {sortField === 'buyPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('currentPrice')}
                                >
                                    Current Price {sortField === 'currentPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('currentValue')}
                                >
                                    Current Value {sortField === 'currentValue' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-xs font-medium text-gray-500 text-right uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('gainLoss')}
                                >
                                    Gain/Loss {sortField === 'gainLoss' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Signal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPortfolio.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(item)}
                                >
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium text-gray-900">{formatSymbol(item.stock?.symbol)} {' '}
                                                <span className="text-[10px] text-gray-500">{item.stock?.exchange}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">{item.stock?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-md text-gray-900">{item.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-md text-gray-900">{formatPrice(item.buyPrice)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <PriceChangeIndicator
                                            currentPrice={item.realTimePrice?.price ? Number(item.realTimePrice.price) : null}
                                            previousPrice={item.intradayPrice?.previousClose ? Number(item.intradayPrice.previousClose) : null}
                                            updatedAt={item.realTimePrice?.updatedAt}
                                            className="justify-end"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="text-md text-gray-900">
                                            {item.realTimePrice?.price ? `${formatPrice(calculateCurrentValue(item.realTimePrice.price, item.quantity))}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className={`text-md font-medium gap-1 ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? `${formatPrice(calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss)}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                        <div className={`text-sm ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span>--</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Remove from portfolio"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {sortedPortfolio.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleRowClick(item)}
                    >
                        {/* Stock Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <div className="font-medium text-gray-900 text-lg">{formatSymbol(item.stock?.symbol)}</div>
                                    <div className="text-xs text-gray-400">{item.stock?.exchange}</div>
                                </div>
                                <div className="text-sm text-gray-500 truncate">{item.stock?.name}</div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                }}
                                className="text-red-600 hover:text-red-900 transition-colors p-1"
                                title="Remove from portfolio"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Stock Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Quantity</div>
                                <div className="font-medium text-gray-900">{item.quantity}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Purchase Price</div>
                                <div className="font-medium text-gray-900">{Number(item.buyPrice).toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Current Price</div>
                                <PriceChangeIndicator
                                    currentPrice={item.realTimePrice?.price ? Number(item.realTimePrice.price) : null}
                                    previousPrice={item.intradayPrice?.previousClose ? Number(item.intradayPrice.previousClose) : null}
                                    updatedAt={item.realTimePrice?.updatedAt}
                                />
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Current Value</div>
                                <div className="font-medium text-gray-900">
                                    {item.realTimePrice?.price ? `${calculateCurrentValue(item.realTimePrice.price, item.quantity)}` : <span className="text-gray-400">N/A</span>}
                                </div>
                            </div>
                        </div>

                        {/* Gain/Loss Section */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Gain/Loss</div>
                            <div className="flex justify-between items-center">
                                <div className={`font-medium ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-400'}`}>
                                    {item.realTimePrice?.price ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss}` : 'N/A'}
                                </div>
                                <div className={`text-sm font-medium ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-400'}`}>
                                    {item.realTimePrice?.price ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <StockDetailModal
                open={showDetailModal}
                onClose={handleCloseDetailModal}
                stock={selectedStock}
            />
        </div>
    )
}

export default PortfolioTable