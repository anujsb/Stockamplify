import { Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import StockDetailModal from './StockDetailModal';

interface PortfolioTableProps {
    portfolio: any[];
    onRefresh: () => void;
    isLoading?: boolean;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolio, onRefresh, isLoading = false }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const calculateCurrentValue = (Price: number, quantity: number) => {
        return Number((Price * quantity).toFixed(2));
    }

    const calculateBuyValue = (buyPrice: number, quantity: number) => {
        return Number((buyPrice * quantity).toFixed(2));
    }

    const calculateGainLoss = (Price: number, buyPrice: number, quantity: number) => {
        const currentValue = calculateCurrentValue(Price, quantity);
        const buyValue = calculateBuyValue(buyPrice, quantity);
        const gainLoss = Number((currentValue - buyValue).toFixed(2));
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

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purchase Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gain/Loss
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {portfolio.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(item)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{item.stock?.symbol}</div>
                                        <div className="text-sm text-gray-500">{item.stock?.name}</div>
                                        <div className="text-xs text-gray-400">{item.stock?.exchange}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-md text-gray-900">{item.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-md text-gray-900">₹{Number(item.buyPrice).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-md text-gray-900">
                                            {item.realTimePrice?.price !== undefined && item.realTimePrice?.price !== null ? `₹${Number(item.realTimePrice.price).toFixed(2)}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-md text-gray-900">
                                            {item.realTimePrice?.price ? `₹${calculateCurrentValue(item.realTimePrice.price, item.quantity)}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-md font-medium flex items-center gap-1 ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? `₹${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                        <div className={`text-sm ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%` : <span className="text-gray-400">N/A</span>}
                                        </div>
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
                {portfolio.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleRowClick(item)}
                    >
                        {/* Stock Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 text-lg">{item.stock?.symbol}</div>
                                <div className="text-sm text-gray-500 truncate">{item.stock?.name}</div>
                                <div className="text-xs text-gray-400">{item.stock?.exchange}</div>
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
                                <div className="font-medium text-gray-900">₹{Number(item.buyPrice).toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Current Price</div>
                                <div className="font-medium text-gray-900">
                                    {item.realTimePrice?.price !== undefined && item.realTimePrice?.price !== null ? `₹${Number(item.realTimePrice.price).toFixed(2)}` : <span className="text-gray-400">N/A</span>}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase tracking-wide">Current Value</div>
                                <div className="font-medium text-gray-900">
                                    {item.realTimePrice?.price ? `₹${calculateCurrentValue(item.realTimePrice.price, item.quantity)}` : <span className="text-gray-400">N/A</span>}
                                </div>
                            </div>
                        </div>

                        {/* Gain/Loss Section */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Gain/Loss</div>
                            <div className="flex justify-between items-center">
                                <div className={`font-medium ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-400'}`}>
                                    {item.realTimePrice?.price ? `₹${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss}` : 'N/A'}
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