import React, { useState } from "react"
import { X, Search } from "lucide-react" // optional: install lucide-react for icons

export function SemanticSearchInput({ onSearch }) {
    const [query, setQuery] = useState("")

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query)
        }
    }

    const handleClear = () => {
        setQuery("")
        onSearch("") // clear the results
    }

    return (
            <div className="flex items-center border rounded px-3 py-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. fixed firebase auth bug"
                    className="flex-1 outline-none"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        title="Clear"
                    >
                        <X size={18} />
                    </button>
                )}
                <button
                    onClick={handleSearch}
                    className="ml-2 text-bars hover:text-bars/90 transition"
                    title="Search"
                >
                    <Search size={18} />
                </button>
            </div>
    )
}
