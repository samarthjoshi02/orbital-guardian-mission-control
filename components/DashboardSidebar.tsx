'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Satellite, 
  Skull, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  FastForward,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function DashboardSidebar() {
  const {
    activeTab,
    setTab,
    isPlaying,
    setIsPlaying,
    timeScale,
    setTimeScale,
    simulationTime,
    satellites,
    debris,
    setSelectedObject
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Formatter for UTC Date Display
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return isoString;
    }
  };

  // Filter list search results
  const allObjects = [...satellites, ...debris];
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : allObjects.filter(obj => 
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        obj.norad_id.toString().includes(searchQuery)
      ).slice(0, 5);

  const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'satellites', name: 'Satellites Catalog', icon: Satellite },
    { id: 'debris', name: 'Debris Tracking', icon: Skull },
    { id: 'alerts', name: 'Collision Warnings', icon: AlertTriangle },
    { id: 'analytics', name: 'Analytics Board', icon: BarChart3 },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ] as const;

  return (
    <div className="w-80 h-full flex flex-col glass-panel border-r border-starlight-white/10 text-starlight-white z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-starlight-white/10 flex flex-col gap-1 relative overflow-hidden bg-space-black/45">
        <div className="absolute top-0 right-0 w-24 h-24 bg-electric-cyan/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-electric-cyan animate-pulse-slow"></div>
          <span className="font-bold tracking-widest text-lg text-electric-cyan font-sans uppercase">ORBITAL GUARDIAN</span>
        </div>
        <span className="text-[9px] text-starlight-white/40 font-mono tracking-wider">SPACE TRAFFIC CONTROL // SECURE HUB</span>
      </div>

      {/* Real-time Clock Panel */}
      <div className="p-4 border-b border-starlight-white/5 bg-midnight-blue/20 font-mono flex flex-col gap-1.5 relative">
        <div className="text-[9px] text-electric-cyan tracking-widest font-bold">MISSION ELAPSED TIME (UTC)</div>
        <div className="text-sm font-semibold tracking-wider text-starlight-white/95">
          {formatTime(simulationTime)}
        </div>
        
        {/* Play/Pause Control Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded border transition-all duration-300 font-sans cursor-pointer ${
              isPlaying 
                ? 'bg-electric-cyan/10 border-electric-cyan/35 text-electric-cyan hover:bg-electric-cyan/20' 
                : 'bg-space-black border-starlight-white/10 text-starlight-white/60 hover:border-starlight-white/20'
            }`}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'PAUSE CLOCK' : 'RESUME CLOCK'}
          </button>
          
          <div className="flex items-center gap-1.5 bg-space-black/50 border border-starlight-white/10 rounded px-2 py-1">
            <FastForward size={12} className="text-starlight-white/40" />
            <select
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-mono focus:outline-none text-starlight-white cursor-pointer"
            >
              <option value="1" className="bg-space-black text-starlight-white">1x</option>
              <option value="10" className="bg-space-black text-starlight-white">10x</option>
              <option value="60" className="bg-space-black text-starlight-white">60x (1m/s)</option>
              <option value="300" className="bg-space-black text-starlight-white">300x</option>
              <option value="900" className="bg-space-black text-starlight-white">900x (15m/s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-sans font-medium rounded transition-all duration-300 relative group cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-electric-cyan/10 to-transparent text-electric-cyan border-l-2 border-electric-cyan' 
                  : 'text-starlight-white/60 hover:text-starlight-white/95 hover:bg-starlight-white/5 border-l-2 border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-electric-cyan' : 'text-starlight-white/40 group-hover:text-starlight-white/60'} />
              <span className="uppercase tracking-widest">{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Object search panel */}
      <div className="p-4 border-t border-starlight-white/10 bg-space-black/30 flex flex-col gap-2 relative">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono tracking-widest text-starlight-white/40 font-bold uppercase">CATALOG RADAR</span>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-starlight-white/40 hover:text-electric-cyan transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={12} />
          </button>
        </div>

        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-starlight-white/30" />
          <input
            type="text"
            placeholder="Search catalog (e.g. Starlink, ISS, rsID)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-space-black border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 font-mono text-starlight-white placeholder-starlight-white/30"
          />
        </div>

        {/* Quick Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute bottom-14 left-4 right-4 bg-midnight-blue/95 border border-starlight-white/15 rounded shadow-2xl p-1 z-30 flex flex-col gap-0.5">
            {searchResults.map((obj) => (
              <button
                key={obj.norad_id}
                onClick={() => {
                  setSelectedObject(obj);
                  setSearchQuery('');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-electric-cyan/10 transition-colors flex items-center justify-between text-[11px] font-mono cursor-pointer"
              >
                <span className="font-semibold text-starlight-white truncate max-w-[120px]">{obj.name}</span>
                <span className="text-starlight-white/40">#{obj.norad_id}</span>
                <span className={`text-[8px] px-1 rounded ${
                  obj.is_debris ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {obj.is_debris ? 'DEBRIS' : 'SAT'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
