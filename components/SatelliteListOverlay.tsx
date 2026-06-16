'use client';

import React, { useState } from 'react';
import { Search, Radio, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { useStore, SpaceObjectData } from '../store/useStore';

export default function SatelliteListOverlay() {
  const { satellites, selectedObject, setSelectedObject } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Standby' | 'Degraded'>('all');

  const filtered = satellites.filter(sat => {
    const matchesSearch = sat.name.toLowerCase().includes(query.toLowerCase()) || 
                          sat.norad_id.toString().includes(query);
    const matchesStatus = statusFilter === 'all' || sat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="absolute inset-y-0 left-0 w-96 m-4 mr-0 z-10 glass-panel-cyan border-electric-cyan/20 rounded-lg flex flex-col text-starlight-white overflow-hidden shadow-2xl animate-fade-in">
      {/* Overlay Header */}
      <div className="p-4 border-b border-electric-cyan/20 bg-space-black/50 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-bold tracking-widest text-xs uppercase text-electric-cyan">SATELLITE CATALOG</span>
          <span className="text-[8px] font-mono text-starlight-white/40">DATABASE CONTROLS // SECURE REGISTRY</span>
        </div>
        <span className="text-[10px] font-mono text-electric-cyan/80 bg-electric-cyan/10 px-2 py-0.5 rounded">
          {filtered.length} IN VIEW
        </span>
      </div>

      {/* Search and Filters */}
      <div className="p-3 border-b border-starlight-white/5 bg-space-black/20 flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2.5 text-starlight-white/40" />
          <input
            type="text"
            placeholder="Search by name, NORAD ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-space-black/80 border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 font-mono text-starlight-white"
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 text-[9px] font-mono">
          {(['all', 'Active', 'Standby', 'Degraded'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                statusFilter === f
                  ? 'bg-electric-cyan/20 border-electric-cyan/50 text-electric-cyan'
                  : 'bg-space-black/40 border-starlight-white/5 text-starlight-white/40 hover:text-starlight-white/80'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Satellites List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-space-black/30">
        {filtered.length === 0 ? (
          <div className="text-center font-mono text-[10px] text-starlight-white/30 py-8">
            NO ASSETS FOUND MATCHING CORRIDOR
          </div>
        ) : (
          filtered.map(sat => {
            const isSelected = selectedObject?.norad_id === sat.norad_id;
            return (
              <button
                key={sat.norad_id}
                onClick={() => setSelectedObject(isSelected ? null : sat)}
                className={`w-full p-2.5 rounded text-left border flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? 'bg-electric-cyan/10 border-electric-cyan/50 text-starlight-white'
                    : 'bg-space-black/40 border-starlight-white/5 hover:border-electric-cyan/30 hover:bg-space-black/80'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold group-hover:text-electric-cyan transition-colors">
                      {sat.name}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      sat.status === 'Active' ? 'bg-emerald-500' :
                      sat.status === 'Standby' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <span className="text-[8px] font-mono text-starlight-white/40">
                    ID: #{sat.norad_id} // ALT: {sat.altitude_km} KM // VEL: {sat.velocity_kms} KM/S
                  </span>
                </div>
                <ArrowUpRight size={12} className="text-starlight-white/20 group-hover:text-electric-cyan transition-colors" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
