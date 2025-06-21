import React from "react";
import { InfoCard } from "./InfoCard";
import { EditLogButton } from "./EditLogButton";
import { DeleteLogButton } from "./DeleteLogButton";

export function LogCard({ id, title, project, time_taken, date, onDelete }) {
    return (
        <div className="w-full max-w-lg bg-logs1 rounded-xl shadow-lg p-4 space-y-3 relative">
            <div>
                <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            </div>

            <div className="flex gap-x-4">
                <InfoCard label="Project" value={project} />
                <InfoCard label="Time Spent" value={`${time_taken} hrs`} />
                <InfoCard label="Date Created" value={date} />
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
                <EditLogButton onClick={() => alert("Edit clicked")} />
                <DeleteLogButton onClick={() => onDelete(id)} />
            </div>
        </div>
    );
}
