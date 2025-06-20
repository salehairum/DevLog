import React from 'react'
import { SideBar } from '@/components/SideBar'
import { LogCard } from '@/components/LogCard'
import { LogContainer } from '@/components/LogContainer'

export default function Dashboard() {
    const handleSignOut = () => {
        alert('Signing out...')
    }

    return (
        <div className="min-h-screen flex bg-background2">
            {/* Sidebar on the left */}
            <SideBar onSignOut={handleSignOut} />

            {/* Main content on the right */}
            <main className="p-6 flex-1">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <LogContainer>
                    <LogCard
                        title="Fixed login bug"
                        projectName="Devlog Dashboard"
                        hours={2.5}
                    />
                </LogContainer>
            </main>
        </div>
    )
}
