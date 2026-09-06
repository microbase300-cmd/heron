import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface PortfolioYieldChartProps {
  totalNAV: number;
  profitAccrued: number;
}

export const PortfolioYieldChart: React.FC<PortfolioYieldChartProps> = ({
  totalNAV,
  profitAccrued,
}) => {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  // Generate deterministic compounding timeline relative to totalNAV and profit
  const generateData = () => {
    const pointsCount = timeframe === '7D' ? 7 : timeframe === '30D' ? 15 : timeframe === '90D' ? 18 : 24;
    const data = [];
    const baseNAV = Math.max(100, totalNAV - profitAccrued);
    const growthPerStep = profitAccrued / pointsCount;

    for (let i = 0; i <= pointsCount; i++) {
      const noise = (Math.sin(i * 1.5) * 0.015 + (i / pointsCount) * 0.05) * baseNAV;
      const principalValue = baseNAV;
      const navValue = Math.max(baseNAV, Number((baseNAV + (growthPerStep * i) + noise).toFixed(2)));
      const benchmarkValue = Number((baseNAV * (1 + (0.0008 * i))).toFixed(2));

      let label = '';
      if (timeframe === '7D') label = `Day ${i + 1}`;
      else if (timeframe === '30D') label = `Day ${i * 2 + 1}`;
      else if (timeframe === '90D') label = `Wk ${Math.floor(i / 2) + 1}`;
      else label = `M${Math.floor(i / 2) + 1}`;

      data.push({
        label,
        nav: i === pointsCount ? totalNAV : navValue,
        principal: principalValue,
        benchmark: benchmarkValue,
      });
    }
    return data;
  };

  const chartData = generateData();

  return (
    <div className="p-6 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B313A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F0B90B] uppercase tracking-wider mb-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>Algorithmic Yield Velocity</span>
          </div>
          <h3 className="font-sans text-lg font-bold text-[#EAECEF] tracking-tight">
            Portfolio Compounding Trajectory
          </h3>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-[#181A20] p-1 rounded-lg border border-[#2B313A] self-start sm:self-auto">
          {(['7D', '30D', '90D', '1Y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                timeframe === t
                  ? 'bg-[#F0B90B] text-[#181A20] shadow-sm font-bold'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Graphic */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="binanceGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F0B90B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="binanceEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ECB81" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ECB81" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2B313A" vertical={false} />

            <XAxis
              dataKey="label"
              stroke="#848E9C"
              tick={{ fill: '#848E9C', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#2B313A' }}
            />

            <YAxis
              stroke="#848E9C"
              tick={{ fill: '#848E9C', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#F0B90B]/40 shadow-2xl backdrop-blur-md">
                      <div className="text-[11px] font-mono text-[#848E9C] mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#F0B90B]" />
                        {data.label}
                      </div>
                      <div className="text-sm font-sans font-bold text-[#EAECEF]">
                        NAV: <span className="text-[#F0B90B] font-mono">${Number(data.nav).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-xs font-mono text-[#848E9C] mt-1">
                        Principal: ${Number(data.principal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs font-mono text-[#0ECB81] mt-0.5 font-bold">
                        Alpha: +${(data.nav - data.principal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="nav"
              stroke="#F0B90B"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#binanceGoldGradient)"
            />

            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#474D57"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={0}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and Subtext */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono border-t border-[#2B313A] text-[#848E9C]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0B90B]"></span>
            <span className="text-[#EAECEF]">Heron Active Compounding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#848E9C] border-t border-dashed"></span>
            <span>Standard Market Index (4.2% APR)</span>
          </div>
        </div>
        <span className="text-[#0ECB81] font-semibold">+15.5% Weighted Performance</span>
      </div>
    </div>
  );
};
