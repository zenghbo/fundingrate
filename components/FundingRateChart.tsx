"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ChartDataPoint } from "@/lib/types";

interface FundingRateChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  syncId?: string;
}

export default function FundingRateChart({
  data,
  loading,
  syncId,
}: FundingRateChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading funding rates...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">No funding rate data available</div>
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-900 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          syncId={syncId}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="formattedTime"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${(value * 100).toFixed(3)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number) => [`${(value * 100).toFixed(4)}%`, "Funding Rate"]}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="fundingRate"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#10B981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
