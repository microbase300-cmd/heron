import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';

interface AssetAllocationChartProps {
  available: number;
  escrow: number;
  yieldProfit: number;
  referral: number;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  available,
  escrow,
  yieldProfit,
  referral,
}) => {
  const total = Math.max(1, available + escrow + yieldProfit + referral);

  const data = [
    { name: 'Available Liquidity', value: Math.max(0, available), color: '#d4af37', sub: 'Instant On-Demand' },
    { name: 'Active Escrow', value: Math.max(0, escrow), color: '#38bdf8', sub: 'Yield Generating' },
    { name: 'Yield Disbursed', value: Math.max(0, yieldProfit), color: '#10b981', sub: 'Accrued Profits' },
    { name: 'Affiliate Royalties', value: Math.max(0, referral), color: '#f59e0b', sub: 'Network Residual' },
  ].filter((d) => d.value > 0);

  // If all values are 0, supply a default placeholder segment
  const displayData = data.length > 0 ? data : [
    { name: 'Unallocated Capital', value: 100, color: '#334155', sub: 'Reserve Ready' },
  ];

  return (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider mb-1">
            <PieIcon className="w-3.5 h-3.5" />
            <span>Vault Capitalization</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            Asset Distribution Matrix
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-glow bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> 100% Fully Backed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Donut Chart with Center NAV */}
        <div className="sm:col-span-6 relative h-52 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div className="p-3 rounded-xl bg-[#0e1212]/95 border border-white/20 shadow-2xl text-xs font-mono">
                        <div className="font-bold text-white mb-1" style={{ color: item.color }}>
                          {item.name}
                        </div>
                        <div className="text-white font-semibold">
                          ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-white/50 text-[11px] mt-0.5">
                          {pct}% of Total Allocation
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Vault Total</span>
            <span className="text-lg font-serif font-bold text-white tracking-tight">
              ${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="sm:col-span-6 space-y-3">
          {displayData.map((item) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return (
              <div
                key={item.name}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <div>
                    <div className="text-xs font-serif font-bold text-white leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-white/40">{item.sub}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">
                    ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-mono text-white/50">{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
