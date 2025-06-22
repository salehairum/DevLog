import React, { useEffect, useState } from "react";
import { LogCard } from "./LogCard";
import { AddLogButton } from "./AddLogButton";
import { AddLogForm } from "./AddLogForm";
import { auth } from "../firebaseConfig";

export function LogContainer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLogId, setEditingLogId] = useState(null);

    const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

    const fetchLogs = async () => {

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not logged in");

            const token = await user.getIdToken();

            const response = await fetch(`${BASE_URL}/logs`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) throw new Error("Failed to fetch logs");

            const data = await response.json();
            setLogs(data);
            console.log(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);


    const handleAddLog = async (newLog) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not logged in");

            const token = await user.getIdToken();

            const response = await fetch(`${BASE_URL}/logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(newLog),
            });

            if (!response.ok) throw new Error("Failed to add log");
            const createdLog = await response.json();

            setLogs((prevLogs) => [createdLog, ...prevLogs]);
            setShowForm(false); // hide form after adding
        } catch (err) {
            console.error("Error adding log:", err);
        }
    };

    const handleDeleteLog = async (logId) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not logged in");

            const token = await user.getIdToken();

            const response = await fetch(`${BASE_URL}/logs/${logId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete log");

            setLogs((prevLogs) => prevLogs.filter((log) => log._id !== logId));
        } catch (err) {
            console.error("Error deleting log:", err);
        }
    };

    const handleUpdateLog = async (logId, updatedLog) => {
        const { title, project, time_taken } = updatedLog;

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not logged in");

            const token = await user.getIdToken();

            const response = await fetch(`${BASE_URL}/logs/${logId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ title, project, time_taken }),
            });

            if (!response.ok) throw new Error("Failed to update log");

            // Optionally refetch the updated log or optimistically update it
            const updated = await response.json();
            setLogs((prevLogs) =>
                prevLogs.map((log) =>
                    log._id === logId ? { ...log, title, project, time_taken } : log
                )
            );
            setEditingLogId(null); // Exit edit mode
        } catch (err) {
            console.error("Error updating log:", err);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-md w-1/2 flex flex-col p-6 max-h-[80vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Logs</h2>
                <AddLogButton onClick={() => setShowForm((show) => !show)} />
            </div>
            {/* Conditionally render the form */}
            {showForm && <AddLogForm onAdd={handleAddLog} onCancel={() => setShowForm(false)} />}

            {/* Scrollable logs list */}
            <div className="overflow-y-auto space-y-4 flex-1">
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
    );
}
