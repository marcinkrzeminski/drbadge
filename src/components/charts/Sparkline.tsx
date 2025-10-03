"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Snapshot {
  da_value: number;
  recorded_at: number;
}

interface SparklineProps {
  snapshots: Snapshot[];
}

export function Sparkline({ snapshots }: SparklineProps) {
  // Get last 7 snapshots for sparkline
  const recentSnapshots = snapshots
    .sort((a, b) => a.recorded_at - b.recorded_at)
    .slice(-7);

  const chartData = recentSnapshots.map((snapshot) => ({
    da: snapshot.da_value,
  }));

  // Determine trend color
  const getTrendColor = () => {
    if (chartData.length < 2) return "#9ca3af"; // gray-400

    const firstValue = chartData[0].da;
    const lastValue = chartData[chartData.length - 1].da;

    if (lastValue > firstValue) return "#10b981"; // green-500
    if (lastValue < firstValue) return "#ef4444"; // red-500
    return "#9ca3af"; // gray-400
  };

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-12 flex items-center justify-center text-xs text-gray-400">
        No data
      </div>
    );
  }

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="da"
            stroke={getTrendColor()}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
