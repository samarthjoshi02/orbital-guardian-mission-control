'use client';

import React, { useEffect } from 'react';
import { 
  BarChart3, 
  Orbit, 
  AlertOctagon, 
  TrendingUp, 
  Activity, 
  Zap 
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AnalyticsOverlay() {
  const { analytics, fetchAnalytics, loading } = useStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="absolute inset-0 z-10 glass-panel flex flex-col items-center justify-center text-starlight-white font-mono text-xs">
        <div className="w-10 h-10 rounded-full border-2 border-electric-cyan border-t-transparent animate-spin mb-4"></div>
        <span>COMPUTING ORBITAL DRIFT ANALYTICS...</span>
      </div>
    );
  }

  // Calculate percentage ratios for orbit distribution
  const totalOrbits = analytics.orbit_counts.LEO + analytics.orbit_counts.MEO + analytics.orbit_counts.GEO;
  const leoPct = totalOrbits > 0 ? (analytics.orbit_counts.LEO / totalOrbits) * 100 : 0;
  const meoPct = totalOrbits > 0 ? (analytics.orbit_counts.MEO / totalOrbits) * 100 : 0;
  const geoPct = totalOrbits > 0 ? (analytics.orbit_counts.GEO / totalOrbits) * 100 : 0;

  // Chart parameters for historical alert SVG line chart
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = 160;
  const maxVal = Math.max(...analytics.history.map(d => d.alerts), 10) + 5;

  const points = analytics.history.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (analytics.history.length - 1);
    const y = chartHeight - padding - (d.alerts * (chartHeight - padding * 2)) / maxVal;
    return { x, y, label: d.day, val: d.alerts };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length-1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  return (
    <div className="absolute inset-0 z-10 glass-panel bg-space-black/80 flex flex-col text-starlight-white p-6 overflow-y-auto animate-fade-in">
      {/* Brand Header */}
      <div className="flex justify-between items-center border-b border-starlight-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-electric-cyan" size={20} />
          <span className="font-bold tracking-widest text-sm uppercase text-electric-cyan">ORBITAL CONGESTION ANALYTICS BOARD</span>
        </div>
        <span className="text-[10px] font-mono text-starlight-white/40">SYSTEM VERSION // 4.2</span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-space-black/40 border border-starlight-white/5 p-4 rounded-lg flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg"></div>
          <span className="text-[9px] text-starlight-white/40 font-mono">ACTIVE SATELLITES</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{analytics.active_satellites}</span>
        </div>
        <div className="bg-space-black/40 border border-starlight-white/5 p-4 rounded-lg flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-lg"></div>
          <span className="text-[9px] text-starlight-white/40 font-mono">TRACKED DEBRIS PARTICLES</span>
          <span className="text-2xl font-bold font-mono text-amber-500">{analytics.debris_objects}</span>
        </div>
        <div className="bg-space-black/40 border border-starlight-white/5 p-4 rounded-lg flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-full blur-lg"></div>
          <span className="text-[9px] text-starlight-white/40 font-mono">CRITICAL/HIGH ALERTS</span>
          <span className="text-2xl font-bold font-mono text-red-500">{analytics.critical_alerts + analytics.high_alerts}</span>
        </div>
        <div className="bg-space-black/40 border border-starlight-white/5 p-4 rounded-lg flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-electric-cyan/5 rounded-full blur-lg"></div>
          <span className="text-[9px] text-starlight-white/40 font-mono">CONGESTION LEVEL</span>
          <span className={`text-2xl font-bold font-mono ${
            analytics.congestion_level === 'Critical' ? 'text-red-500' :
            analytics.congestion_level === 'Warning' ? 'text-amber-500' : 'text-emerald-500'
          }`}>{analytics.congestion_level.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div className="grid grid-cols-5 gap-6">
        
        {/* Left Side: Historical Line Chart (glowing SVG) */}
        <div className="col-span-3 bg-space-black/30 border border-starlight-white/5 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-starlight-white/5 pb-2.5">
            <TrendingUp size={14} className="text-electric-cyan" />
            <span className="text-xs font-bold tracking-widest uppercase">7-DAY ALERT FREQUENCY INDEX</span>
          </div>

          <div className="w-full flex justify-center bg-space-black/25 rounded p-2 border border-starlight-white/5">
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((r, i) => {
                const y = padding + r * (chartHeight - padding * 2);
                return (
                  <line 
                    key={i} 
                    x1={padding} 
                    y1={y} 
                    x2={chartWidth - padding} 
                    y2={y} 
                    stroke="rgba(226,232,240,0.04)" 
                    strokeDasharray="4 4" 
                  />
                );
              })}

              {/* Shaded Area */}
              {areaD && <path d={areaD} fill="url(#chartGlow)" />}
              
              {/* Path Line */}
              {pathD && <path d={pathD} fill="none" stroke="#22D3EE" strokeWidth="2" />}

              {/* Point Markers and Labels */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#050816" stroke="#22D3EE" strokeWidth="2" />
                  <text 
                    x={p.x} 
                    y={chartHeight - 12} 
                    fill="rgba(226,232,240,0.4)" 
                    fontSize="9" 
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                  <text 
                    x={p.x} 
                    y={p.y - 8} 
                    fill="#22D3EE" 
                    fontSize="9" 
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Side: Orbit Distribution progress bars */}
        <div className="col-span-2 bg-space-black/30 border border-starlight-white/5 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-starlight-white/5 pb-2.5">
            <Orbit size={14} className="text-soft-violet" />
            <span className="text-xs font-bold tracking-widest uppercase">ALTITUDE SECTOR DISTRIBUTION</span>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            {/* LEO Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-emerald-400">LOW EARTH ORBIT (LEO) &lt;2,000KM</span>
                <span className="text-starlight-white/80">{analytics.orbit_counts.LEO} objects ({leoPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 bg-space-black rounded-full overflow-hidden border border-starlight-white/5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${leoPct}%` }}></div>
              </div>
            </div>

            {/* MEO Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-electric-cyan">MEDIUM EARTH ORBIT (MEO) 2,000KM-35,000KM</span>
                <span className="text-starlight-white/80">{analytics.orbit_counts.MEO} objects ({meoPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 bg-space-black rounded-full overflow-hidden border border-starlight-white/5">
                <div className="h-full bg-electric-cyan rounded-full" style={{ width: `${meoPct}%` }}></div>
              </div>
            </div>

            {/* GEO Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-soft-violet">GEOSTATIONARY ORBIT (GEO) &gt;35,000KM</span>
                <span className="text-starlight-white/80">{analytics.orbit_counts.GEO} objects ({geoPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 bg-space-black rounded-full overflow-hidden border border-starlight-white/5">
                <div className="h-full bg-soft-violet rounded-full" style={{ width: `${geoPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 border border-dashed border-starlight-white/10 p-4 rounded-lg bg-space-black/10 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-starlight-white/50">
          <Activity size={14} className="text-electric-cyan animate-pulse" />
          <span>AI prediction algorithms evaluating active conjunction indices over a 24-hour forecast window. Last calculated: Just now.</span>
        </div>
      </div>
    </div>
  );
}
