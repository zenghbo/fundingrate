# Binance Funding Rate Tracker

A Next.js web app that tracks Binance perpetual futures funding rates for configurable tokens, displays historical funding rate and price charts with synchronized tooltips, and includes a calculator that simulates funding income/expense based on investment amount, position direction (long/short), leverage, and date range.

## Features

- **Funding Rate Chart** - Historical funding rates displayed as a time-series curve
- **Price Chart** - Token price chart synchronized with funding rate chart (linked tooltips)
- **Funding Calculator** - Simulate funding income/expense with configurable:
  - Investment amount (USDT)
  - Position direction (Long/Short)
  - Leverage (1-125x)
  - Start date
- **Simulated Income Chart** - Visualize cumulative funding returns over time
- **Multi-token Support** - Add and track multiple token symbols
- **Time Range Selection** - View data for 24h, 7d, 30d, or 90d periods
- **Auto-refresh** - Data updates every 5 minutes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Charting**: Recharts
- **Styling**: Tailwind CSS
- **API**: Binance Futures API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zenghbo/fundingrate.git
cd fundingrate

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select a Token** - Use the token selector to choose which perpetual futures pair to track (default: 0GUSDT)
2. **Add Tokens** - Click "Add Token" to track additional symbols
3. **View Charts** - Funding rate and price charts are synchronized - hover over one to see corresponding data on both
4. **Use the Calculator**:
   - Enter your investment amount
   - Select Long or Short position
   - Set leverage multiplier
   - Choose a start date
   - View calculated funding returns and simulated income chart

## API Endpoints

The app proxies requests to Binance Futures API:

- `GET /api/funding-rate` - Fetch historical funding rates
- `GET /api/klines` - Fetch price candlestick data
- `GET /api/funding-income` - Fetch personal funding income (requires API key configuration)

## License

MIT
