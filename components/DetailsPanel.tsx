'use client';

import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Compass, 
  Activity, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  Flame, 
  TrendingDown, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function DetailsPanel() {
  const { 
    selectedObject, 
    selectedConjunction, 
    aiRecommendation,
    recommendationLoading,
    setSelectedConjunction
  } = useStore();

  const [authorized, setAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Reset authorization states when conjunction changes
  useEffect(() => {
    setAuthorized(false);
    setAuthCode('');
    setIsAuthorizing(false);
  }, [selectedConjunction]);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setAuthorized(true);
      setIsAuthorizing(false);
      // Generate standard random authorization tag
      setAuthCode(`AUTH-OG-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 1500);
  };

  // 1. Loading State
  if (recommendationLoading) {
    return (
      <div className="w-96 h-full flex flex-col items-center justify-center glass-panel border-l border-starlight-white/10 text-starlight-white/60 font-mono text-xs p-8">
        <div className="w-8 h-8 rounded-full border-2 border-electric-cyan border-t-transparent animate-spin mb-4"></div>
        <span>RETRIEVING TELEMETRY SECTOR...</span>
      </div>
    );
  }

  // 2. Conjunction Warning Selection Panel
  if (selectedConjunction) {
    const conj = selectedConjunction;
    const isCritical = conj.risk_level === 'Critical';
    const isHigh = conj.risk_level === 'High';
    
    return (
      <div className="w-96 h-full flex flex-col glass-panel border-l border-starlight-white/10 text-starlight-white z-20 overflow-y-auto">
        {/* Panel Header */}
        <div className="p-4 border-b border-starlight-white/10 flex items-center justify-between bg-red-500/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500 animate-pulse" size={16} />
            <span className="font-bold tracking-widest text-xs uppercase text-red-500">CONJUNCTION REPORT</span>
          </div>
          <span className="font-mono text-[9px] text-starlight-white/40">{conj.id}</span>
        </div>

        {/* Risk Assessment metrics */}
        <div className="p-4 border-b border-starlight-white/5 bg-space-black/40 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-starlight-white/40 font-mono uppercase">CRITICALITY LEVEL:</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              isCritical ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
              isHigh ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/30'
            }`}>
              {conj.risk_level.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col bg-space-black/30 p-2.5 border border-starlight-white/5 rounded">
              <span className="text-[8px] text-starlight-white/40 font-mono">CLOSEST APPROACH</span>
              <span className="text-sm font-semibold font-mono text-electric-cyan">{conj.distance_km} km</span>
            </div>
            <div className="flex flex-col bg-space-black/30 p-2.5 border border-starlight-white/5 rounded">
              <span className="text-[8px] text-starlight-white/40 font-mono">PROBABILITY</span>
              <span className="text-sm font-semibold font-mono text-red-400">{(conj.probability * 100).toFixed(4)}%</span>
            </div>
          </div>
        </div>

        {/* Objects description card */}
        <div className="p-4 border-b border-starlight-white/5 flex flex-col gap-3">
          <div className="text-[10px] text-starlight-white/40 font-mono tracking-wider uppercase">COLLIDING BODIES</div>
          
          {/* Target Satellite */}
          <div className="bg-space-black/30 border border-starlight-white/5 p-3 rounded flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-emerald-400">{conj.satellite_name}</span>
              <span className="text-[9px] text-starlight-white/40 font-mono">NORAD #{conj.satellite_id} // TARGET ASSET</span>
            </div>
            <ChevronRight size={14} className="text-starlight-white/20" />
          </div>
          
          {/* Threat Debris */}
          <div className="bg-space-black/30 border border-starlight-white/5 p-3 rounded flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-amber-400">{conj.debris_name}</span>
              <span className="text-[9px] text-starlight-white/40 font-mono">NORAD #{conj.debris_id} // DEBRIS IMPACTOR</span>
            </div>
            <ChevronRight size={14} className="text-starlight-white/20" />
          </div>
        </div>

        {/* AI Recommendations Section */}
        {aiRecommendation && (
          <div className="flex-1 p-4 flex flex-col gap-3 bg-midnight-blue/10">
            <div className="flex items-center gap-1.5">
              <Zap className="text-electric-cyan" size={14} />
              <span className="text-[10px] text-electric-cyan font-bold tracking-widest font-mono uppercase">AI COLLISION AVOIDANCE BURN</span>
            </div>

            <div className="glass-panel-cyan p-3.5 rounded-lg flex flex-col gap-3 border-electric-cyan/20">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-electric-cyan">{aiRecommendation.maneuver_type}</span>
                  <span className="text-[8px] text-starlight-white/40 font-mono">{aiRecommendation.thrust_vector}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-starlight-white/40 font-mono">RISK DECREASE</span>
                  <span className="text-xs font-bold text-emerald-400">-{aiRecommendation.risk_reduction_pct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-b border-starlight-white/5 py-2.5">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-starlight-white/40 font-mono">DELTA-V</span>
                    <span className="text-xs font-semibold font-mono">{aiRecommendation.delta_v_ms} m/s</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-soft-violet" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-starlight-white/40 font-mono">PROPULSION COST</span>
                    <span className="text-xs font-semibold font-mono">{aiRecommendation.fuel_cost_kg} kg N2H4</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-starlight-white/60 font-mono leading-relaxed bg-space-black/40 p-2.5 rounded border border-starlight-white/5">
                {aiRecommendation.explanation}
              </p>

              {/* Interactive Authorization Action */}
              <div className="mt-2">
                {!authorized ? (
                  <button
                    onClick={handleAuthorize}
                    disabled={isAuthorizing}
                    className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
                      isAuthorizing
                        ? 'bg-space-black/50 border-starlight-white/10 text-starlight-white/40 cursor-wait'
                        : 'bg-electric-cyan border-electric-cyan text-space-black hover:bg-space-black hover:text-electric-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    }`}
                  >
                    {isAuthorizing ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border border-starlight-white/30 border-t-transparent animate-spin"></div>
                        TRANSMITTING CRYPTO-KEY...
                      </>
                    ) : (
                      'AUTHORIZE ORBITAL MANEUVER'
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CheckCircle2 size={16} />
                      <span>MANEUVER APPROVED</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400/60 uppercase">VERIFIED CODE // {authCode}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedConjunction(null)}
              className="mt-auto py-2 text-center text-[10px] font-mono text-starlight-white/40 hover:text-starlight-white/80 transition-colors uppercase border border-dashed border-starlight-white/10 rounded cursor-pointer"
            >
              Close Conjunction Report
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Object Selection Telemetry view (Satellite or Debris)
  if (selectedObject) {
    const obj = selectedObject;
    const isDebris = obj.is_debris;
    
    return (
      <div className="w-96 h-full flex flex-col glass-panel border-l border-starlight-white/10 text-starlight-white z-20 overflow-y-auto">
        {/* Panel Header */}
        <div className={`p-4 border-b border-starlight-white/10 flex items-center justify-between ${
          isDebris ? 'bg-amber-500/5' : 'bg-emerald-500/5'
        }`}>
          <div className="flex items-center gap-2">
            <Compass className={isDebris ? 'text-amber-500' : 'text-emerald-500'} size={16} />
            <span className="font-bold tracking-widest text-xs uppercase">OBJECT TELEMETRY</span>
          </div>
          <span className="font-mono text-[9px] text-starlight-white/40">NORAD #{obj.norad_id}</span>
        </div>

        {/* Object stats */}
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wide text-starlight-white">{obj.name}</span>
            <span className={`text-[10px] font-mono mt-0.5 ${
              isDebris ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {isDebris ? 'CATALOGED SPACE DEBRIS' : 'OPERATIONAL ACTIVE SATELLITE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-space-black/35 p-3 rounded border border-starlight-white/5 flex flex-col">
              <span className="text-[8px] text-starlight-white/40 font-mono">ORBITAL PERIOD</span>
              <span className="text-base font-semibold font-mono text-starlight-white/95 mt-1">{obj.period_min} min</span>
            </div>
            <div className="bg-space-black/35 p-3 rounded border border-starlight-white/5 flex flex-col">
              <span className="text-[8px] text-starlight-white/40 font-mono">ORBITAL VELOCITY</span>
              <span className="text-base font-semibold font-mono text-starlight-white/95 mt-1">{obj.velocity_kms} km/s</span>
            </div>
            <div className="bg-space-black/35 p-3 rounded border border-starlight-white/5 flex flex-col">
              <span className="text-[8px] text-starlight-white/40 font-mono">MEAN ALTITUDE</span>
              <span className="text-base font-semibold font-mono text-starlight-white/95 mt-1">{obj.altitude_km} km</span>
            </div>
            <div className="bg-space-black/35 p-3 rounded border border-starlight-white/5 flex flex-col">
              <span className="text-[8px] text-starlight-white/40 font-mono">INCLINATION</span>
              <span className="text-base font-semibold font-mono text-starlight-white/95 mt-1">{obj.inclination.toFixed(2)}°</span>
            </div>
          </div>

          <div className="bg-space-black/25 border border-starlight-white/5 p-4 rounded-lg mt-2 flex flex-col gap-2.5">
            <span className="text-[9px] text-starlight-white/35 font-mono tracking-widest uppercase">TRANSPONDER STATUS</span>
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${
                isDebris ? 'bg-starlight-white/10' :
                obj.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                obj.status === 'Standby' ? 'bg-blue-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`}></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-starlight-white/90">
                  {isDebris ? 'PASSIVE / UNCOOPERATIVE' : obj.status.toUpperCase()}
                </span>
                <span className="text-[8px] font-mono text-starlight-white/40">
                  {isDebris ? 'NO ACTIVE BROADCAST SIGNAL' : 'TELEMETRY TRANSCEIVER ONLINE'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto border border-dashed border-starlight-white/15 p-4 rounded-lg text-center flex flex-col gap-2 bg-space-black/30">
            <span className="text-[9px] text-starlight-white/40 font-mono">SATELLITE EPHEMERIS RECORD</span>
            <p className="text-[9px] font-mono text-starlight-white/50 leading-relaxed text-left bg-space-black/60 p-2.5 rounded overflow-x-auto whitespace-pre">
              TLE Line 1: 1 {obj.norad_id}U 24042A ... <br/>
              TLE Line 2: 2 {obj.norad_id} {obj.inclination.toFixed(2)} ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default Panel / Cockpit Status Overview
  return (
    <div className="w-96 h-full flex flex-col glass-panel border-l border-starlight-white/10 text-starlight-white z-20 justify-between">
      <div className="p-4 border-b border-starlight-white/10 flex items-center gap-2 bg-space-black/40">
        <Activity className="text-electric-cyan animate-pulse-slow" size={16} />
        <span className="font-bold tracking-widest text-xs uppercase">SYSTEM DIAGNOSTICS</span>
      </div>

      <div className="p-6 flex flex-col items-center justify-center text-center gap-4 flex-1">
        <div className="w-20 h-20 rounded-full border border-electric-cyan/20 flex items-center justify-center relative mb-2">
          <div className="absolute inset-0 rounded-full border border-dashed border-electric-cyan/40 animate-[spin_40s_linear_infinite]"></div>
          <Compass className="text-electric-cyan/60 animate-[spin_120s_linear_infinite]" size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold tracking-wider">AWAITING OBJECT SELECTION</span>
          <span className="text-[10px] text-starlight-white/40 font-mono leading-normal px-4">
            Select a satellite, debris particle, or conjunction alert from the timeline to retrieve raw telemetry and command vector controls.
          </span>
        </div>
      </div>

      <div className="p-4 border-t border-starlight-white/5 bg-midnight-blue/5 flex flex-col gap-2 text-left font-mono text-[9px]">
        <div className="text-electric-cyan/50 font-bold uppercase tracking-wider">AI TRACKING STATE</div>
        <div className="flex justify-between items-center text-starlight-white/60">
          <span>PROPAGATION ENGINE</span>
          <span className="text-emerald-400">ONLINE // 60 FPS</span>
        </div>
        <div className="flex justify-between items-center text-starlight-white/60">
          <span>ALERT SYSTEM</span>
          <span className="text-emerald-400">ACTIVE // 0.05s LATENCY</span>
        </div>
        <div className="flex justify-between items-center text-starlight-white/60">
          <span>MOCK DECISION ENGINE</span>
          <span className="text-emerald-400">WAITING FOR INPUT</span>
        </div>
      </div>
    </div>
  );
}
