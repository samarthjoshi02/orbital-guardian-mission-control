'use client';

import React, { useState } from 'react';
import { Search, Flame, Skull, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function DebrisListOverlay() {
  const { debris, selectedObject, setSelectedObject } = useStore();
  const [query, setQuery] = useState('');
  const [altFilter, setAltFilter] = useState<'all' | 'leo' | 'meo_geo'>('all');

  const filtered = debris.filter(deb => {
    const matchesSearch = deb.name.toLowerCase().includes(query.toLowerCase()) || 
                          deb.norad_id.toString().includes(query);
    
    let matchesAlt = true;
    if (altFilter === 'leo') {
      matchesAlt = deb.altitude_km < 2000;
    } else if (altFilter === 'meo_geo') {
      matchesAlt = deb.altitude_km >= 2000;
    }
    
    return matchesSearch && matchesAlt;
  });

  return (
    <div className="absolute inset-y-0 left-0 w-96 m-4 mr-0 z-10 glass-panel-violet border-soft-violet/20 rounded-lg flex flex-col text-starlight-white overflow-hidden shadow-2xl animate-fade-in">
      {/* Overlay Header */}
      <div className="p-4 border-b border-soft-violet/20 bg-space-black/50 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Skull className="text-soft-violet" size={14} />
            <span className="font-bold tracking-widest text-xs uppercase text-soft-violet">DEBRIS TRACKING</span>
          </div>
          <span className="text-[8px] font-mono text-starlight-white/40">ORBITAL DRIFT INDEX // INCOOPERATIVE CLOUD</span>
        </div>
        <span className="text-[10px] font-mono text-soft-violet/85 bg-soft-violet/10 px-2 py-0.5 rounded">
          {filtered.length} IN CLOUD
        </span>
      </div>

      {/* Search and Filters */}
      <div className="p-3 border-b border-starlight-white/5 bg-space-black/20 flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2.5 text-starlight-white/40" />
          <input
            type="text"
            placeholder="Search debris (e.g. Fengyun, Cosmos, ID)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-space-black/80 border border-starlight-white/10 rounded focus:outline-none focus:border-soft-violet/50 font-mono text-starlight-white"
          />
        </div>

        {/* Altitude Range Filter */}
        <div className="flex gap-1.5 text-[9px] font-mono">
          <button
            onClick={() => setAltFilter('all')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              altFilter === 'all'
                ? 'bg-soft-violet/20 border-soft-violet/50 text-soft-violet'
                : 'bg-space-black/40 border-starlight-white/5 text-starlight-white/40 hover:text-starlight-white/80'
            }`}
          >
            ALL ORBITS
          </button>
          <button
            onClick={() => setAltFilter('leo')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              altFilter === 'leo'
                ? 'bg-soft-violet/20 border-soft-violet/50 text-soft-violet'
                : 'bg-space-black/40 border-starlight-white/5 text-starlight-white/40 hover:text-starlight-white/80'
            }`}
          >
            LEO (&lt;2000 KM)
          </button>
          <button
            onClick={() => setAltFilter('meo_geo')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              altFilter === 'meo_geo'
                ? 'bg-soft-violet/20 border-soft-violet/50 text-soft-violet'
                : 'bg-space-black/40 border-starlight-white/5 text-starlight-white/40 hover:text-starlight-white/80'
            }`}
          >
            MEO / GEO
          </button>
        </div>
      </div>

      {/* Debris List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-space-black/30">
        {filtered.length === 0 ? (
          <div className="text-center font-mono text-[10px] text-starlight-white/30 py-8">
            NO DEBRIS DETECTED IN SELECTED FIELD
          </div>
        ) : (
          filtered.map(deb => {
            const isSelected = selectedObject?.norad_id === deb.norad_id;
            return (
              <button
                key={deb.norad_id}
                onClick={() => setSelectedObject(isSelected ? null : deb)}
                className={`w-full p-2.5 rounded text-left border flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? 'bg-soft-violet/10 border-soft-violet/50 text-starlight-white'
                    : 'bg-space-black/40 border-starlight-white/5 hover:border-soft-violet/30 hover:bg-space-black/80'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold group-hover:text-soft-violet transition-colors">
                    {deb.name}
                  </span>
                  <span className="text-[8px] font-mono text-starlight-white/40">
                    ID: #{deb.norad_id} // ALT: {deb.altitude_km} KM // INC: {deb.inclination.toFixed(1)}°
                  </span>
                </div>
                <AlertCircle size={12} className="text-starlight-white/20 group-hover:text-soft-violet transition-colors" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
