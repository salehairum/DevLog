import React, { useState } from "react";

export function AddLogForm({ onAdd, onCancel }) {
    const [title, setTitle] = useState("");
    const [project, setProject] = useState("");
    const [timeTaken, setTimeTaken] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !project || !timeTaken) {
            alert("Please fill all fields");
            return;
        }

        const timeTakenNum = Number(timeTaken);
        if (isNaN(timeTakenNum) || timeTakenNum <= 0) {
            alert("Please enter a valid positive number for time taken");
            return;
        }

        onAdd({ title, project, time_taken: timeTakenNum });

        // Clear form
        setTitle("");
        setProject("");
        setTimeTaken("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-4 flex flex-col space-y-4 max-w-lg bg-logs1/70 rounded-xl p-4"
        >
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-100 mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-2 rounded bg-gray-100"
                    placeholder="Task title"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-100 mb-1">Project</label>
                <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="p-2 rounded bg-gray-100"
                    placeholder="Project name"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-100 mb-1">Time Taken</label>
                <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(e.target.value)}
                    className="p-2 rounded bg-gray-100"
                    placeholder="In hours"
                    required
                />
            </div>

            <div className="flex gap-2 justify-end">
                <button
                    type="submit"
                    className="bg-logs1 text-white px-4 py-2 rounded hover:bg-logs1/90 transition"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-white bg-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
