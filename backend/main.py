import os
import math
import random
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from tle_provider import get_orbital_datasets
from orbit_propagator import SpaceObject, ConjunctionEngine
from ai_engine import generate_maneuver_recommendation

app = FastAPI(title="Orbital Guardian API", version="1.0.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory state
SATELLITES: list[SpaceObject] = []
DEBRIS: list[SpaceObject] = []
CONJUNCTIONS: list[dict] = []
CONJUNCTIONS_BY_ID: dict[str, dict] = {}
RECOMMENDATIONS: dict[str, dict] = {}

@app.on_event("startup")
def startup_event():
    global SATELLITES, DEBRIS, CONJUNCTIONS, CONJUNCTIONS_BY_ID
    print("Loading orbital data...")
    sat_tles, deb_tles = get_orbital_datasets()
    
    # Parse into objects
    SATELLITES = [SpaceObject(name, l1, l2, is_debris=False) for name, l1, l2 in sat_tles]
    DEBRIS = [SpaceObject(name, l1, l2, is_debris=True) for name, l1, l2 in deb_tles]
    
    print(f"Initialized {len(SATELLITES)} satellites and {len(DEBRIS)} debris objects.")
    
    # Run collision prediction for the next 24 hours
    engine = ConjunctionEngine(SATELLITES, DEBRIS)
    start_time = datetime.now(timezone.utc)
    print("Running conjunction analysis...")
    CONJUNCTIONS = engine.run_collision_prediction(start_time, forecast_hours=24.0)
    CONJUNCTIONS_BY_ID = {c["id"]: c for c in CONJUNCTIONS}
    print(f"Generated {len(CONJUNCTIONS)} conjunction alerts.")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/objects")
def get_objects(is_debris: bool | None = None):
    """Returns metadata for all monitored space objects."""
    all_objects = []
    
    objects_to_process = []
    if is_debris is None:
        objects_to_process = SATELLITES + DEBRIS
    elif is_debris:
        objects_to_process = DEBRIS
    else:
        objects_to_process = SATELLITES
        
    for obj in objects_to_process:
        # Standard orbital period formula: T = 2 * pi * sqrt(a^3 / mu) in minutes
        # mu = 398600.5
        t_sec = 2 * 3.14159265 * math.sqrt(obj.semi_major_axis**3 / 398600.5) if obj.semi_major_axis > 0 else 0
        period_min = round(t_sec / 60.0, 2)
        
        # Approximate velocity in circular orbit v = sqrt(mu / a) in km/s
        v = round(math.sqrt(398600.5 / obj.semi_major_axis), 2) if obj.semi_major_axis > 0 else 0.0
        
        all_objects.append({
            "norad_id": obj.norad_id,
            "name": obj.name,
            "is_debris": obj.is_debris,
            "inclination": round(obj.satrec.inclo * 180.0 / 3.14159265, 4), # Radians to Degrees
            "eccentricity": obj.satrec.ecco,
            "altitude_km": round(obj.mean_altitude, 2),
            "velocity_kms": v,
            "period_min": period_min,
            "status": "Inactive" if obj.is_debris else random.choice(["Active", "Standby", "Degraded"])
        })
        
    return all_objects


@app.get("/api/positions")
def get_positions(timestamp: str = Query(None, description="ISO timestamp for propagation (UTC)")):
    """Propagates all objects to the given timestamp and returns geodetic coordinates."""
    if not timestamp:
        dt = datetime.now(timezone.utc)
    else:
        try:
            # Handle trailing Z or offset
            if timestamp.endswith('Z'):
                timestamp = timestamp[:-1] + '+00:00'
            dt = datetime.fromisoformat(timestamp)
        except Exception:
            dt = datetime.now(timezone.utc)
            
    positions = []
    for obj in SATELLITES + DEBRIS:
        state = obj.propagate(dt)
        if state:
            r, _, geodetic = state
            lat, lon, alt = geodetic
            positions.append({
                "id": obj.norad_id,
                "name": obj.name,
                "is_debris": obj.is_debris,
                "lat": round(lat, 4),
                "lon": round(lon, 4),
                "alt": round(alt, 2),
                "r": [round(x, 2) for x in r]
            })
    return {
        "timestamp": dt.isoformat(),
        "positions": positions
    }

@app.get("/api/conjunctions")
def get_conjunctions():
    """Returns the list of active conjunction warnings."""
    return CONJUNCTIONS

@app.get("/api/recommendations/{conjunction_id}")
def get_recommendation(conjunction_id: str):
    """Retrieves or generates the AI avoidance maneuver recommendations."""
    if conjunction_id not in CONJUNCTIONS_BY_ID:
        raise HTTPException(status_code=404, detail="Conjunction alert not found")
        
    if conjunction_id not in RECOMMENDATIONS:
        conjunction = CONJUNCTIONS_BY_ID[conjunction_id]
        RECOMMENDATIONS[conjunction_id] = generate_maneuver_recommendation(conjunction)
        
    return RECOMMENDATIONS[conjunction_id]

@app.get("/api/analytics")
def get_analytics():
    """Returns aggregated orbital stats and warnings metrics."""
    critical_alerts = sum(1 for c in CONJUNCTIONS if c["risk_level"] == "Critical")
    high_alerts = sum(1 for c in CONJUNCTIONS if c["risk_level"] == "High")
    medium_alerts = sum(1 for c in CONJUNCTIONS if c["risk_level"] == "Medium")
    
    # Congestion metric LEO/MEO/GEO count
    leo = sum(1 for obj in SATELLITES + DEBRIS if obj.mean_altitude < 2000.0)
    meo = sum(1 for obj in SATELLITES + DEBRIS if 2000.0 <= obj.mean_altitude < 35000.0)
    geo = sum(1 for obj in SATELLITES + DEBRIS if obj.mean_altitude >= 35000.0)
    
    total_alerts = len(CONJUNCTIONS)
    congestion_level = "Green"
    if total_alerts > 40:
        congestion_level = "Critical"
    elif total_alerts > 20:
        congestion_level = "Warning"
        
    return {
        "active_satellites": len(SATELLITES),
        "debris_objects": len(DEBRIS),
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "medium_alerts": medium_alerts,
        "congestion_level": congestion_level,
        "orbit_counts": {
            "LEO": leo,
            "MEO": meo,
            "GEO": geo
        },
        "history": [
            {"day": "Mon", "alerts": max(0, total_alerts - 6)},
            {"day": "Tue", "alerts": max(0, total_alerts - 3)},
            {"day": "Wed", "alerts": max(0, total_alerts + 2)},
            {"day": "Thu", "alerts": max(0, total_alerts - 1)},
            {"day": "Fri", "alerts": max(0, total_alerts - 4)},
            {"day": "Sat", "alerts": max(0, total_alerts + 1)},
            {"day": "Sun", "alerts": total_alerts}
        ]
    }

