import React from "react";
import { InfoCard } from "./InfoCard"; // adjust path if needed

export function LogCard({ title, projectName, hours }) {
    return (
        <div className="w-full max-w-md bg-logs1 rounded-xl shadow-lg p-4 space-y-3">
            <div>
                <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            </div>
            <div className="flex gap-x-4">
                <InfoCard label="Project" value={projectName} />
                <InfoCard label="Time Spent" value={`${hours} hrs`} />
            </div>
        </div>
    );
}
