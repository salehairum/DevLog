import React, { useState, useEffect } from "react";

export function FilterContainer({ className, filters, onFilterChange }) {
    // Local state mirrors props, so inputs are controlled
    const [localFilters, setLocalFilters] = useState(filters)

    // Sync local state if filters prop changes externally (e.g. reset)
    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setLocalFilters((prev) => ({ ...prev, [name]: value }))
    }

    const handleApply = () => {
        onFilterChange(localFilters)
    }

    const handleClear = () => {
        const cleared = { project: '', date: '' }
        setLocalFilters(cleared)
        onFilterChange(cleared)
    }

    return (
        <div className={`p-4 bg-white rounded-2xl shadow flex flex-col gap-4 ${className}`}>
            <input
                name="project"
                type="text"
                placeholder="Filter by project"
                className="border px-3 py-2 rounded"
                value={localFilters.project}
                onChange={handleInputChange}
            />
            <input
                name="date"
                type="date"
                className="border px-3 py-2 rounded"
                value={localFilters.date}
                onChange={handleInputChange}
            />
            <div className="flex gap-2">
                <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-bars hover:bg-bars/90 transition text-white rounded"
                >
                    Apply
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 border border-gray-300 rounded"
                >
                    Clear
                </button>
            </div>
        </div>
    )
}
