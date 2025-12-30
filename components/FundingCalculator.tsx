"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChartDataPoint, IncomeDataPoint } from "@/lib/types";

interface CalculationResult {
  positionSize: number;
  totalFundingRate: number;
  totalFundingUsd: number;
  fundingEvents: number;
  avgFundingRate: number;
  returnPercent: number;
  annualizedReturn: number;
  dataPointsAvailable: number;
  dataPointsUsed: number;
}

interface FundingCalculatorProps {
  fundingRateData: ChartDataPoint[];
  symbol: string;
  onSimulatedIncomeChange?: (data: IncomeDataPoint[]) => void;
}

export default function FundingCalculator({
  fundingRateData,
  symbol,
  onSimulatedIncomeChange
}: FundingCalculatorProps) {
  const [amount, setAmount] = useState<string>("1000");
  const [position, setPosition] = useState<"long" | "short">("short");
  const [leverage, setLeverage] = useState<string>("1");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [calculation, setCalculation] = useState<CalculationResult>({
    positionSize: 0,
    totalFundingRate: 0,
    totalFundingUsd: 0,
    fundingEvents: 0,
    avgFundingRate: 0,
    returnPercent: 0,
    annualizedReturn: 0,
    dataPointsAvailable: 0,
    dataPointsUsed: 0,
  });

  // Compute position size immediately when inputs change
  const positionSize = useMemo(() => {
    const investmentAmount = parseFloat(amount) || 0;
    const leverageMultiplier = parseFloat(leverage) || 1;
    return investmentAmount * leverageMultiplier;
  }, [amount, leverage]);

  const runCalculation = useCallback(() => {
    const investmentAmount = parseFloat(amount) || 0;
    const leverageMultiplier = parseFloat(leverage) || 1;
    const currentPositionSize = investmentAmount * leverageMultiplier;

    // Parse start date at midnight local time
    const startDateParts = startDate.split('-');
    const startTimestamp = new Date(
      parseInt(startDateParts[0]),
      parseInt(startDateParts[1]) - 1,
      parseInt(startDateParts[2]),
      0, 0, 0, 0
    ).getTime();

    // Filter funding rates from start date
    const relevantRates = fundingRateData.filter((d) => d.time >= startTimestamp);

    console.log("Calculation debug:", {
      fundingRateDataLength: fundingRateData.length,
      startDate,
      startTimestamp,
      startDateFormatted: new Date(startTimestamp).toISOString(),
      relevantRatesLength: relevantRates.length,
      investmentAmount,
      currentPositionSize,
      position,
      firstRateTime: fundingRateData[0]?.time,
      firstRateDate: fundingRateData[0] ? new Date(fundingRateData[0].time).toISOString() : null,
      lastRateTime: fundingRateData[fundingRateData.length - 1]?.time,
      lastRateDate: fundingRateData[fundingRateData.length - 1] ? new Date(fundingRateData[fundingRateData.length - 1].time).toISOString() : null,
      sampleRates: fundingRateData.slice(0, 3).map(r => ({
        time: new Date(r.time).toISOString(),
        rate: r.fundingRate,
        ratePercent: r.fundingRatePercent
      })),
    });

    if (relevantRates.length === 0 || investmentAmount === 0) {
      setCalculation({
        positionSize: currentPositionSize,
        totalFundingRate: 0,
        totalFundingUsd: 0,
        fundingEvents: 0,
        avgFundingRate: 0,
        returnPercent: 0,
        annualizedReturn: 0,
        dataPointsAvailable: fundingRateData.length,
        dataPointsUsed: 0,
      });
      if (onSimulatedIncomeChange) {
        onSimulatedIncomeChange([]);
      }
      return;
    }

    // Calculate funding returns and build simulated income data
    let cumulativeIncome = 0;
    let totalFundingRate = 0;
    const incomeData: IncomeDataPoint[] = [];

    relevantRates.forEach((rate, index) => {
      // Long position: pays when rate > 0, receives when rate < 0
      // Short position: receives when rate > 0, pays when rate < 0
      const effectiveRate = position === "short" ? rate.fundingRate : -rate.fundingRate;
      totalFundingRate += effectiveRate;

      const income = currentPositionSize * effectiveRate;
      cumulativeIncome += income;

      if (index < 3) {
        console.log(`Rate ${index + 1}: fundingRate=${rate.fundingRate}, effectiveRate=${effectiveRate}, income=${income}, cumulative=${cumulativeIncome}`);
      }

      incomeData.push({
        time: rate.time,
        formattedTime: rate.formattedTime,
        income,
        cumulativeIncome,
      });
    });

    const totalFundingUsd = cumulativeIncome; // Use accumulated income directly
    const avgFundingRate = totalFundingRate / relevantRates.length;
    const returnPercent = investmentAmount > 0 ? (totalFundingUsd / investmentAmount) * 100 : 0;

    // Annualized return based on actual period
    const firstRateTime = relevantRates[0].time;
    const lastRateTime = relevantRates[relevantRates.length - 1].time;
    const actualDays = (lastRateTime - firstRateTime) / (24 * 60 * 60 * 1000);
    const annualizedReturn = actualDays > 0 ? (returnPercent / actualDays) * 365 : 0;

    console.log("Calculation result:", {
      totalFundingRate,
      totalFundingUsd,
      avgFundingRate,
      returnPercent,
      annualizedReturn,
      actualDays,
    });

    setCalculation({
      positionSize: currentPositionSize,
      totalFundingRate,
      totalFundingUsd,
      fundingEvents: relevantRates.length,
      avgFundingRate,
      returnPercent,
      annualizedReturn,
      dataPointsAvailable: fundingRateData.length,
      dataPointsUsed: relevantRates.length,
    });

    if (onSimulatedIncomeChange) {
      onSimulatedIncomeChange(incomeData);
    }
  }, [amount, position, leverage, startDate, fundingRateData, onSimulatedIncomeChange]);

  // Auto-calculate on mount and when funding rate data changes
  useEffect(() => {
    if (fundingRateData.length > 0) {
      runCalculation();
    }
  }, [fundingRateData, runCalculation]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Funding Calculator
        <span className="text-sm font-normal text-gray-400 ml-2">- {symbol}</span>
      </h2>

      {/* Input Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Investment Amount */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Investment (USDT)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              placeholder="1000"
              min="0"
            />
          </div>
        </div>

        {/* Position Direction */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Position</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            <button
              onClick={() => setPosition("long")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                position === "long"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Long
            </button>
            <button
              onClick={() => setPosition("short")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                position === "short"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Short
            </button>
          </div>
        </div>

        {/* Leverage */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Leverage</label>
          <div className="relative">
            <input
              type="number"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              placeholder="1"
              min="1"
              max="125"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">x</span>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      {/* Position Size Display */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Position Size</span>
          <span className="text-xl font-semibold">
            ${positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-gray-500">Data points: {calculation.dataPointsUsed} of {calculation.dataPointsAvailable} used</span>
          <span className="text-gray-500">
            {fundingRateData.length === 0 ? "Loading data..." : `${calculation.fundingEvents} funding events`}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Funding Return */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Funding Return</div>
          <div className={`text-2xl font-bold ${calculation.totalFundingUsd >= 0 ? "text-green-400" : "text-red-400"}`}>
            {calculation.totalFundingUsd >= 0 ? "+" : ""}
            ${calculation.totalFundingUsd.toFixed(2)}
          </div>
          <div className={`text-sm ${calculation.returnPercent >= 0 ? "text-green-400/70" : "text-red-400/70"}`}>
            {calculation.returnPercent >= 0 ? "+" : ""}
            {calculation.returnPercent.toFixed(2)}% on investment
          </div>
        </div>

        {/* Funding Events */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Funding Events</div>
          <div className="text-2xl font-bold text-white">
            {calculation.fundingEvents}
          </div>
          <div className="text-sm text-gray-500">
            payments processed
          </div>
        </div>

        {/* Average Rate */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Rate / Event</div>
          <div className={`text-2xl font-bold ${calculation.avgFundingRate >= 0 ? "text-green-400" : "text-red-400"}`}>
            {(calculation.avgFundingRate * 100).toFixed(4)}%
          </div>
          <div className="text-sm text-gray-500">
            per funding event
          </div>
        </div>

        {/* Annualized Return */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Annualized Return</div>
          <div className={`text-2xl font-bold ${calculation.annualizedReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
            {calculation.annualizedReturn >= 0 ? "+" : ""}
            {calculation.annualizedReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">
            projected yearly
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
        <p className="text-sm text-blue-300/80">
          <span className="font-medium">Note:</span> {position === "short" ? "Short" : "Long"} positions {" "}
          {position === "short" ? "receive" : "pay"} funding when rates are positive, and {" "}
          {position === "short" ? "pay" : "receive"} when rates are negative.
        </p>
      </div>

    </div>
  );
}
