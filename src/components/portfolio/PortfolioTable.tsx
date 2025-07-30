import { Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import StockDetailModal from './StockDetailModal';

interface PortfolioTableProps {
    portfolio: any[];
    onRefresh: () => void;
    isLoading?: boolean; // Add this prop
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
                onRefresh(); // Refresh the portfolio data
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
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-[250px]"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-[400px]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[350px]"></div>
                        <div className="h-4 bg-gray-200 rounded w-[300px]"></div>
                    </div>
                    <div className="text-center text-gray-500">Loading portfolio data...</div>
                </div>
            </div>
        );
    }

    // Then check for empty portfolio AFTER loading is complete
    if (!isLoading && portfolio.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No stocks in your portfolio yet.</div>
                <div className="text-gray-400 text-sm mt-2">Add your first stock to get started!</div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                        <div className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{item.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="px-6 py-4 whitespace-nowrap text-md text-gray-900">₹{Number(item.buyPrice).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                                            {item.realTimePrice?.price !== undefined && item.realTimePrice?.price !== null ? `₹${Number(item.realTimePrice.price).toFixed(2)}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                                            {item.realTimePrice?.price ? calculateCurrentValue(item.realTimePrice.price, item.quantity) : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-md font-medium flex items-center gap-1 ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLoss : <span className="text-gray-400">N/A</span>}
                                        </div>
                                        <div className={`text-sm ${item.realTimePrice?.price ? calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600' : ''}`}>
                                            {item.realTimePrice?.price ? `${calculateGainLoss(item.realTimePrice.price, item.buyPrice, item.quantity).gainLossPercentage}%` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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