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
    <div className="w-full bg-[#181A20] border-b border-[#2B313A] text-xs py-2 px-4 flex items-center justify-between overflow-x-auto select-none">
      <div className="flex items-center gap-2 pr-5 border-r border-[#2B313A] shrink-0 text-[#848E9C] font-mono text-[11px]">
        <Radio className="w-3.5 h-3.5 text-[#0ECB81] animate-pulse" />
        <span className="uppercase tracking-widest text-[10px] font-semibold text-[#EAECEF]">Institutional Live Feed</span>
      </div>

      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar px-4">
        {tickers.map(t => (
          <div key={t.symbol} className="flex items-center gap-2 shrink-0 font-mono">
            <span className="text-[#848E9C] font-medium">{t.symbol}/USDT</span>
            <span className="text-[#EAECEF] font-semibold">
              ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: t.price < 1 ? 4 : 2 })}
            </span>
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${t.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
              {t.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3 shrink-0 pl-5 border-l border-[#2B313A] text-[#848E9C] text-[10px] uppercase tracking-wider font-mono">
        <span>Protocol Shield Active</span>
        <span className="w-2 h-2 rounded-full bg-[#0ECB81] shadow-[0_0_8px_#0ECB81]"></span>
      </div>
    </div>
  );
};
