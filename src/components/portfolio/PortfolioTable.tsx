import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import StockDetailModal from './StockDetailModal';

const PortfolioTable = () => {
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);


    useEffect(() => {
        const fetchPortfolio = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/portfolio');
                const data = await res.json();
                if (data.success) {
                    setPortfolio(data.data);
                } else {
                    setError(data.error || 'Failed to fetch portfolio');
                }
            } catch (err) {
                setError('Failed to fetch portfolio');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const calculateCurrentValue = (currentPrice: number, quantity: number) => {
        return Number((currentPrice * quantity).toFixed(2));
    }

    const calculateBuyValue = (buyPrice: number, quantity: number) => {
        return Number((buyPrice * quantity).toFixed(2));
    }

    const calculateGainLoss = (currentPrice: number, buyPrice: number, quantity: number) => {
        const currentValue = calculateCurrentValue(currentPrice, quantity);
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
                setPortfolio(portfolio.filter(item => item.id !== id));
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
                                        <div className="text-gray-500">{item.stock?.name}</div>
                                        <div className="text-gray-500">{item.stock?.exchange}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{item.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">₹{Number(item.buyPrice).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {item.currentPrice !== undefined && item.currentPrice !== null ? `₹${Number(item.currentPrice).toFixed(2)}` : <span className="text-gray-400">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {calculateCurrentValue(item.currentPrice, item.quantity)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {calculateGainLoss(item.currentPrice, item.buyPrice, item.quantity).gainLoss}
                                        </div>
                                        <div className="text-gray-500">
                                            {calculateGainLoss(item.currentPrice, item.buyPrice, item.quantity).gainLossPercentage}%
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