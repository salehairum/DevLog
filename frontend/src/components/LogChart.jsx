import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function LogChart({ logs }) {
    // Count logs per day for the last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i)); // go back 6, 5, ..., 0 days
        const key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        return { date: key, count: 0 };
    });

    const dataMap = Object.fromEntries(last7Days.map((d) => [d.date, 0]));

    logs.forEach((log) => {
        const logDate = log.date?.split("T")[0];
        if (logDate in dataMap) {
            dataMap[logDate]++;
        }
    });

    const chartData = last7Days.map(({ date }) => ({
        date,
        count: dataMap[date],
    }));

    return (
        <div className="w-full h-64 bg-white p-4 rounded-xl shadow">
            <h2 className="text-md font-semibold mb-2">Logs in the Last 7 Days</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
``
