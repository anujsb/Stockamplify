"use client"
import { SideBar } from '@/components/SideBar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs';
import PortfolioTable from '@/components/portfolio/PortfolioTable'
import AddStockModal from '@/components/portfolio/AddStockModal';

const PortfolioPage = () => {
    const { user } = useUser();
    const [showAddModal, setShowAddModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddClick = () => setShowAddModal(true);
    const handleCloseModal = () => setShowAddModal(false);
    const handleSuccess = () => setRefreshKey(k => k + 1);

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <header className="flex justify-between items-center ">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {user?.firstName || 'Investor'}'s Portfolio.
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAddClick}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Stock
                        </Button>
                    </div>
                </header>
                <AddStockModal open={showAddModal} onClose={handleCloseModal} onSuccess={handleSuccess} />
                {/* Body */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PortfolioTable key={refreshKey} />
                </main>
            </div>
        </div>
    )
}

export default PortfolioPage