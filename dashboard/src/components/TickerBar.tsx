import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

export const TickerBar: React.FC = () => {
  const [tickers, setTickers] = useState<Array<{ symbol: string; price: number; change24h: number }>>([]);

  useEffect(() => {
    const fetchTickers = async () => {
      const data = await api.getMarketTickers();
      setTickers(data);
    };
    fetchTickers();
    const interval = setInterval(fetchTickers, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#080b0a] border-b border-white/[0.06] text-xs py-2 px-4 flex items-center justify-between overflow-x-auto select-none">
      <div className="flex items-center gap-2 pr-6 border-r border-white/[0.08] shrink-0 text-white/50 font-mono text-[11px]">
        <Radio className="w-3.5 h-3.5 text-emerald-glow animate-pulse" />
        <span className="uppercase tracking-widest text-[10px]">Binance Live Feed</span>
      </div>

      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar px-4">
        {tickers.map(t => (
          <div key={t.symbol} className="flex items-center gap-2 shrink-0 font-mono">
            <span className="text-white/60 font-semibold">{t.symbol}/USDT</span>
            <span className="text-white font-medium">
              ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: t.price < 1 ? 4 : 2 })}
            </span>
            <span className={`flex items-center gap-0.5 text-[11px] ${t.change24h >= 0 ? 'text-emerald-glow' : 'text-rose-400'}`}>
              {t.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3 shrink-0 pl-6 border-l border-white/[0.08] text-white/40 text-[10px] uppercase tracking-wider font-mono">
        <span>Sovereign Timelock</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow"></span>
      </div>
    </div>
  );
};
