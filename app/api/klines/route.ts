import { NextRequest, NextResponse } from "next/server";
import { getKlines } from "@/lib/binance";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol") || "0GUSDT";
  const interval = searchParams.get("interval") || "8h";
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const limit = searchParams.get("limit");

  try {
    const data = await getKlines(
      symbol,
      interval,
      startTime ? parseInt(startTime) : undefined,
      endTime ? parseInt(endTime) : undefined,
      limit ? parseInt(limit) : 500
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Klines fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch klines" },
      { status: 500 }
    );
  }
}
