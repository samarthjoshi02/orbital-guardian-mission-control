'use client';

import React, { useState } from 'react';
import { ShieldAlert, Search, Clock, ArrowRightLeft } from 'lucide-react';
import { useStore, ConjunctionData } from '../store/useStore';

export default function AlertsListOverlay() {
  const { conjunctions, selectedConjunction, setSelectedConjunction, simulationTime } = useStore();
  const [riskFilter, setRiskFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');

  const filtered = conjunctions.filter(conj => {
    return riskFilter === 'all' || conj.risk_level === riskFilter;
  });

  const getTimeLeft = (approachTimeStr: string) => {
    try {
      const approach = new Date(approachTimeStr).getTime();
      const current = new Date(simulationTime).getTime();
      const diff = approach - current;
      if (diff < 0) return 'Passed';
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      return `${hours}h ${mins}m`;
    } catch {
      return approachTimeStr;
    }
  };

  return (
    <div className="absolute inset-y-0 left-0 w-96 m-4 mr-0 z-10 glass-panel border-red-500/10 rounded-lg flex flex-col text-starlight-white overflow-hidden shadow-2xl animate-fade-in">
      {/* Overlay Header */}
      <div className="p-4 border-b border-red-500/20 bg-space-black/50 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="text-red-500" size={14} />
            <span className="font-bold tracking-widest text-xs uppercase text-red-500">COLLISION WARNINGS</span>
          </div>
          <span className="text-[8px] font-mono text-starlight-white/40">REAL-TIME CONJUNCTION CALCULATOR</span>
        </div>
        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
          {filtered.length} THREATS
        </span>
      </div>

      {/* Filter tabs */}
      <div className="p-3 border-b border-starlight-white/5 bg-space-black/20 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1 text-[8px] font-mono">
          {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                riskFilter === f
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-space-black/40 border-starlight-white/5 text-starlight-white/40 hover:text-starlight-white/80'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-space-black/30">
        {filtered.length === 0 ? (
          <div className="text-center font-mono text-[10px] text-starlight-white/30 py-8">
            NO CONJUNCTION THREATS IN MONITORING SCOPE
          </div>
        ) : (
          filtered.map(conj => {
            const isSelected = selectedConjunction?.id === conj.id;
            const isCrit = conj.risk_level === 'Critical';
            const isHigh = conj.risk_level === 'High';
            
            return (
              <button
                key={conj.id}
                onClick={() => setSelectedConjunction(isSelected ? null : conj)}
                className={`w-full p-3 rounded border text-left flex flex-col justify-between transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? 'bg-red-950/20 border-red-500 text-starlight-white shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                    : 'bg-space-black/40 border-starlight-white/5 hover:border-red-500/30 hover:bg-space-black/80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-starlight-white group-hover:text-red-400 transition-colors">
                      {conj.satellite_name}
                    </span>
                    <span className="text-[8px] font-mono text-starlight-white/40">
                      NORAD #{conj.satellite_id} vs {conj.debris_name}
                    </span>
                  </div>
                  <span className={`text-[8px] font-mono px-1.5 rounded ${
                    isCrit ? 'bg-red-500/20 text-red-400' :
                    isHigh ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {conj.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-starlight-white/50 border-t border-starlight-white/5 pt-2">
                  <div className="flex items-center gap-1.5">
                    <ArrowRightLeft size={10} />
                    <span>{conj.distance_km} KM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} />
                    <span>{getTimeLeft(conj.closest_approach_time)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
