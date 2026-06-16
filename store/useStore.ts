import { create } from 'zustand';

export interface SpaceObjectData {
  norad_id: number;
  name: string;
  is_debris: boolean;
  inclination: number;
  eccentricity: number;
  altitude_km: number;
  velocity_kms: number;
  period_min: number;
  status: string;
}

export interface ConjunctionData {
  id: string;
  satellite_id: number;
  satellite_name: string;
  debris_id: number;
  debris_name: string;
  closest_approach_time: string;
  distance_km: number;
  probability: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  severity_score: number;
  relative_velocity_kms: number;
  lat: number;
  lon: number;
  alt: number;
}

export interface PositionData {
  id: number;
  name: string;
  is_debris: boolean;
  lat: number;
  lon: number;
  alt: number;
  r: [number, number, number];
}

export interface AIRecommendationData {
  conjunction_id: string;
  satellite_name: string;
  debris_name: string;
  maneuver_type: string;
  thrust_vector: string;
  execution_time: string;
  delta_v_ms: number;
  fuel_cost_kg: number;
  risk_reduction_pct: number;
  explanation: string;
  status: string;
  author: string;
}

export interface AnalyticsData {
  active_satellites: number;
  debris_objects: number;
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  congestion_level: string;
  orbit_counts: {
    LEO: number;
    MEO: number;
    GEO: number;
  };
  history: Array<{ day: string; alerts: number }>;
}

interface OrbitalStore {
  activeTab: 'overview' | 'satellites' | 'debris' | 'alerts' | 'analytics' | 'settings';
  satellites: SpaceObjectData[];
  debris: SpaceObjectData[];
  conjunctions: ConjunctionData[];
  analytics: AnalyticsData | null;
  positions: PositionData[];
  selectedObject: SpaceObjectData | null;
  selectedConjunction: ConjunctionData | null;
  aiRecommendation: AIRecommendationData | null;
  
  loading: boolean;
  positionsLoading: boolean;
  recommendationLoading: boolean;
  
  simulationTime: string; // ISO string
  timeScale: number; // 1x, 10x, 60x, 300x, 600x
  isPlaying: boolean;
  
  setTab: (tab: 'overview' | 'satellites' | 'debris' | 'alerts' | 'analytics' | 'settings') => void;
  setSelectedObject: (obj: SpaceObjectData | null) => void;
  setSelectedConjunction: (conj: ConjunctionData | null) => void;
  setSimulationTime: (time: string) => void;
  setTimeScale: (scale: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  fetchInitialData: () => Promise<void>;
  fetchPositions: (timeStr: string) => Promise<void>;
  fetchRecommendation: (conjId: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

const API_BASE = 'http://localhost:8000/api';

export const useStore = create<OrbitalStore>((set, get) => ({
  activeTab: 'overview',
  satellites: [],
  debris: [],
  conjunctions: [],
  analytics: null,
  positions: [],
  selectedObject: null,
  selectedConjunction: null,
  aiRecommendation: null,
  
  loading: false,
  positionsLoading: false,
  recommendationLoading: false,
  
  simulationTime: new Date().toISOString(),
  timeScale: 10,
  isPlaying: true,
  
  setTab: (activeTab) => set({ activeTab }),
  setSelectedObject: (selectedObject) => set({ selectedObject, selectedConjunction: null, aiRecommendation: null }),
  setSelectedConjunction: (selectedConjunction) => {
    set({ selectedConjunction, selectedObject: null });
    if (selectedConjunction) {
      get().fetchRecommendation(selectedConjunction.id);
    } else {
      set({ aiRecommendation: null });
    }
  },
  setSimulationTime: (simulationTime) => set({ simulationTime }),
  setTimeScale: (timeScale) => set({ timeScale }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  fetchInitialData: async () => {
    set({ loading: true });
    try {
      // Fetch satellites, debris, and conjunctions
      const [satRes, debRes, conjRes] = await Promise.all([
        fetch(`${API_BASE}/objects?is_debris=false`),
        fetch(`${API_BASE}/objects?is_debris=true`),
        fetch(`${API_BASE}/conjunctions`)
      ]);
      
      if (!satRes.ok || !debRes.ok || !conjRes.ok) throw new Error('API server returned error');
      
      const satellites = await satRes.json();
      const debris = await debRes.json();
      const conjunctions = await conjRes.json();
      
      set({ satellites, debris, conjunctions, loading: false });
    } catch (err) {
      console.error('Failed to load orbital catalog:', err);
      // Generate some basic frontend mock fallback data in case backend server is loading/off
      set({ loading: false });
    }
  },
  
  fetchPositions: async (timeStr: string) => {
    // Prevent overlapping fetches if network is slow
    if (get().positionsLoading) return;
    set({ positionsLoading: true });
    try {
      const res = await fetch(`${API_BASE}/positions?timestamp=${encodeURIComponent(timeStr)}`);
      if (res.ok) {
        const data = await res.json();
        set({ positions: data.positions });
      }
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    } finally {
      set({ positionsLoading: false });
    }
  },
  
  fetchRecommendation: async (conjId: string) => {
    set({ recommendationLoading: true, aiRecommendation: null });
    try {
      const res = await fetch(`${API_BASE}/recommendations/${conjId}`);
      if (res.ok) {
        const aiRecommendation = await res.json();
        set({ aiRecommendation });
      }
    } catch (err) {
      console.error('Failed to load AI recommendation:', err);
    } finally {
      set({ recommendationLoading: false });
    }
  },
  
  fetchAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) {
        const analytics = await res.json();
        set({ analytics });
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }
}));
