"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  DollarSign,
  Zap,
  Brain,
  LineChart,
  PieChart,
  Bell,
  Filter,
  Download,
  RefreshCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from 'lucide-react';

const StockMarketChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI Stock Market Assistant. I can analyze stocks, provide insights, and help with trading decisions. Try asking me about any Indian stock!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    riskTolerance: [50],
    investmentHorizon: 'medium-term',
    analysisDepth: [75],
    includeNews: true,
    includeTechnicals: true,
    includeFundamentals: true,
    realTimeAlerts: false,
    autoRefresh: true,
    darkMode: false,
    confidenceThreshold: [70],
    sectors: ['technology', 'banking', 'pharmaceutical'],
    marketCap: 'all'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Analyze RELIANCE', query: 'Analyze RELIANCE.NS for swing trading' },
    { label: 'Top Gainers Today', query: 'Show me top 10 gainers today' },
    { label: 'Nifty 50 Overview', query: 'Give me Nifty 50 analysis and outlook' },
    { label: 'Options Strategy', query: 'Suggest options strategy for volatile market' },
    { label: 'Sector Analysis', query: 'Which sector looks promising this month?' },
    { label: 'Market Sentiment', query: 'What is current market sentiment?' }
  ];

  const mockResponses = {
    'analyze': {
      type: 'analysis',
      content: {
        stock: 'RELIANCE.NS',
        recommendation: 'Buy',
        confidence: 78,
        reasoning: 'RELIANCE shows strong bullish momentum with good fundamentals. Oil refining margins are improving and retail segment is performing well.',
        price: '₹2,485.50',
        targets: {
          shortTerm: '₹2,650',
          mediumTerm: '₹2,800',
          stopLoss: '₹2,350'
        },
        technicals: {
          rsi: 'Neutral (45)',
          macd: 'Bullish Crossover',
          support: '₹2,400',
          resistance: '₹2,550'
        },
        sentiment: 'Positive',
        volume: 'Above Average (+25%)'
      }
    },
    'gainers': {
      type: 'list',
      content: {
        title: 'Top Gainers Today',
        items: [
          { name: 'ADANIPORTS', change: '+8.5%', price: '₹1,245' },
          { name: 'TATAMOTORS', change: '+6.2%', price: '₹890' },
          { name: 'BAJFINANCE', change: '+5.8%', price: '₹6,750' },
          { name: 'HDFCBANK', change: '+4.1%', price: '₹1,680' },
          { name: 'INFY', change: '+3.9%', price: '₹1,456' }
        ]
      }
    },
    'nifty': {
      type: 'market',
      content: {
        index: 'Nifty 50',
        value: '19,745.50',
        change: '+0.8% (+156.25)',
        outlook: 'Bullish',
        support: '19,500',
        resistance: '20,000',
        commentary: 'Nifty is showing strength above 19,700 levels. Banking and IT sectors are leading the rally. Watch for sustained move above 19,800 for further upside.'
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botResponse;
      const query = inputMessage.toLowerCase();
      
      if (query.includes('analyz') || query.includes('reliance')) {
        botResponse = createAnalysisResponse(mockResponses.analyze);
      } else if (query.includes('gainer') || query.includes('top')) {
        botResponse = createListResponse(mockResponses.gainers);
      } else if (query.includes('nifty')) {
        botResponse = createMarketResponse(mockResponses.nifty);
      } else {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: "I can help you with stock analysis, market insights, trading strategies, and more. Try asking about specific stocks, market trends, or use the quick actions above!",
          timestamp: new Date().toLocaleTimeString()
        };
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const createAnalysisResponse = (data: { content: any }) => ({
    id: Date.now() + 1,
    type: 'bot',
    subType: 'analysis',
    content: data.content,
    timestamp: new Date().toLocaleTimeString()
  });

  const createListResponse = (data: { content: any }) => ({
    id: Date.now() + 1,
    type: 'bot',
    subType: 'list',
    content: data.content,
    timestamp: new Date().toLocaleTimeString()
  });

  const createMarketResponse = (data: { content: any }) => ({
    id: Date.now() + 1,
    type: 'bot',
    subType: 'market',
    content: data.content,
    timestamp: new Date().toLocaleTimeString()
  });

  const handleQuickAction = (query: string) => {
    setInputMessage(query);
    handleSendMessage();
  };

  const renderMessage = (message: any) => {
    if (message.type === 'user') {
      return (
        <div key={message.id} className="flex justify-end mb-4">
          <div className="flex items-start gap-2 max-w-3xl">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
              <p className="text-sm">{message.content}</p>
              <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="flex justify-start mb-6">
        <div className="flex items-start gap-3 max-w-4xl w-full">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            {message.subType === 'analysis' ? renderAnalysisMessage(message) :
             message.subType === 'list' ? renderListMessage(message) :
             message.subType === 'market' ? renderMarketMessage(message) :
             renderTextMessage(message)}
          </div>
        </div>
      </div>
    );
  };

  const renderTextMessage = (message: { content: string; timestamp: string }) => (
    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border">
      <p className="text-sm text-gray-800">{message.content}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">{message.timestamp}</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ThumbsDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAnalysisMessage = (message: { content: any; timestamp: string }) => {
    const data = message.content;
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analysis: {data.stock}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${data.recommendation === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {data.recommendation}
              </Badge>
              <Badge variant="outline">{data.confidence}% Confidence</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{data.price}</div>
              <div className="text-sm text-gray-600">Current Price</div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-green-600">{data.sentiment}</div>
              <div className="text-sm text-gray-600">Market Sentiment</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">{data.reasoning}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Price Targets</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Short Term:</span>
                  <span className="font-medium text-green-600">{data.targets.shortTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Term:</span>
                  <span className="font-medium text-green-600">{data.targets.mediumTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stop Loss:</span>
                  <span className="font-medium text-red-600">{data.targets.stopLoss}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Technical Indicators</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>RSI:</span>
                  <span className="font-medium">{data.technicals.rsi}</span>
                </div>
                <div className="flex justify-between">
                  <span>MACD:</span>
                  <span className="font-medium text-green-600">{data.technicals.macd}</span>
                </div>
                <div className="flex justify-between">
                  <span>Support:</span>
                  <span className="font-medium">{data.technicals.support}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resistance:</span>
                  <span className="font-medium">{data.technicals.resistance}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">{message.timestamp}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Alert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListMessage = (message: { content: any; timestamp: string; }) => {
    const data = message.content;
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{data.title}</h3>
          <div className="space-y-3">
            {data.items.map(
              (
                item: { name: string; change: string; price: string },
                index: number
              ) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-green-600">{item.change}</div>
                    <div className="text-sm text-gray-600">{item.price}</div>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">{message.timestamp}</div>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMarketMessage = (message: { content: any; timestamp: string }) => {
    const data = message.content;
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{data.index}</h3>
            <Badge className="bg-green-100 text-green-800">{data.outlook}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{data.value}</div>
              <div className="text-lg font-medium text-green-600">{data.change}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Support:</span>
                <span className="font-medium">{data.support}</span>
              </div>
              <div className="flex justify-between">
                <span>Resistance:</span>
                <span className="font-medium">{data.resistance}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{data.commentary}</p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">{message.timestamp}</div>
            <Button variant="ghost" size="sm">
              <LineChart className="h-4 w-4 mr-1" />
              View Chart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
      {/* Sidebar - Settings Panel */}
      <div className={`${showSettings ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">AI Settings</h2>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Risk Tolerance */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Risk Tolerance</label>
            <Slider
              value={settings.riskTolerance}
              onValueChange={(value) => setSettings({...settings, riskTolerance: value})}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          {/* Investment Horizon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Investment Horizon</label>
            <Select value={settings.investmentHorizon} onValueChange={(value) => setSettings({...settings, investmentHorizon: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scalping">Scalping</SelectItem>
                <SelectItem value="intraday">Intraday</SelectItem>
                <SelectItem value="short-term">Short Term</SelectItem>
                <SelectItem value="medium-term">Medium Term</SelectItem>
                <SelectItem value="long-term">Long Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analysis Depth */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Analysis Depth</label>
            <Slider
              value={settings.analysisDepth}
              onValueChange={(value) => setSettings({...settings, analysisDepth: value})}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Basic</span>
              <span>Comprehensive</span>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Include News Analysis</label>
              <Switch
                checked={settings.includeNews}
                onCheckedChange={(checked) => setSettings({...settings, includeNews: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Technical Analysis</label>
              <Switch
                checked={settings.includeTechnicals}
                onCheckedChange={(checked) => setSettings({...settings, includeTechnicals: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Fundamental Analysis</label>
              <Switch
                checked={settings.includeFundamentals}
                onCheckedChange={(checked) => setSettings({...settings, includeFundamentals: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Real-time Alerts</label>
              <Switch
                checked={settings.realTimeAlerts}
                onCheckedChange={(checked) => setSettings({...settings, realTimeAlerts: checked})}
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Advanced Settings
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Confidence Threshold</label>
                  <Slider
                    value={settings.confidenceThreshold}
                    onValueChange={(value) => setSettings({...settings, confidenceThreshold: value})}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Market Cap Focus</label>
                  <Select value={settings.marketCap} onValueChange={(value) => setSettings({...settings, marketCap: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Caps</SelectItem>
                      <SelectItem value="large">Large Cap</SelectItem>
                      <SelectItem value="mid">Mid Cap</SelectItem>
                      <SelectItem value="small">Small Cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Stock Market AI</h1>
                <p className="text-sm text-gray-600">Your intelligent trading assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleQuickAction(action.query)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map(renderMessage)}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about stocks, market trends, trading strategies..."
                className="pr-12 h-12 rounded-full border-gray-300 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>AI can make mistakes. Verify important information.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                AI Powered
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMarketChatbot;