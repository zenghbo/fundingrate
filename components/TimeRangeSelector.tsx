"use client";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onSelectRange: (range: string) => void;
}

const TIME_RANGES = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export default function TimeRangeSelector({
  selectedRange,
  onSelectRange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onSelectRange(range.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedRange === range.value
              ? "bg-green-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
