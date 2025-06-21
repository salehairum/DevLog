import React from "react";
import { InfoCard } from "./InfoCard";

export function LogCard({ title, project, time_taken, date }) {
    return (
        <div className="w-full max-w-md bg-logs1 rounded-xl shadow-lg p-4 space-y-3">
            <div>
                <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            </div>
            <div className="flex gap-x-4">
                <InfoCard label="Project" value={project} />
                <InfoCard label="Time Spent" value={`${time_taken} hrs`} />
                <InfoCard label="Date Created" value={date} />
            </div>
        </div>
    );
}
