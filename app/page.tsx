"use client";

import { useState, useEffect, useCallback } from "react";
import FundingRateChart from "@/components/FundingRateChart";
import FundingIncomeChart from "@/components/FundingIncomeChart";
import PriceChart from "@/components/PriceChart";
import TokenSelector from "@/components/TokenSelector";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import FundingCalculator from "@/components/FundingCalculator";
import {
  FundingRate,
  Kline,
  ChartDataPoint,
  IncomeDataPoint,
  PriceDataPoint,
  ApiCredentials,
} from "@/lib/types";

const DEFAULT_TOKENS = ["0GUSDT"];
const SYNC_ID = "funding-charts";

function getTimeRange(range: string): { startTime: number; endTime: number } {
  const now = Date.now();
  const ranges: Record<string, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };
  return {
    startTime: now - (ranges[range] || ranges["7d"]),
    endTime: now,
  };
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function transformFundingRateData(data: FundingRate[]): ChartDataPoint[] {
  return data.map((item) => ({
    time: item.fundingTime,
    formattedTime: formatTime(item.fundingTime),
    fundingRate: parseFloat(item.fundingRate),
    fundingRatePercent: `${(parseFloat(item.fundingRate) * 100).toFixed(4)}%`,
  }));
}

function transformKlineData(klines: Kline[], fundingRateData: ChartDataPoint[]): PriceDataPoint[] {
  if (fundingRateData.length === 0) {
    return klines.map((kline) => ({
      time: kline.openTime,
      formattedTime: formatTime(kline.openTime),
      price: parseFloat(kline.close),
      open: parseFloat(kline.open),
      high: parseFloat(kline.high),
      low: parseFloat(kline.low),
    }));
  }

  const klineMap = new Map<number, Kline>();
  klines.forEach((kline) => {
    const roundedTime = Math.round(kline.closeTime / (8 * 60 * 60 * 1000)) * (8 * 60 * 60 * 1000);
    klineMap.set(roundedTime, kline);
  });

  return fundingRateData.map((fr) => {
    const roundedFundingTime = Math.round(fr.time / (8 * 60 * 60 * 1000)) * (8 * 60 * 60 * 1000);
    const kline = klineMap.get(roundedFundingTime);

    if (kline) {
      return {
        time: fr.time,
        formattedTime: fr.formattedTime,
        price: parseFloat(kline.close),
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
      };
    }

    let closestKline = klines[0];
    let minDiff = Math.abs(klines[0].closeTime - fr.time);
    for (const k of klines) {
      const diff = Math.abs(k.closeTime - fr.time);
      if (diff < minDiff) {
        minDiff = diff;
        closestKline = k;
      }
    }

    return {
      time: fr.time,
      formattedTime: fr.formattedTime,
      price: parseFloat(closestKline.close),
      open: parseFloat(closestKline.open),
      high: parseFloat(closestKline.high),
      low: parseFloat(closestKline.low),
    };
  });
}

export default function Home() {
  const [tokens, setTokens] = useState<string[]>(DEFAULT_TOKENS);
  const [selectedToken, setSelectedToken] = useState<string>(DEFAULT_TOKENS[0]);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);

  const [fundingRateData, setFundingRateData] = useState<ChartDataPoint[]>([]);
  const [allFundingRateData, setAllFundingRateData] = useState<ChartDataPoint[]>([]);
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [simulatedIncomeData, setSimulatedIncomeData] = useState<IncomeDataPoint[]>([]);
  const [rateLoading, setRateLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    const savedTokens = localStorage.getItem("fundingrate-tokens");
    const savedCredentials = localStorage.getItem("fundingrate-credentials");

    if (savedTokens) {
      const parsed = JSON.parse(savedTokens);
      setTokens(parsed);
      setSelectedToken(parsed[0]);
    }

    if (savedCredentials) {
      setCredentials(JSON.parse(savedCredentials));
    }
  }, []);

  const fetchFundingRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const { startTime, endTime } = getTimeRange(timeRange);
      const response = await fetch(
        `/api/funding-rate?symbol=${selectedToken}&startTime=${startTime}&endTime=${endTime}&limit=1000`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data: FundingRate[] = await response.json();
      const transformed = transformFundingRateData(data);
      setFundingRateData(transformed);
      return transformed;
    } catch (error) {
      console.error("Error fetching funding rate:", error);
      setFundingRateData([]);
      return [];
    } finally {
      setRateLoading(false);
    }
  }, [selectedToken, timeRange]);

  // Fetch extended funding rate data for calculator
  // Don't specify startTime/endTime to get the most recent records (Binance returns oldest first when time range specified)
  const fetchAllFundingRate = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/funding-rate?symbol=${selectedToken}&limit=1000`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data: FundingRate[] = await response.json();
      // Sort by time ascending to ensure correct order
      const sorted = data.sort((a, b) => a.fundingTime - b.fundingTime);
      setAllFundingRateData(transformFundingRateData(sorted));
    } catch (error) {
      console.error("Error fetching all funding rate:", error);
    }
  }, [selectedToken]);

  const fetchPriceData = useCallback(async (fundingData: ChartDataPoint[]) => {
    setPriceLoading(true);
    try {
      const { startTime, endTime } = getTimeRange(timeRange);
      const response = await fetch(
        `/api/klines?symbol=${selectedToken}&interval=8h&startTime=${startTime}&endTime=${endTime}&limit=1000`
      );

      if (!response.ok) throw new Error("Failed to fetch klines");

      const data: Kline[] = await response.json();
      setPriceData(transformKlineData(data, fundingData));
    } catch (error) {
      console.error("Error fetching price data:", error);
      setPriceData([]);
    } finally {
      setPriceLoading(false);
    }
  }, [selectedToken, timeRange]);

  useEffect(() => {
    const fetchData = async () => {
      const fundingData = await fetchFundingRate();
      await fetchPriceData(fundingData);
    };
    fetchData();
    fetchAllFundingRate();
  }, [fetchFundingRate, fetchPriceData, fetchAllFundingRate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fundingData = await fetchFundingRate();
      await fetchPriceData(fundingData);
      fetchAllFundingRate();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchFundingRate, fetchPriceData, fetchAllFundingRate]);

  const handleAddToken = (token: string) => {
    const newTokens = [...tokens, token];
    setTokens(newTokens);
    setSelectedToken(token);
    localStorage.setItem("fundingrate-tokens", JSON.stringify(newTokens));
  };

  const handleRemoveToken = (token: string) => {
    const newTokens = tokens.filter((t) => t !== token);
    setTokens(newTokens);
    if (selectedToken === token) {
      setSelectedToken(newTokens[0]);
    }
    localStorage.setItem("fundingrate-tokens", JSON.stringify(newTokens));
  };

  const handleSaveCredentials = (creds: ApiCredentials) => {
    setCredentials(creds);
    localStorage.setItem("fundingrate-credentials", JSON.stringify(creds));
  };

  const handleClearCredentials = () => {
    setCredentials(null);
    localStorage.removeItem("fundingrate-credentials");
  };

  // Calculate summary stats
  const latestRate = fundingRateData.length > 0 ? fundingRateData[fundingRateData.length - 1] : null;
  const latestPrice = priceData.length > 0 ? priceData[priceData.length - 1] : null;
  const avgRate = fundingRateData.length > 0
    ? fundingRateData.reduce((sum, d) => sum + d.fundingRate, 0) / fundingRateData.length
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Funding Rate Tracker
            </h1>
            <p className="text-gray-400 mt-1">Monitor perpetual futures funding rates</p>
          </div>
          <ApiKeyConfig
            credentials={credentials}
            onSave={handleSaveCredentials}
            onClear={handleClearCredentials}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <TokenSelector
            tokens={tokens}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            onAddToken={handleAddToken}
            onRemoveToken={handleRemoveToken}
          />
          <TimeRangeSelector selectedRange={timeRange} onSelectRange={setTimeRange} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-bold text-yellow-400">
              {latestPrice ? `$${latestPrice.price.toFixed(4)}` : "-"}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Latest Funding</div>
            <div className={`text-2xl font-bold ${latestRate && latestRate.fundingRate >= 0 ? "text-green-400" : "text-red-400"}`}>
              {latestRate ? latestRate.fundingRatePercent : "-"}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Avg Funding ({timeRange})</div>
            <div className={`text-2xl font-bold ${avgRate >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(avgRate * 100).toFixed(4)}%
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Data Points</div>
            <div className="text-2xl font-bold text-blue-400">
              {fundingRateData.length}
            </div>
          </div>
        </div>

        {/* Synchronized Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Funding Rate
            </h2>
            <FundingRateChart
              data={fundingRateData}
              loading={rateLoading}
              syncId={SYNC_ID}
            />
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              Price
            </h2>
            <PriceChart
              data={priceData}
              loading={priceLoading}
              syncId={SYNC_ID}
            />
          </div>
        </div>

        {/* Funding Calculator */}
        <div className="mb-8">
          <FundingCalculator
            fundingRateData={allFundingRateData.length > 0 ? allFundingRateData : fundingRateData}
            symbol={selectedToken}
            onSimulatedIncomeChange={setSimulatedIncomeData}
          />
        </div>

        {/* Simulated Funding Income Chart */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            Simulated Funding Income
            <span className="text-sm font-normal text-gray-500 ml-2">(Based on calculator inputs above)</span>
          </h2>
          <FundingIncomeChart
            data={simulatedIncomeData}
            loading={false}
            error={null}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
          <p>Data from Binance Futures API - Auto-refreshes every 5 minutes</p>
        </div>
      </div>
    </main>
  );
}
