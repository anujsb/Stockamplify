"use client"
import { SideBar } from '@/components/SideBar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@clerk/nextjs';
import PortfolioTable from '@/components/portfolio/PortfolioTable'


const PortfolioPage = () => {
    const { user } = useUser();
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
                        {/* <p className="text-gray-600 mt-1">Here's your portfolio overview</p> */}
                    </div>
                    <div className="flex gap-3">
                        {/* <Link href="/portfolio"> */}
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Stock
                        </Button>
                        {/* </Link> */}
                    </div>
                </header>
                {/* Body */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PortfolioTable />
                </main>
            </div>
        </div>
    )
}

export default PortfolioPage