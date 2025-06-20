import React from "react";

export function InfoCard({ label, value }) {
    return (
        <div className="bg-logs2 rounded-md px-3 py-1 shadow-md w-max">
            <p className="text-xs font-semibold text-black">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    );
}
