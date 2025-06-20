import React from "react";
import { LogCard } from "./LogCard";
import { AddLogButton } from "./AddLogButton";

export function LogContainer() {
    const dummyLogs = [
        { id: 1, title: "Fixed login bug", projectName: "Devlog Dashboard", hours: 2.5 },
        { id: 2, title: "Implemented sidebar", projectName: "Devlog Dashboard", hours: 1.5 },
        { id: 3, title: "Setup API endpoints", projectName: "Devlog API", hours: 3.0 },
        { id: 4, title: "Refactored codebase", projectName: "Devlog API", hours: 2.0 },
        { id: 5, title: "Added unit tests", projectName: "Testing Suite", hours: 4.5 },
        { id: 6, title: "Updated README", projectName: "Documentation", hours: 1.0 },
        // Add more if needed to test scrolling
    ];
    const handleAddLog = () => {
        alert("Add Log clicked!");
        // TODO: Replace with actual API call or modal logic
    };
    return (
        <div className="bg-white rounded-xl shadow-md w-1/2 flex flex-col p-6 max-h-[80vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Logs</h2>
                <AddLogButton onClick={handleAddLog} />
            </div>

            {/* Scrollable logs list */}
            <div className="overflow-y-auto space-y-4 flex-1">
                {dummyLogs.map((log) => (
                    <LogCard
                        key={log.id}
                        title={log.title}
                        projectName={log.projectName}
                        hours={log.hours}
                    />
                ))}
            </div>
        </div>
    );
}
