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
    { name: 'Available Liquidity', value: Math.max(0, available), color: '#F0B90B', sub: 'Instant On-Demand' },
    { name: 'Active Escrow', value: Math.max(0, escrow), color: '#387bf0', sub: 'Yield Generating' },
    { name: 'Yield Disbursed', value: Math.max(0, yieldProfit), color: '#0ECB81', sub: 'Accrued Profits' },
    { name: 'Affiliate Royalties', value: Math.max(0, referral), color: '#FCD535', sub: 'Network Residual' },
  ].filter((d) => d.value > 0);

  // If all values are 0, supply a default placeholder segment
  const displayData = data.length > 0 ? data : [
    { name: 'Unallocated Capital', value: 100, color: '#2B313A', sub: 'Reserve Ready' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#1E2329] border border-[#2B313A] space-y-6">
      <div className="flex items-center justify-between border-b border-[#2B313A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F0B90B] uppercase tracking-wider mb-1 font-bold">
            <PieIcon className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>Vault Capitalization</span>
          </div>
          <h3 className="font-sans text-lg font-bold text-[#EAECEF] tracking-tight">
            Asset Distribution Matrix
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#0ECB81] bg-[#0ECB81]/10 border border-[#0ECB81]/30 px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3 h-3" /> 100% Backed
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
                wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div className="p-3 rounded-xl bg-[#181A20] border border-[#2B313A] shadow-2xl text-xs font-mono backdrop-blur-md">
                        <div className="font-bold text-[#EAECEF] mb-1" style={{ color: item.color }}>
                          {item.name}
                        </div>
                        <div className="text-[#EAECEF] font-semibold">
                          ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#848E9C] text-[11px] mt-0.5">
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
            <span className="text-[10px] font-mono uppercase text-[#848E9C] tracking-wider font-semibold">Vault Total</span>
            <span className="text-lg font-sans font-bold text-[#EAECEF] tracking-tight">
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
                className="p-3 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <div>
                    <div className="text-xs font-sans font-bold text-[#EAECEF] leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#848E9C] mt-0.5">{item.sub}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#EAECEF]">
                    ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-mono text-[#848E9C] font-medium">{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
