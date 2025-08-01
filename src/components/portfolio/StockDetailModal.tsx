import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Brain, Newspaper, Calculator, Activity } from 'lucide-react';
import { formatPrice, formatSymbol } from '@/lib/utils/stockUtils';
import OverViewTab from '@/components/portfolio/OverViewTab';
import ChartTab from '@/components/portfolio/ChartTab';
import AiAnalysisTab from '@/components/portfolio/AiAnalysisTab';
import NewsAndActionsTab from './NewsAndActionsTab';
import FinancialTab from './FinancialTab';
import TechnicalTab from './TechnicalTab';

interface StockDetailModalProps {
    open: boolean;
    onClose: () => void;
    stock: any; // Portfolio item with stock data
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ open, onClose, stock }) => {
    if (!stock) return null;

    // const formatCurrency = (value: number) => `${Number(value).toFixed(2)}`;
    const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

    const calculateGainLoss = () => {
        const currentValue = Number(stock.currentPrice) * stock.quantity;
        const buyValue = Number(stock.buyPrice) * stock.quantity;
        const gainLoss = currentValue - buyValue;
        const gainLossPercentage = (gainLoss / buyValue) * 100;
        return { gainLoss, gainLossPercentage };
    };

    const { gainLoss, gainLossPercentage } = calculateGainLoss();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[75vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-4 mt-4">
                        <div className="flex-1">
                            <div className="text-xl font-bold text-foreground">{formatSymbol(stock.stock.symbol)}</div>
                            <div className="text-sm text-muted-foreground">{stock.stock.name}</div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-lg font-semibold">{formatPrice(stock.realTimePrice.price)}</div>
                                <Badge variant="outline" className="shrink-0">
                                    {stock.stock.exchange}
                                </Badge>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 grid-rows-2 md:grid-rows-1 min-h-max">
                        {/* <TabsList className="grid w-full grid-cols-6"> */}
                        <TabsTrigger value="overview" className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            Chart
                        </TabsTrigger>
                        <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            AI Analysis
                        </TabsTrigger>
                        <TabsTrigger value="news" className="flex items-center gap-1">
                            <Newspaper className="h-4 w-4" />
                            News
                        </TabsTrigger>
                        <TabsTrigger value="financials" className="flex items-center gap-1">
                            <Calculator className="h-4 w-4" />
                            Financials
                        </TabsTrigger>
                        {/* <TabsTrigger value="technicals" className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Technicals
                        </TabsTrigger> */}
                    </TabsList>

                    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 overflow-y-auto">
                        <TabsContent value="overview">
                            <OverViewTab item={stock} />
                        </TabsContent>

                        <TabsContent value="chart" className="space-y-4 p-6">
                            <ChartTab item={stock} />
                        </TabsContent>

                        <TabsContent value="ai-analysis" className="space-y-4 p-6">
                            <AiAnalysisTab item={stock} />
                        </TabsContent>

                        <TabsContent value="news" className="space-y-4 p-6">
                            <NewsAndActionsTab item={stock} />
                        </TabsContent>

                        <TabsContent value="financials" className="space-y-4 p-6">
                            <FinancialTab item={stock} />
                        </TabsContent>

                        {/* <TabsContent value="technicals" className="space-y-4 p-6">
                            <TechnicalTab item={stock} />
                        </TabsContent> */}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StockDetailModal;