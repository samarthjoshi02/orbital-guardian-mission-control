# Orbital Guardian

Orbital Guardian is a production-quality, futuristic Space Traffic Management (STM) and Space Debris Collision Prediction Platform. The system mimics a high-tech spacecraft cockpit/NASA Mission Control center and handles real-time satellite tracking, orbit propagation, close approach (conjunction) forecasting, and AI-powered evasive maneuver recommendation.

---

## Key Features

1. **Futuristic Cinematic Landing Page**: Immersive space-themed HUD overlayed on a real-time rotating 3D Earth and particle starfield backdrop, displaying live catalog counts and core capabilities cards.
2. **Interactive 3D Mission Control**: Full-screen control cockpit containing a React Three Fiber 3D Earth globe, showing operational satellites (green) and debris objects (yellow/red). Zoom, pan, and rotate.
3. **Orbit Path Spline Overlay**: Click a satellite or conjunction alert to dynamically calculate and project its glowing orbital path around the Earth.
4. **Collision Prediction Engine**: High-performance, offline-capable SGP4 coordinate propagation and proximity algorithm detecting close approaches (< 15 km) inside a 24-hour forecast corridor.
5. **AI Burn Recommendation Planner**: Expert system generating delta-v metrics, fuel cost calculations, and human-readable orbital maneuver explanations to reduce collision risks by 99%+.
6. **Maneuver Security clearance**: Interactive cryptographic key authorization panel to "commit" thruster burn scripts.
7. **Integrated Event Ticker Log**: Real-time scrolling telemetry feed and event logs showing network signals.

---

## Technical Architecture

### 1. Frontend Component (React / Next.js)
- **Framework**: Next.js 15 (App Router, Dark Mode by default)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Glassmorphic HUD controls, scanline overlays, neon accent colors)
- **3D Engine**: Three.js, React Three Fiber (R3F), `@react-three/drei` (Optimized using `InstancedMesh` for rendering hundreds of objects at 60fps)
- **Animation**: Framer Motion
- **State Store**: Zustand (Simulation clock, active overlay views, selections)

### 2. Backend Component (Python / FastAPI)
- **API Framework**: FastAPI & Uvicorn
- **Calculations**: `numpy`, `pandas`, `sgp4` (Pure-offline SGP4 orbital propagation library)
- **Orbits Provider**: `tle_provider.py` (Celestrak active satellites + debris fetcher with dynamic offline procedural generator fallback)
- **Conjunctions Engine**: `orbit_propagator.py` (Coarse altitude filter + fine 1-minute step search to find closest approaches)
- **AI Recommendation Engine**: `ai_engine.py` (Heuristic path-planning burn coordinator)

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Python (v3.10+ recommended)

---

### Step 1: Run the Backend Server
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows PowerShell**: `.\venv\Scripts\Activate.ps1`
   - **macOS/Linux**: `source venv/bin/activate`
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The server runs on `http://localhost:8000`. You can inspect the docs at `/docs`.*

---

### Step 2: Run the Next.js Frontend
1. Navigate to the root folder:
   ```bash
   cd ..
   ```
2. Install Node packages (Next.js template is configured with React 19; use peer deps flag for fiber):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## Configuration & Environment Variables

Create a `.env` or `.env.local` file to customize the APIs (defaults to Celestrack public data feeds):

```env
# Telemetry Sources
SATELLITE_DATA_API=https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle
SPACE_DEBRIS_API=https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle

# Credentials (AI Maneuver Engine)
AI_ENGINE_KEY=your-private-api-key
```
