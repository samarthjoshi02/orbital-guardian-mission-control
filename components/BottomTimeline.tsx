'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  AlertOctagon, 
  Terminal, 
  Clock, 
  Radio, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRightLeft 
} from 'lucide-react';
import { useStore, ConjunctionData } from '../store/useStore';

export default function BottomTimeline() {
  const { 
    conjunctions, 
    selectedConjunction, 
    setSelectedConjunction,
    simulationTime 
  } = useStore();

  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate scrolling simulated live event logs
  useEffect(() => {
    const events = [
      "Target transponder lock maintained on ISS (ZARYA)",
      "Starlink constellation orbit phase synchronizing",
      "Celestrak ephemeris database refresh completed",
      "LEO altitude sector #4 congestion index nominal",
      "Atmospheric density model updated // Solar flux 110.4",
      "NORAD collision avoidance radar sector scan initiated",
      "Descending node transit recorded for NOAA 19",
      "Telemetry update: STARLINK-3012 battery state 98.4%",
      "Deep Space Radar Net: Tracking 452,192 objects > 10cm",
      "Maneuver guidance draft generated for conj sector L4-C",
      "GPS BIIF-1 orbital drift compensated // Thruster burn completed"
    ];

    // Seed initial logs
    const initialLogs = Array.from({ length: 5 }, () => {
      const stamp = new Date(new Date(simulationTime).getTime() - Math.random() * 600000);
      const ev = events[Math.floor(Math.random() * events.length)];
      return `[${stamp.toISOString().slice(11, 19)} UTC] ${ev}`;
    });
    setLogs(initialLogs);

    // Dynamic timer to insert logs
    const interval = setInterval(() => {
      const stamp = new Date(simulationTime);
      const ev = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [...prev.slice(-30), `[${stamp.toISOString().slice(11, 19)} UTC] ${ev}`]);
    }, 8000);

    return () => clearInterval(interval);
  }, [simulationTime]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Format approach time relative to current simulation time
  const getTimeLeft = (approachTimeStr: string) => {
    try {
      const approach = new Date(approachTimeStr).getTime();
      const current = new Date(simulationTime).getTime();
      const diff = approach - current;
      
      if (diff < 0) return 'Passed';
      
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      
      return `T-${hours}h ${mins}m`;
    } catch {
      return approachTimeStr;
    }
  };

  return (
    <div className="h-60 w-full glass-panel border-t border-starlight-white/10 flex text-starlight-white z-20 overflow-hidden bg-space-black/50">
      
      {/* 1. Conjunction Alerts Horizontal Scroll */}
      <div className="flex-1 flex flex-col border-r border-starlight-white/10">
        <div className="p-3 border-b border-starlight-white/5 bg-space-black/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="text-red-500 animate-pulse" size={14} />
            <span className="font-bold tracking-widest text-xs uppercase text-red-500">LIVE COLLISION CORRIDOR FEED</span>
          </div>
          <span className="font-mono text-[9px] text-starlight-white/35 uppercase">
            {conjunctions.length} CONJUNCTIONS FORECASTED (24H)
          </span>
        </div>

        {/* Alerts Grid list */}
        <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center">
          {conjunctions.length === 0 ? (
            <div className="w-full text-center text-xs font-mono text-starlight-white/30 uppercase">
              NO CRITICAL APPROACHES DETECTED IN MONITORING FIELD
            </div>
          ) : (
            conjunctions.map((conj) => {
              const isSelected = selectedConjunction?.id === conj.id;
              const isCritical = conj.risk_level === 'Critical';
              const isHigh = conj.risk_level === 'High';
              
              return (
                <button
                  key={conj.id}
                  onClick={() => setSelectedConjunction(isSelected ? null : conj)}
                  className={`min-w-64 h-36 p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-br from-red-950/20 to-transparent border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : 'bg-space-black/45 border-starlight-white/10 hover:border-red-500/40 hover:bg-space-black/80'
                  }`}
                >
                  {/* Glowing header line if critical */}
                  {isCritical && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse rounded-t-lg"></div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-red-400 truncate max-w-[150px] uppercase">
                        {conj.satellite_name}
                      </span>
                      <span className="text-[8px] text-starlight-white/40 font-mono">
                        NORAD #{conj.satellite_id} VS #{conj.debris_id}
                      </span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                      isCritical ? 'bg-red-500/20 text-red-400' :
                      isHigh ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {conj.risk_level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-t border-b border-starlight-white/5 my-2">
                    <div className="flex items-center gap-1">
                      <ArrowRightLeft size={10} className="text-starlight-white/40" />
                      <span className="font-mono text-starlight-white/80 text-[11px]">{conj.distance_km} km</span>
                    </div>
                    <span className="font-mono text-[10px] text-red-400">
                      {(conj.probability * 100).toFixed(3)}% prob
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-starlight-white/40">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{getTimeLeft(conj.closest_approach_time)}</span>
                    </div>
                    <span className="text-electric-cyan font-bold tracking-wider">COMMAND &gt;&gt;</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Live Console Event Log */}
      <div className="w-80 border-l border-starlight-white/10 flex flex-col bg-space-black/20">
        <div className="p-3 border-b border-starlight-white/5 bg-space-black/35 flex items-center gap-1.5">
          <Terminal className="text-electric-cyan" size={14} />
          <span className="font-bold tracking-widest text-xs uppercase text-electric-cyan">EVENT CONSOLE LOGS</span>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-3 overflow-y-auto font-mono text-[9px] leading-relaxed text-emerald-400/80 space-y-1.5 bg-space-black/45 scrollbar-thin"
        >
          {logs.map((log, i) => (
            <div key={i} className="border-l border-emerald-500/20 pl-1.5 hover:bg-emerald-500/5 transition-colors">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
