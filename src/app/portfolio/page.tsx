"use client"
import { SideBar } from '@/components/SideBar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs';
import PortfolioTable from '@/components/portfolio/PortfolioTable'
import AddStockModal from '@/components/portfolio/AddStockModal';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import { cn } from '@/lib/utils'

const PortfolioPage = () => {
  const { user } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => setShowAddModal(true);
  const handleCloseModal = () => setShowAddModal(false);
  const handleSuccess = () => setRefreshKey(k => k + 1);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        if (data.success) {
          setPortfolio(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [refreshKey]);

  return (
    <div className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row ",
        "min-h-screen", // for your use case, use `h-screen` instead of `h-[60vh]`
      )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {user?.firstName || 'Investor'}'s Portfolio.
            </h1>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button onClick={handleAddClick} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </header>
        
        <AddStockModal open={showAddModal} onClose={handleCloseModal} onSuccess={handleSuccess} />
        
        {/* Body */}
        <main className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-6 py-2 sm:py-6">
          <PortfolioSummary portfolio={portfolio} />
          <PortfolioTable
            portfolio={portfolio}
            onRefresh={() => setRefreshKey(k => k + 1)}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  )
}

export default PortfolioPage