'use client';

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  ChevronRight, 
  Satellite, 
  Skull, 
  AlertOctagon, 
  Orbit, 
  Layers, 
  ShieldCheck, 
  LineChart, 
  Cpu,
  ArrowRight,
  Globe
} from 'lucide-react';
import { useStore } from '../store/useStore';
import EarthCanvas from '../components/EarthCanvas';
import DashboardSidebar from '../components/DashboardSidebar';
import DetailsPanel from '../components/DetailsPanel';
import BottomTimeline from '../components/BottomTimeline';
import SatelliteListOverlay from '../components/SatelliteListOverlay';
import DebrisListOverlay from '../components/DebrisListOverlay';
import AlertsListOverlay from '../components/AlertsListOverlay';
import AnalyticsOverlay from '../components/AnalyticsOverlay';
import SettingsOverlay from '../components/SettingsOverlay';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const { fetchInitialData, activeTab, fetchAnalytics } = useStore();

  useEffect(() => {
    // Initial fetch of orbital elements catalog
    fetchInitialData();
    fetchAnalytics();
  }, []);

  // 1. Mission Control Dashboard Layout
  if (showDashboard) {
    return (
      <div className="h-screen w-screen flex flex-col bg-space-black overflow-hidden relative font-sans">
        
        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Navigation and Control Sidebar */}
          <DashboardSidebar />
          
          {/* Main Visualizer Area */}
          <div className="flex-1 h-full relative flex flex-col bg-space-black">
            
            {/* Center Header Panel */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-3 bg-space-black/75 px-4 py-2 border border-starlight-white/10 rounded font-mono text-xs shadow-2xl">
              <Radio size={14} className="text-electric-cyan animate-pulse" />
              <span className="text-starlight-white/50">SECTOR STATUS //</span>
              <span className="text-emerald-400 font-bold">ALL SYSTEMS ACTIVE</span>
            </div>

            {/* Render 3D Canvas in center */}
            <div className="flex-1 w-full h-full z-0">
              <EarthCanvas />
            </div>
            
            {/* Tab Overlays on top of the 3D scene */}
            {activeTab === 'satellites' && <SatelliteListOverlay />}
            {activeTab === 'debris' && <DebrisListOverlay />}
            {activeTab === 'alerts' && <AlertsListOverlay />}
            {activeTab === 'analytics' && <AnalyticsOverlay />}
            {activeTab === 'settings' && <SettingsOverlay />}
            
            {/* Bottom Timeline and Alerts Warning Stream */}
            <BottomTimeline />
          </div>
          
          {/* Right Selected Telemetry and Command Panel */}
          <DetailsPanel />
        </div>
      </div>
    );
  }

  // 2. Futuristic Cinematic Landing Page
  return (
    <div className="min-h-screen w-screen flex flex-col bg-space-black relative overflow-hidden font-sans">
      
      {/* 3D Background Backdrop */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <EarthCanvas />
      </div>

      {/* Landing page Grid overlay */}
      <div className="absolute inset-0 z-0 grid-overlay opacity-30 pointer-events-none"></div>

      {/* Header navbar */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-10 relative border-b border-starlight-white/5 bg-space-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-electric-cyan"></div>
          <span className="font-bold tracking-widest text-sm text-starlight-white font-sans uppercase">DEEPSPACE COMMAND</span>
        </div>
        <button
          onClick={() => setShowDashboard(true)}
          className="px-4 py-2 bg-gradient-to-r from-electric-cyan/20 to-soft-violet/20 border border-electric-cyan/30 text-electric-cyan hover:border-electric-cyan hover:text-space-black hover:bg-electric-cyan text-xs font-semibold uppercase tracking-wider rounded transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
        >
          Launch Terminal
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 py-16">
        <div className="max-w-4xl flex flex-col items-center gap-6 relative">
          
          {/* Orbit tag */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-electric-cyan/10 to-transparent border border-electric-cyan/20 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-mono text-electric-cyan uppercase">
            <Globe size={12} className="animate-spin-slow" />
            AI-POWERED ORBITAL PROTECTION NETWORK
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-starlight-white uppercase bg-clip-text">
            ORBITAL GUARDIAN
          </h1>
          
          <h2 className="text-lg md:text-xl font-bold tracking-wide text-electric-cyan/95 uppercase max-w-2xl leading-relaxed">
            AI-Powered Space Traffic Management &<br/>
            Orbital Collision Prediction System
          </h2>

          <p className="text-sm md:text-base text-starlight-white/60 max-w-xl leading-relaxed">
            Monitor active satellites, forecast high-risk space debris conjunctions, and authorize real-time automated evasive orbital burns.
          </p>

          <div className="flex flex-row gap-4 mt-4">
            <button
              onClick={() => setShowDashboard(true)}
              className="px-6 py-3 bg-electric-cyan text-space-black font-bold text-xs uppercase tracking-wider rounded-lg border border-electric-cyan hover:bg-space-black hover:text-electric-cyan transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <Rocket size={14} />
              Launch Mission Control
            </button>
            <a
              href="#features"
              className="px-6 py-3 border border-starlight-white/10 text-starlight-white/80 font-bold text-xs uppercase tracking-wider rounded-lg hover:border-starlight-white/30 hover:bg-starlight-white/5 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Learn More
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </main>

      {/* Stats Cards Section */}
      <section className="w-full max-w-6xl mx-auto px-6 relative z-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel border-starlight-white/10 p-5 rounded-xl flex flex-col gap-1 items-center md:items-start">
            <span className="text-[10px] text-starlight-white/40 font-mono tracking-wider uppercase">ACTIVE SATELLITES</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">10,482</span>
          </div>
          <div className="glass-panel border-starlight-white/10 p-5 rounded-xl flex flex-col gap-1 items-center md:items-start">
            <span className="text-[10px] text-starlight-white/40 font-mono tracking-wider uppercase">TRACKED DEBRIS OBJECTS</span>
            <span className="text-2xl font-bold text-amber-500 font-mono">450,219</span>
          </div>
          <div className="glass-panel border-starlight-white/10 p-5 rounded-xl flex flex-col gap-1 items-center md:items-start">
            <span className="text-[10px] text-starlight-white/40 font-mono tracking-wider uppercase">COLLISION ALERTS</span>
            <span className="text-2xl font-bold text-red-500 font-mono">34</span>
          </div>
          <div className="glass-panel border-starlight-white/10 p-5 rounded-xl flex flex-col gap-1 items-center md:items-start">
            <span className="text-[10px] text-starlight-white/40 font-mono tracking-wider uppercase">MONITORED ORBIT SECTORS</span>
            <span className="text-2xl font-bold text-electric-cyan font-mono">LEO/MEO/GEO</span>
          </div>
        </div>
      </section>

      {/* Features Cards Section */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 relative z-10 pb-20 border-t border-starlight-white/5 pt-16">
        <div className="text-center mb-12 flex flex-col gap-2">
          <span className="text-[10px] text-electric-cyan font-bold tracking-widest font-mono uppercase">NETWORK OVERVIEW</span>
          <h3 className="text-2xl md:text-3xl font-extrabold uppercase text-starlight-white">CORE SECURITY PLATFORM CAPABILITIES</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-electric-cyan/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan group-hover:bg-electric-cyan group-hover:text-space-black transition-all duration-300">
              <Satellite size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">Real-Time Satellite Tracking</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Maintains transponder logs on active low-earth assets. Translates standard Two-Line Element (TLE) orbits instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-soft-violet/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-soft-violet/10 border border-soft-violet/20 flex items-center justify-center text-soft-violet group-hover:bg-soft-violet group-hover:text-space-black transition-all duration-300">
              <Skull size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">Space Debris Monitoring</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Updates trajectories on cataloged debris clouds. Propagates orbits over coarse altitude corridors to map risks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-red-500/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-space-black transition-all duration-300">
              <AlertOctagon size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">Collision Prediction Engine</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Evaluates closest-approach distances and cross-track matrices at fine resolution to predict conjunction risks.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-electric-cyan/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan group-hover:bg-electric-cyan group-hover:text-space-black transition-all duration-300">
              <Cpu size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">AI Maneuver Recommendations</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Determines fuel-optimal burn directions (prograde, retrograde, normal) to shift satellite phase and clear conjunctions.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-soft-violet/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-soft-violet/10 border border-soft-violet/20 flex items-center justify-center text-soft-violet group-hover:bg-soft-violet group-hover:text-space-black transition-all duration-300">
              <LineChart size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">Orbital Analytics Dashboard</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Tracks LEO/MEO/GEO congestion metrics, critical alert counters, and warning trends over 7-day monitoring intervals.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel border-starlight-white/10 p-6 rounded-xl hover:border-emerald-500/30 hover:bg-midnight-blue/5 transition-all duration-300 flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-space-black transition-all duration-300">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase">Maneuver Security Clearance</h4>
            <p className="text-xs text-starlight-white/50 leading-relaxed">
              Provides cryptographic verification and verification vectors before committing thruster impulses on operational satellites.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

// Simple styles for Radio element import
function Radio({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  );
}
