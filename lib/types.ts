export interface FundingRate {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
  markPrice: string;
}

export interface FundingIncome {
  symbol: string;
  incomeType: string;
  income: string;
  asset: string;
  time: number;
  tranId: number;
  tradeId: string;
}

export interface ChartDataPoint {
  time: number;
  formattedTime: string;
  fundingRate: number;
  fundingRatePercent: string;
}

export interface IncomeDataPoint {
  time: number;
  formattedTime: string;
  income: number;
  cumulativeIncome: number;
}

export interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface PriceDataPoint {
  time: number;
  formattedTime: string;
  price: number;
  open: number;
  high: number;
  low: number;
}

export interface SyncState {
  activeIndex: number | null;
  activeTime: number | null;
}
