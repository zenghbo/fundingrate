"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { IncomeDataPoint } from "@/lib/types";

interface FundingIncomeChartProps {
  data: IncomeDataPoint[];
  loading?: boolean;
  error?: string | null;
}

export default function FundingIncomeChart({ data, loading, error }: FundingIncomeChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading funding income...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">No funding income data. Configure API keys to see your personal funding.</div>
      </div>
    );
  }

  const totalIncome = data.length > 0 ? data[data.length - 1].cumulativeIncome : 0;

  return (
    <div className="h-80 bg-gray-900 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-2">
        Total Accumulated: <span className={totalIncome >= 0 ? "text-green-400" : "text-red-400"}>
          {totalIncome >= 0 ? "+" : ""}{totalIncome.toFixed(4)} USDT
        </span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            tickFormatter={(value) => `${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(4)} USDT`,
              name === "cumulativeIncome" ? "Cumulative" : "Single Payment",
            ]}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="cumulativeIncome"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
