"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PriceDataPoint } from "@/lib/types";

interface PriceChartProps {
  data: PriceDataPoint[];
  loading?: boolean;
  syncId?: string;
}

export default function PriceChart({
  data,
  loading,
  syncId,
}: PriceChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading price data...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">No price data available</div>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));
  const padding = (maxPrice - minPrice) * 0.1;

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
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number) => [`$${value.toFixed(4)}`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#F59E0B" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
