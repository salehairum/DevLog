import { React, useState, useEffect } from 'react'
import { SideBar } from '@/components/SideBar'
import { LogContainer } from '@/components/LogContainer'
import { FilterContainer } from '@/components/FilterContainer'
import { LogChart } from '@/components/LogChart'
import { auth } from '@/firebaseConfig'

export default function Dashboard({ user, onLogout }) {
    const [filters, setFilters] = useState({ project: '', date: '' })

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL
    const fetchLogs = async () => {
        setLoading(true)
        try {
            const user = auth.currentUser
            if (!user) throw new Error('User not logged in')
            const token = await user.getIdToken()

            const queryParams = new URLSearchParams()
            if (filters.project) queryParams.append('project', filters.project)
            if (filters.date) queryParams.append('date', filters.date)

            const response = await fetch(`${BASE_URL}/logs?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) throw new Error('Failed to fetch logs')
            const data = await response.json()
            setLogs(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [filters])

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
    }

    return (
        <div className="min-h-screen flex bg-background2">
            <SideBar onLogout={onLogout} />

            <main className="p-6 flex flex-1 gap-6 items-start w-full">
                <div className="flex flex-col gap-6 flex-grow-[1]">
                    <FilterContainer filters={filters} onFilterChange={handleFilterChange} />
                </div>

                <div className="flex flex-col gap-6 flex-grow-[2] max-h-full w-full overflow-auto">
                    <LogChart logs={logs} />
                    <LogContainer
                        logs={logs}
                        setLogs={setLogs}
                        loading={loading}
                        fetchLogs={fetchLogs}
                    />
                </div>
            </main>
        </div>
    )
}
