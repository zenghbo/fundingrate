import { NextRequest, NextResponse } from "next/server";
import { getFundingIncome } from "@/lib/binance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, apiSecret, symbol, startTime, endTime } = body;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "API key and secret are required" },
        { status: 400 }
      );
    }

    const data = await getFundingIncome(
      apiKey,
      apiSecret,
      symbol,
      startTime,
      endTime
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Funding income fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch funding income" },
      { status: 500 }
    );
  }
}
