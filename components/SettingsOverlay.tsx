'use client';

import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Check } from 'lucide-react';

export default function SettingsOverlay() {
  const [satApi, setSatApi] = useState('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle');
  const [debrisApi, setDebrisApi] = useState('https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle');
  const [aiKey, setAiKey] = useState('••••••••••••••••••••••••••••••••');
  const [simFreq, setSimFreq] = useState(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="absolute inset-0 z-10 glass-panel bg-space-black/80 flex flex-col text-starlight-white p-6 overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-starlight-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Settings className="text-electric-cyan" size={20} />
          <span className="font-bold tracking-widest text-sm uppercase text-electric-cyan">SYSTEM CONFIGURATION</span>
        </div>
        <span className="text-[10px] font-mono text-starlight-white/40">HUD CONTROL CENTER</span>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl flex flex-col gap-6">
        
        {/* API Settings Section */}
        <div className="flex flex-col gap-4 bg-space-black/30 border border-starlight-white/5 p-5 rounded-lg">
          <span className="text-xs font-bold font-mono tracking-widest text-electric-cyan uppercase">TELEMETRY DATA ENDPOINTS</span>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-starlight-white/50 uppercase">SATELLITE TLE SOURCE API</label>
            <input
              type="text"
              value={satApi}
              onChange={(e) => setSatApi(e.target.value)}
              className="px-3 py-2 bg-space-black border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 text-xs font-mono text-starlight-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-starlight-white/50 uppercase">DEBRIS TLE SOURCE API</label>
            <input
              type="text"
              value={debrisApi}
              onChange={(e) => setDebrisApi(e.target.value)}
              className="px-3 py-2 bg-space-black border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 text-xs font-mono text-starlight-white"
            />
          </div>
        </div>

        {/* AI engine credentials */}
        <div className="flex flex-col gap-4 bg-space-black/30 border border-starlight-white/5 p-5 rounded-lg">
          <span className="text-xs font-bold font-mono tracking-widest text-electric-cyan uppercase">AI REASONING CREDENTIALS</span>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-starlight-white/50 uppercase">COLLISION ENGINE PRIVATE API KEY</label>
              <span className="text-[8px] text-amber-500 font-mono">ENCRYPTED AT REST</span>
            </div>
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              className="px-3 py-2 bg-space-black border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 text-xs font-mono text-starlight-white"
            />
          </div>
        </div>

        {/* Simulation variables */}
        <div className="flex flex-col gap-4 bg-space-black/30 border border-starlight-white/5 p-5 rounded-lg">
          <span className="text-xs font-bold font-mono tracking-widest text-electric-cyan uppercase">SIMULATION PREFERENCES</span>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-starlight-white/50 uppercase">PROPAGATION TICK INTERVAL (SECONDS)</label>
            <select
              value={simFreq}
              onChange={(e) => setSimFreq(Number(e.target.value))}
              className="px-3 py-2 bg-space-black border border-starlight-white/10 rounded focus:outline-none focus:border-electric-cyan/50 text-xs font-mono text-starlight-white"
            >
              <option value="1">1.0 Seconds (Real-Time HUD)</option>
              <option value="2">2.0 Seconds (Eco Bandwidth)</option>
              <option value="5">5.0 Seconds (Low Latency)</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-electric-cyan text-space-black font-bold text-xs uppercase tracking-wider rounded border border-electric-cyan hover:bg-space-black hover:text-electric-cyan transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            <Save size={14} />
            Commit Configuration
          </button>
          
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono animate-fade-in">
              <Check size={16} />
              <span>CONFIGURATION COMMITTED TO ENVIRONMENT</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
