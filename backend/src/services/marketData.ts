export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
}

export interface CandlestickData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TRACKED_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
];

const FALLBACK_TICKERS: MarketTicker[] = [
  { symbol: 'BTC', price: 68420.50, change24h: 3.45, high24h: 69100.00, low24h: 66800.00, volume: 1824910200 },
  { symbol: 'ETH', price: 3540.20, change24h: 2.18, high24h: 3590.00, low24h: 3450.00, volume: 981240100 },
  { symbol: 'BNB', price: 580.40, change24h: 1.12, high24h: 588.00, low24h: 572.00, volume: 312090100 },
  { symbol: 'SOL', price: 142.80, change24h: 5.62, high24h: 145.50, low24h: 135.20, volume: 642010900 },
  { symbol: 'XRP', price: 0.584, change24h: -0.42, high24h: 0.595, low24h: 0.578, volume: 241090200 },
  { symbol: 'ADA', price: 0.365, change24h: 0.85, high24h: 0.372, low24h: 0.358, volume: 98200100 },
  { symbol: 'DOGE', price: 0.108, change24h: 4.10, high24h: 0.112, low24h: 0.103, volume: 382010400 },
  { symbol: 'AVAX', price: 24.60, change24h: 3.20, high24h: 25.10, low24h: 23.80, volume: 142090100 },
];

class MarketDataService {
  private cachedTickers: MarketTicker[] = [];
  private lastFetchedAt: number = 0;
  private readonly CACHE_TTL_MS = 10000; // 10 seconds

  /**
   * Fetches real-time 24h ticker data from Binance with caching
   */
  public async getTickers(): Promise<MarketTicker[]> {
    const now = Date.now();
    if (this.cachedTickers.length > 0 && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.cachedTickers;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);

      const data = (await res.json()) as any[];
      const map = new Map<string, any>();
      data.forEach((item) => {
        if (TRACKED_SYMBOLS.includes(item.symbol)) {
          map.set(item.symbol, item);
        }
      });

      const formatted: MarketTicker[] = TRACKED_SYMBOLS.map((s) => {
        const item = map.get(s);
        if (!item) {
          return FALLBACK_TICKERS.find((f) => f.symbol === s.replace('USDT', ''))!;
        }
        return {
          symbol: s.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent),
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
          volume: parseFloat(item.quoteVolume),
        };
      }).filter(Boolean);

      this.cachedTickers = formatted;
      this.lastFetchedAt = now;
      return formatted;
    } catch (err: any) {
      console.warn('⚠️ [Market Data] Binance ticker live feed error, serving cached/fallback:', err.message);
      return this.cachedTickers.length > 0 ? this.cachedTickers : FALLBACK_TICKERS;
    }
  }

  /**
   * Fetches historical candlestick (OHLCV) klines for charts
   */
  public async getKlines(
    symbol: string = 'BTCUSDT',
    interval: string = '1h',
    limit: number = 48
  ): Promise<CandlestickData[]> {
    const pair = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
    try {
      const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rawKlines = (await res.json()) as any[];
      return rawKlines.map((k) => ({
        time: Math.floor(k[0] / 1000), // convert ms to seconds
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    } catch (err: any) {
      console.warn(`⚠️ [Market Data] Klines fetch failed for ${pair}, generating synthetic series:`, err.message);
      // Generate realistic synthetic curve
      const basePrice = symbol.includes('ETH') ? 3500 : symbol.includes('SOL') ? 140 : 68000;
      const now = Math.floor(Date.now() / 1000);
      const points: CandlestickData[] = [];
      let current = basePrice;

      for (let i = limit; i >= 0; i--) {
        const delta = (Math.random() - 0.48) * (basePrice * 0.008);
        const open = current;
        current += delta;
        const high = Math.max(open, current) + Math.random() * (basePrice * 0.003);
        const low = Math.min(open, current) - Math.random() * (basePrice * 0.003);

        points.push({
          time: now - i * 3600,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(current.toFixed(2)),
          volume: Math.floor(Math.random() * 5000000 + 1000000),
        });
      }
      return points;
    }
  }
}

export const marketDataService = new MarketDataService();
