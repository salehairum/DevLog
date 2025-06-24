import { React, useState, useEffect } from 'react'
import { SideBar } from '@/components/SideBar'
import { LogContainer } from '@/components/LogContainer'
import { LogChart } from '@/components/LogChart'
import { auth } from '@/firebaseConfig'
import { useAuth } from '@/contexts/AuthContext'
import { SearchTabs } from "@/components/SearchTabs"
import envConfig from '../env-config';

export default function Dashboard() {
    const [filters, setFilters] = useState({ project: '', date: '' })

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const [semanticQuery, setSemanticQuery] = useState("")

    const { user, logout } = useAuth()

    const BASE_URL = envConfig.VITE_BACKEND_API_BASE_URL

    const fetchLogs = async () => {
        setLoading(true)
        try {
            if (!user) throw new Error('User not logged in')
            const token = await user.getIdToken()


            const queryParams = new URLSearchParams()
            if (filters.project) queryParams.append('project', filters.project)
            if (filters.date) queryParams.append('date', filters.date)

            console.log(queryParams.toString());

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
        if (!semanticQuery.trim()) {
            fetchLogs()
        }
    }, [filters, semanticQuery])

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
    }

    const fetchSemanticLogs = async (queryText) => {
        setLoading(true)
        try {
            if (!user) throw new Error("User not logged in")
            const token = await user.getIdToken()

            const response = await fetch(`${BASE_URL}/logs/search`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: queryText,
                    top_n: 5,
                }),
            })

            if (!response.ok) throw new Error("Semantic search failed")
            const data = await response.json()
            setLogs(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    const handleSemanticSearch = (query) => {
        setSemanticQuery(query)
        if (query.trim()) {
            fetchSemanticLogs(query)
        } else {
            fetchLogs()
        }
    }


    return (
        <div className="min-h-screen flex bg-background2">
            <SideBar />

            <main className="p-6 flex flex-1 gap-6 items-start w-full h-screen">
                {/* Left column: Filters + Chart */}
                <div className="flex flex-col gap-6 w-1/2 h-full">
                    <SearchTabs
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSemanticSearch={handleSemanticSearch}
                    />
                    <LogChart logs={logs} className="flex-grow" />
                </div>

                {/* Right column: Logs only */}
                <div className="w-1/2 h-full">
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
