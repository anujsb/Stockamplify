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
            {/* <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full sm:max-w-[90vw] sm:max-h-[90vh] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] p-0 overflow-hidden"> */}
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto sm:max-w-[90vw] sm:max-h-[90vh] md:max-w-[80vw] lg:max-w-[75vw] p-0 overflow-hidden">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-0 md:mt-4">
                        <div className="flex-1 min-w-0">
                            <div className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {formatSymbol(stock.stock.symbol)}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                {stock.stock.name}
                            </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between sm:justify-end gap-3 md:gap-0 shrink-0">
                            <div className="text-right">
                                <div className="text-lg sm:text-xl font-semibold">
                                    {formatPrice(stock.realTimePrice.price)}
                                </div>
                            </div>
                            <Badge variant="outline" className="shrink-0 text-xs">
                                {stock.stock.exchange}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full px-0 md:px-2">
                    {/* Mobile: Scrollable horizontal tabs */}
                    {/* <div className="px-4 sm:px-0 py-2 border-b sm:border-none overflow-x-auto sm:overflow-visible"> */}
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-1"
                        >
                            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Overview</span>
                            <span className="sm:hidden">Info</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="chart"
                            className="flex items-center gap-1"
                        >
                            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                            Chart
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai-analysis"
                            className="flex items-center gap-1"
                        >
                            <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">AI Analysis</span>
                            <span className="sm:hidden">AI</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="news"
                            className="flex items-center gap-1"
                        >
                            <Newspaper className="h-3 w-3 sm:h-4 sm:w-4" />
                            News
                        </TabsTrigger>
                        <TabsTrigger
                            value="financials"
                            className="flex items-center gap-1"
                        >
                            <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Financials</span>
                            <span className="sm:hidden">Finance</span>
                        </TabsTrigger>
                    </TabsList>
                    {/* </div> */}

                    {/* Content area with proper scrolling */}
                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="overview" className="mt-0 h-full">
                            <div className="p-4 sm:p-6">
                                <OverViewTab item={stock} />
                            </div>
                        </TabsContent>

                        <TabsContent value="chart" className="mt-0 h-full">
                            <div className="p-4 sm:p-6">
                                <ChartTab item={stock} />
                            </div>
                        </TabsContent>

                        <TabsContent value="ai-analysis" className="mt-0 h-full">
                            <div className="p-4 sm:p-6">
                                <AiAnalysisTab item={stock} />
                            </div>
                        </TabsContent>

                        <TabsContent value="news" className="mt-0 h-full">
                            <div className="p-4 sm:p-6">
                                <NewsAndActionsTab item={stock} />
                            </div>
                        </TabsContent>

                        <TabsContent value="financials" className="mt-0 h-full">
                            <div className="p-4 sm:p-6">
                                <FinancialTab item={stock} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StockDetailModal;