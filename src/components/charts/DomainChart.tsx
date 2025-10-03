"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

interface Snapshot {
  id: string;
  da_value: number;
  recorded_at: number;
}

interface DomainChartProps {
  snapshots: Snapshot[];
}

type TimeRange = "7d" | "30d" | "90d" | "all";

export function DomainChart({ snapshots }: DomainChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filterSnapshotsByRange = (range: TimeRange) => {
    const now = Date.now();
    let cutoffDate: number;

    switch (range) {
      case "7d":
        cutoffDate = subDays(now, 7).getTime();
        break;
      case "30d":
        cutoffDate = subDays(now, 30).getTime();
        break;
      case "90d":
        cutoffDate = subDays(now, 90).getTime();
        break;
      case "all":
        return snapshots;
    }

    return snapshots.filter((s) => s.recorded_at >= cutoffDate);
  };

  const filteredSnapshots = filterSnapshotsByRange(timeRange);

  const chartData = filteredSnapshots
    .sort((a, b) => a.recorded_at - b.recorded_at)
    .map((snapshot) => ({
      date: format(new Date(snapshot.recorded_at), "MMM d"),
      da: snapshot.da_value,
      fullDate: format(new Date(snapshot.recorded_at), "PPP"),
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            DA: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {timeRangeButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setTimeRange(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === btn.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              domain={["auto", "auto"]}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="da"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
