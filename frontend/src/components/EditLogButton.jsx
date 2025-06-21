import React from "react";

export function EditLogButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-white hover:text-gray-200 transition"
            title="Edit Log"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11.586A1.5 1.5 0 005.5 20H17a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4L18.5 2.5z"
                />
            </svg>
        </button>
    );
}
