import React, { useState } from "react";
import { InfoCard } from "./InfoCard";
import { EditLogButton } from "./EditLogButton";
import { DeleteLogButton } from "./DeleteLogButton";

export function LogCard({ id, title, project, time_taken, date, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedProject, setEditedProject] = useState(project);
    const [editedTime, setEditedTime] = useState(time_taken);

    const handleSave = () => {
        if (!editedTitle || !editedProject || editedTime <= 0) {
            alert("Invalid input");
            return;
        }

        onUpdate(id, {
            title: editedTitle,
            project: editedProject,
            time_taken: Number(editedTime),
        });

        setIsEditing(false);
    };

    return (
        <div
            className={`w-full max-w-lg rounded-xl shadow-lg p-4 space-y-3 relative ${isEditing ? "bg-logs1/70" : "bg-logs1"
                }`}
        >

            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-100 mb-1">Title</label>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="p-2 rounded bg-gray-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-100 mb-1">Project</label>
                        <input
                            type="text"
                            value={editedProject}
                            onChange={(e) => setEditedProject(e.target.value)}
                            className="p-2 rounded bg-gray-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-100 mb-1">Time Taken (hrs)</label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={editedTime}
                            onChange={(e) => setEditedTime(e.target.value)}
                            className="p-2 rounded bg-gray-100 w-24"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">{title}</h2>
                    </div>
                    <div className="flex gap-x-4">
                        <InfoCard label="Project" value={project} />
                        <InfoCard label="Time Spent" value={`${time_taken} hrs`} />
                        <InfoCard label="Date Created" value={date} />
                    </div>
                </>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2">
                {isEditing ? (
                    <>
                        <button
                            className="bg-logs1 text-white px-4 py-2 rounded hover:bg-logs1/90 transition"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <button
                            className="text-white bg-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <EditLogButton onClick={() => setIsEditing(true)} />
                        <DeleteLogButton onClick={() => onDelete(id)} />
                    </>
                )}
            </div>
        </div>
    );
}
