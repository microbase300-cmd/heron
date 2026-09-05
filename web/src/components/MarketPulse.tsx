import { useEffect, useState } from 'react'

interface TickerData {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  quoteVolume: string
}

const SYMBOL_CONFIG: { symbol: string; name: string; short: string }[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', short: 'BTC' },
  { symbol: 'ETHUSDT', name: 'Ethereum', short: 'ETH' },
  { symbol: 'BNBUSDT', name: 'BNB', short: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana', short: 'SOL' },
  { symbol: 'XRPUSDT', name: 'XRP', short: 'XRP' },
  { symbol: 'ADAUSDT', name: 'Cardano', short: 'ADA' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', short: 'AVAX' },
]

export default function MarketPulse() {
  const [tickers, setTickers] = useState<TickerData[]>([])
  const [status, setStatus] = useState<string>('Connecting to public market data…')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const allData: TickerData[] = await response.json()

        if (!isMounted) return

        const targetSymbols = SYMBOL_CONFIG.map((s) => s.symbol)
        const filtered = allData.filter((item) => targetSymbols.includes(item.symbol))
        
        // Preserve order
        const map = new Map(filtered.map((item) => [item.symbol, item]))
        const ordered = SYMBOL_CONFIG.map((c) => map.get(c.symbol)).filter(
          (t): t is TickerData => Boolean(t)
        )

        setTickers(ordered)
        setStatus('Live • refreshed every 15 seconds')
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return
        setStatus('Market feed temporarily unavailable — reconnecting…')
        setIsLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 15000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="market-list">
      {isLoading && tickers.length === 0 ? (
        <div className="market-note" style={{ padding: '24px 0' }}>
          Connecting to public market data stream…
        </div>
      ) : tickers.length > 0 ? (
        tickers.map((t) => {
          const meta = SYMBOL_CONFIG.find((c) => c.symbol === t.symbol)
          const priceChange = parseFloat(t.priceChangePercent)
          const isPositive = priceChange >= 0
          const price = parseFloat(t.lastPrice)
          const volume = parseFloat(t.quoteVolume)

          return (
            <div className="ticker" key={t.symbol}>
              <div className="coin">
                <div className="coin-dot">{meta?.short.charAt(0) || '•'}</div>
                <div>
                  <strong>{meta?.short || t.symbol}</strong>
                  <div className="market-note">{meta?.name}</div>
                </div>
              </div>

              <div className="ticker-price">
                ${price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: price < 1 ? 4 : 2,
                })}
              </div>

              <div className={isPositive ? 'up' : 'down'}>
                {isPositive ? '+' : ''}
                {priceChange.toFixed(2)}%
              </div>

              <div className="market-note ticker-meta">
                Vol{' '}
                {volume.toLocaleString(undefined, {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                })}
              </div>
            </div>
          )
        })
      ) : (
        <div className="market-note" style={{ padding: '24px 0' }}>
          Public market data temporarily offline. Retrying...
        </div>
      )}

      <div className="market-note" style={{ marginTop: '16px' }}>
        {status}
      </div>
    </div>
  )
}
