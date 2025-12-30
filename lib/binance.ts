import crypto from "crypto";
import { FundingRate, FundingIncome, Kline } from "./types";

const BINANCE_FAPI_BASE = "https://fapi.binance.com";

export function generateSignature(queryString: string, apiSecret: string): string {
  return crypto
    .createHmac("sha256", apiSecret)
    .update(queryString)
    .digest("hex");
}

export async function getFundingRateHistory(
  symbol: string,
  startTime?: number,
  endTime?: number,
  limit: number = 500
): Promise<FundingRate[]> {
  const params = new URLSearchParams({
    symbol,
    limit: limit.toString(),
  });

  if (startTime) params.append("startTime", startTime.toString());
  if (endTime) params.append("endTime", endTime.toString());

  const response = await fetch(
    `${BINANCE_FAPI_BASE}/fapi/v1/fundingRate?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }

  return response.json();
}

export async function getKlines(
  symbol: string,
  interval: string = "8h",
  startTime?: number,
  endTime?: number,
  limit: number = 500
): Promise<Kline[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: limit.toString(),
  });

  if (startTime) params.append("startTime", startTime.toString());
  if (endTime) params.append("endTime", endTime.toString());

  const response = await fetch(
    `${BINANCE_FAPI_BASE}/fapi/v1/klines?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }

  const rawData = await response.json();

  // Transform array format to object format
  return rawData.map((item: (string | number)[]) => ({
    openTime: item[0] as number,
    open: item[1] as string,
    high: item[2] as string,
    low: item[3] as string,
    close: item[4] as string,
    volume: item[5] as string,
    closeTime: item[6] as number,
  }));
}

export async function getFundingIncome(
  apiKey: string,
  apiSecret: string,
  symbol?: string,
  startTime?: number,
  endTime?: number,
  limit: number = 1000
): Promise<FundingIncome[]> {
  const timestamp = Date.now();
  const params = new URLSearchParams({
    incomeType: "FUNDING_FEE",
    limit: limit.toString(),
    timestamp: timestamp.toString(),
  });

  if (symbol) params.append("symbol", symbol);
  if (startTime) params.append("startTime", startTime.toString());
  if (endTime) params.append("endTime", endTime.toString());

  const signature = generateSignature(params.toString(), apiSecret);
  params.append("signature", signature);

  const response = await fetch(
    `${BINANCE_FAPI_BASE}/fapi/v1/income?${params.toString()}`,
    {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }

  return response.json();
}
