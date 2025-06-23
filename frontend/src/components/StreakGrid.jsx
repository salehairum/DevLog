import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import envConfig from '../env-config';

const DAY_COUNT = 30

// Helper to get an array of last N dates as YYYY-MM-DD strings, oldest first
function getLastNDates(n) {
    const dates = []
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        dates.push(d.toISOString().slice(0, 10)) // YYYY-MM-DD
    }
    return dates
}

export function StreakGrid() {
    const { user } = useAuth()
    const [dailyHours, setDailyHours] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const BASE_URL = envConfig.VITE_BACKEND_API_BASE_URL

    useEffect(() => {
        if (!user) return

        async function fetchLogs() {

            setLoading(true)
            setError(null)
            try {
                if (!user) throw new Error('User not logged in')
                const token = await user.getIdToken()

                const res = await fetch(`${BASE_URL}/logs/streak?days=${DAY_COUNT}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error('Failed to fetch logs')

                const logs = await res.json()
                // logs = [{ date: '2025-06-23', time_taken: 2.5 }, ...]

                // Sum time_taken per date
                const sums = {}
                for (const log of logs) {
                    sums[log.date] = (sums[log.date] || 0) + log.time_taken
                }
                setDailyHours(sums)
            } catch (err) {
                setError(err.message || 'Error fetching streak data')
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [user])

    if (!user) return <p>Please login to see your streak</p>
    if (loading) return <p>Loading streak...</p>
    if (error) return <p className="text-red-600">Error: {error}</p>

    const last30Days = getLastNDates(DAY_COUNT)

    return (
        <div>
            <div className="bg-white p-3 rounded shadow">
                <div
                    className="grid grid-cols-6 grid-rows-5 gap-1"
                    style={{ width: 164 }} // 6 cols * 24px + 5 gaps * 4px = 164px
                >
                    {last30Days.map((date) => {
                        const hours = dailyHours[date] || 0
                        const bgColor =
                            hours >= 3
                                ? 'bg-logs1'
                                : hours > 0
                                    ? 'bg-logs2'
                                    : 'bg-gray-200'

                        return (
                            <div
                                key={date}
                                title={`${date} — ${hours.toFixed(2)} hrs`}
                                className={`w-6 h-6 rounded-sm cursor-default ${bgColor}`}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
      
}
