import React, { useState } from "react"
import { FilterContainer } from "./FilterContainer"
import { SemanticSearchInput } from "./SemanticSearchInput"

export function SearchTabs({
    filters,
    onFilterChange,
    onSemanticSearch
}) {
    const [activeTab, setActiveTab] = useState("smart") // or "smart"

    return (
        <div className="p-4 bg-white rounded-2xl shadow flex flex-col gap-4">
            <div className="flex mb-4">
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${activeTab === "filters"
                            ? "border-logs1 font-semibold"
                            : "border-transparent"
                        }`}
                    onClick={() => setActiveTab("filters")}
                >
                    Filters
                </button>
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${activeTab === "smart"
                        ? "border-logs1 font-semibold"
                            : "border-transparent"
                        }`}
                    onClick={() => setActiveTab("smart")}
                >
                    Smart Search
                </button>
            </div>

            {activeTab === "filters" && (
                <FilterContainer filters={filters} onFilterChange={onFilterChange} />
            )}
            {activeTab === "smart" && <SemanticSearchInput onSearch={onSemanticSearch} />}
        </div>
    )
}
