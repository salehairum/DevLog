import React from "react";

export function AddLogButton({ onClick }) {
    return (
        <button
            className="bg-bars text-white px-4 py-1 rounded hover:bg-bars/90 transition flex items-center gap-2"
            onClick={onClick}
            type="button"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Log
        </button>
    );
}
