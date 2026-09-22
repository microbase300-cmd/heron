import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Radio,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Trash2,
  Search,
  MapPin,
  Network,
  Clock,
  User,
  Copy,
  Check,
  Activity,
  Layers
} from 'lucide-react';
import { adminApi } from '../services/api';
import { VisitorLog, VisitorAnalyticsSummary } from '../types';

export const LiveVisitorTrackerView: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'desktop' | 'mobile'>('all');
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(5);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchTelemetry = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await adminApi.getVisitorTelemetry({
        limit: 150,
        search: search.trim() || undefined,
        filter: filter === 'all' ? undefined : filter
      });
      if (res && res.success) {
        setVisitors(res.visitors || []);
        setAnalytics(res.analytics || null);
      }
    } catch (err) {
      console.warn('Telemetry fetch notice:', err);
    } finally {
      setLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  }, [search, filter]);

  // Initial fetch and auto-refresh loop
  useEffect(() => {
    fetchTelemetry(false);
    if (pollIntervalSec <= 0) return;

    const timer = setInterval(() => {
      fetchTelemetry(true);
    }, pollIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [fetchTelemetry, pollIntervalSec]);

  // Copy IP Helper
  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Clear History
  const handleClearHistory = async () => {
    try {
      await adminApi.clearVisitorHistory();
      setVisitors([]);
      setShowClearConfirm(false);
      fetchTelemetry(false);
    } catch (err) {
      alert('Failed to clear visitor history.');
    }
  };

  // Relative Time Formatter
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Check if visitor is currently online (< 3 minutes)
  const isOnline = (lastActiveIso: string) => {
    return Date.now() - new Date(lastActiveIso).getTime() < 3 * 60 * 1000;
  };

  // Country Flag Emoji helper
  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2 || countryCode === 'UN' || countryCode === 'LOC') {
      return '🌐';
    }
    const code = countryCode.toUpperCase();
    return String.fromCodePoint(code.charCodeAt(0) + 127397, code.charCodeAt(1) + 127397);
  };

  // Device Icon helper
  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return <Smartphone className="w-4 h-4 text-[#F0B90B]" />;
    if (device === 'Tablet') return <Tablet className="w-4 h-4 text-[#0ECB81]" />;
    return <Laptop className="w-4 h-4 text-[#848E9C]" />;
  };

  const onlineVisitorsCount = useMemo(() => {
    return analytics?.onlineCount ?? visitors.filter(v => isOnline(v.lastActiveAt)).length;
  }, [analytics, visitors]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Radar Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/40 flex items-center justify-center text-[#0ECB81]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-sans font-bold text-[#EAECEF] tracking-tight">
                  Real-Time Visitor Radar & Telemetry
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping"></span>
                  RADAR ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-[#848E9C] mt-0.5">
                Ingress tracking across public marketing node and investor execution portals
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Poll interval, Refresh, Clear */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#181A20] p-1 rounded-lg border border-[#2B313A] text-xs font-mono">
            <span className="text-[10px] text-[#848E9C] px-2">Sync:</span>
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => setPollIntervalSec(sec)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  pollIntervalSec === sec
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                {sec}s
              </button>
            ))}
            <button
              onClick={() => setPollIntervalSec(0)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                pollIntervalSec === 0
                  ? 'bg-[#F6465D] text-white'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              Pause
            </button>
          </div>

          <button
            onClick={() => fetchTelemetry(false)}
            disabled={refreshing}
            className="p-2.5 rounded-lg bg-[#181A20] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all disabled:opacity-40"
            title="Refresh Ingress Feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#F0B90B]' : ''}`} />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-2 rounded-lg bg-[#F6465D]/10 hover:bg-[#F6465D]/20 border border-[#F6465D]/30 text-[#F6465D] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Purge Telemetry History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Purge Logs</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Online Now */}
        <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#0ECB81]/40 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-2">
            <span>Active Right Now</span>
            <div className="flex items-center gap-1.5 text-[#0ECB81]">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-ping"></span>
              <span className="text-[10px] font-bold font-mono">LIVE SESSIONS</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-bold text-[#0ECB81] tracking-tight">
            {onlineVisitorsCount}
          </div>
          <div className="text-[10px] text-[#848E9C] font-mono mt-1">
            Active navigation within last 3 minutes
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-2">
            <span>Unique Client IPs</span>
            <Globe className="w-4 h-4 text-[#F0B90B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-bold text-[#EAECEF] tracking-tight">
            {(analytics?.totalUniqueVisitors ?? visitors.length).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#F0B90B] font-mono mt-1">
            Distinct visitor network endpoints
          </div>
        </div>

        {/* Card 3: Total Recorded Visits */}
        <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-2">
            <span>Total Route Hits</span>
            <Activity className="w-4 h-4 text-[#F0B90B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-bold text-[#EAECEF] tracking-tight">
            {(analytics?.totalVisits ?? visitors.reduce((acc, v) => acc + (v.visitCount || 1), 0)).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#848E9C] font-mono mt-1">
            Total marketing & portal transitions
          </div>
        </div>

        {/* Card 4: Device Split */}
        <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A] hover:border-[#0ECB81]/40 transition-all">
          <div className="flex items-center justify-between text-[#848E9C] text-[11px] font-mono mb-2">
            <span>Device Environment</span>
            <Layers className="w-4 h-4 text-[#0ECB81]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-[#EAECEF]">
              {analytics?.deviceStats.desktop ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#848E9C]">Desktop</span>
            <span className="text-xs text-[#2B313A]">/</span>
            <span className="text-lg font-bold font-mono text-[#F0B90B]">
              {(analytics?.deviceStats.mobile ?? 0) + (analytics?.deviceStats.tablet ?? 0)}
            </span>
            <span className="text-[10px] font-mono text-[#848E9C]">Mobile</span>
          </div>
          <div className="w-full bg-[#181A20] h-1.5 rounded-full mt-2 overflow-hidden flex">
            {(() => {
              const total = (analytics?.deviceStats.desktop ?? 0) + (analytics?.deviceStats.mobile ?? 0) + (analytics?.deviceStats.tablet ?? 0) || 1;
              const dPct = ((analytics?.deviceStats.desktop ?? 0) / total) * 100;
              return (
                <>
                  <div style={{ width: `${dPct}%` }} className="bg-[#848E9C]" />
                  <div style={{ width: `${100 - dPct}%` }} className="bg-[#F0B90B]" />
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 3. Geographic & Network Ingress Breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Ingress Countries */}
          <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#2B313A]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F0B90B]" />
                <h3 className="text-xs font-mono font-bold text-[#EAECEF] uppercase tracking-wide">
                  Top Origin Countries
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#848E9C]">Ingress Volume</span>
            </div>

            <div className="space-y-2">
              {analytics.topCountries.length === 0 ? (
                <div className="text-xs text-[#848E9C] py-4 text-center font-mono">No international nodes recorded yet.</div>
              ) : (
                analytics.topCountries.slice(0, 5).map((c) => (
                  <div key={c.countryCode} className="flex items-center justify-between p-2 rounded-lg bg-[#181A20] border border-[#2B313A]/60">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{getCountryFlag(c.countryCode)}</span>
                      <span className="text-xs font-mono text-[#EAECEF] font-semibold">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#F0B90B]">{c.count}</span>
                      <span className="text-[10px] font-mono text-[#848E9C]">visitors</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Internet Service Providers (ISPs) */}
          <div className="p-5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#2B313A]">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#0ECB81]" />
                <h3 className="text-xs font-mono font-bold text-[#EAECEF] uppercase tracking-wide">
                  Top ISPs & Autonomous Systems
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#848E9C]">Carrier / Routing</span>
            </div>

            <div className="space-y-2">
              {analytics.topIsps.length === 0 ? (
                <div className="text-xs text-[#848E9C] py-4 text-center font-mono">No carrier records available yet.</div>
              ) : (
                analytics.topIsps.slice(0, 5).map((item) => (
                  <div key={item.isp} className="flex items-center justify-between p-2 rounded-lg bg-[#181A20] border border-[#2B313A]/60">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81]" />
                      <span className="text-xs font-mono text-[#EAECEF] truncate font-medium">{item.isp}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#0ECB81]">{item.count}</span>
                      <span className="text-[10px] font-mono text-[#848E9C]">hits</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1E2329] border border-[#2B313A]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#848E9C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IP, Country, ISP, OS, or Client..."
            className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg pl-9 pr-3.5 py-2 text-xs font-mono text-[#EAECEF] placeholder-[#848E9C] focus:border-[#F0B90B] focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Ingress' },
            { id: 'online', label: 'Active Now 🟢' },
            { id: 'desktop', label: 'Desktop' },
            { id: 'mobile', label: 'Mobile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40 font-bold'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#181A20]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Live Stream Telemetry Table */}
      <div className="rounded-xl bg-[#1E2329] border border-[#2B313A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#181A20] text-[#848E9C] border-b border-[#2B313A] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Activity</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Carrier / ISP</th>
                <th className="py-3 px-4 font-semibold">Device & Environment</th>
                <th className="py-3 px-4 font-semibold">Current Route</th>
                <th className="py-3 px-4 font-semibold text-right">Last Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#848E9C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#F0B90B]" />
                      <span>Synchronizing live visitor stream...</span>
                    </div>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#848E9C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Radio className="w-6 h-6 text-[#848E9C]" />
                      <span className="font-sans font-semibold text-sm text-[#EAECEF]">No telemetry matching criteria</span>
                      <span className="text-xs">Visitor hits will appear here automatically in real time.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const online = isOnline(v.lastActiveAt);
                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-[#181A20]/80 transition-colors ${
                        online ? 'bg-[#0ECB81]/5' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {online ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping" />
                            ONLINE
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#848E9C] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#848E9C]" />
                            {getRelativeTime(v.lastActiveAt)}
                          </span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#EAECEF] selection:bg-[#F0B90B]">{v.ip}</span>
                          <button
                            onClick={() => handleCopyIp(v.ip)}
                            className="p-1 rounded hover:bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-all"
                            title="Copy IP Address"
                          >
                            {copiedIp === v.ip ? (
                              <Check className="w-3 h-3 text-[#0ECB81]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {v.userName && (
                          <div className="flex items-center gap-1 text-[10px] text-[#F0B90B] mt-0.5">
                            <User className="w-2.5 h-2.5" />
                            <span className="font-sans font-semibold">{v.userName}</span>
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getCountryFlag(v.countryCode)}</span>
                          <div>
                            <div className="text-xs text-[#EAECEF] font-semibold">{v.country}</div>
                            {v.city && (
                              <div className="text-[10px] text-[#848E9C] flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {v.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ISP / Carrier */}
                      <td className="py-3 px-4 max-w-[200px] truncate">
                        <div className="text-xs text-[#EAECEF] truncate font-medium" title={v.isp}>
                          {v.isp || 'Standard Internet Route'}
                        </div>
                        {v.asn && (
                          <div className="text-[9.5px] text-[#848E9C] truncate" title={v.asn}>
                            {v.asn}
                          </div>
                        )}
                      </td>

                      {/* Device & OS */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(v.device)}
                          <div>
                            <div className="text-xs text-[#EAECEF] font-semibold">
                              {v.deviceModel || v.device} • {v.os}
                            </div>
                            <div className="text-[10px] text-[#848E9C]">{v.browser}</div>
                          </div>
                        </div>
                      </td>

                      {/* Page Visited */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              v.site === 'dashboard'
                                ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                                : 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            }`}
                          >
                            {v.site}
                          </span>
                          <span className="text-xs text-[#EAECEF] truncate max-w-[130px]" title={v.path}>
                            {v.path || '/'}
                          </span>
                        </div>
                        {v.referrer && v.referrer !== 'Direct' && (
                          <div className="text-[9.5px] text-[#848E9C] truncate max-w-[150px] mt-0.5" title={v.referrer}>
                            ref: {v.referrer.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                      </td>

                      {/* Timestamp & Count */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="text-xs text-[#EAECEF] font-semibold">
                          {new Date(v.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-[#848E9C] mt-0.5">
                          {v.visitCount > 1 ? (
                            <span className="text-[#F0B90B]">{v.visitCount} visits recorded</span>
                          ) : (
                            '1st visit'
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#1E2329] border border-[#F6465D]/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F6465D]/20 text-[#F6465D] flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-sans font-bold text-[#EAECEF]">Purge Telemetry Logs?</h3>
                <p className="text-xs font-mono text-[#848E9C]">This will clear recorded visitor session history.</p>
              </div>
            </div>

            <p className="text-xs font-mono text-[#848E9C] bg-[#181A20] p-3 rounded-lg border border-[#2B313A]">
              Historical IP records, location markers, and visitor counters will be reset. Active visitors will automatically begin recording anew on their next route change.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-xs font-mono text-[#EAECEF] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-lg bg-[#F6465D] hover:bg-[#ff4d66] text-white text-xs font-mono font-bold transition-all shadow-md shadow-[#F6465D]/20"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
