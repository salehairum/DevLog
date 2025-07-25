import React, { useEffect, useState } from "react";
import { LogCard } from "./LogCard";
import { AddLogButton } from "./AddLogButton";
import { AddLogForm } from "./AddLogForm";
import { auth } from "../firebaseConfig";
import { useAuth } from '@/contexts/AuthContext'
import envConfig from '../env-config';

export function LogContainer({ logs, setLogs, loading, fetchLogs, className }) {
    const [showForm, setShowForm] = useState(false)
    const [editingLogId, setEditingLogId] = useState(null)

    const BASE_URL = envConfig.VITE_BACKEND_API_BASE_URL
    const { user } = useAuth()

    const getToken = async () => {
        if (!user) throw new Error("User not logged in")
        return await user.getIdToken()
    }

    const handleAddLog = async (newLog) => {
        try {
            const token = await getToken()

            const response = await fetch(`${BASE_URL}/logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(newLog),
            })

            if (!response.ok) throw new Error("Failed to add log")
            await fetchLogs() // refetch after adding
            setShowForm(false)
        } catch (err) {
            console.error("Error adding log:", err)
        }
    }

    const handleDeleteLog = async (logId) => {
        try {
            const token = await getToken()

            const response = await fetch(`${BASE_URL}/logs/${logId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            if (!response.ok) throw new Error("Failed to delete log")
            await fetchLogs()
        } catch (err) {
            console.error("Error deleting log:", err)
        }
    }

    const handleUpdateLog = async (logId, updatedLog) => {
        const { title, project, time_taken } = updatedLog
        try {
            const token = await getToken()

            const response = await fetch(`${BASE_URL}/logs/${logId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ title, project, time_taken }),
            })

            if (!response.ok) throw new Error("Failed to update log")
            await fetchLogs()
            setEditingLogId(null)
        } catch (err) {
            console.error("Error updating log:", err)
        }
    }

    return (
        <div className={`bg-white rounded-xl shadow-md w-full flex flex-col p-6 h-full ${className}`}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Logs</h2>
                <AddLogButton onClick={() => setShowForm((show) => !show)} />
            </div>

            {showForm && <AddLogForm onAdd={handleAddLog} onCancel={() => setShowForm(false)} />}

            <div className="overflow-y-auto space-y-4 flex-grow">
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading logs...</p>
                ) : logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No logs found.</p>
                ) : (
                    logs.map((log) => (
                        <LogCard
                            key={log._id}
                            id={log._id}
                            title={log.title}
                            project={log.project}
                            time_taken={log.time_taken}
                            date={log.date}
                            onDelete={handleDeleteLog}
                            isEditing={editingLogId === log._id}
                            onEdit={() => setEditingLogId(log._id)}
                            onUpdate={handleUpdateLog}
                            onCancelEdit={() => setEditingLogId(null)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}