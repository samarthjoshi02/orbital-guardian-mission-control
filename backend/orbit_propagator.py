import math
import numpy as np
from datetime import datetime, timedelta, timezone
from sgp4.api import Satrec, jday

# Earth parameters (WGS-84)
EARTH_RADIUS_KM = 6378.137

def gmst_rad(jd: float) -> float:
    """Computes Greenwich Mean Sidereal Time (GMST) in radians for a Julian Date."""
    t = (jd - 2451545.0) / 36525.0
    # IAU 1982 formula for GMST
    theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t**2 - t**3 / 38710000.0
    return math.radians(theta % 360.0)

def teme_to_geodetic(r_teme: list[float], jd: float) -> tuple[float, float, float]:
    """
    Converts TEME position vector (km) to Latitude, Longitude (degrees), and Altitude (km).
    """
    x, y, z = r_teme
    theta = gmst_rad(jd)
    
    # Rotate by -theta around Z-axis to go from TEME (inertial) to ECEF (rotational)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    x_ecef = x * cos_t + y * sin_t
    y_ecef = -x * sin_t + y * cos_t
    z_ecef = z
    
    # Calculate Lat, Lon, Alt
    r_xy = math.sqrt(x_ecef**2 + y_ecef**2)
    lon = math.atan2(y_ecef, x_ecef)
    lat = math.atan2(z_ecef, r_xy)
    alt = math.sqrt(x_ecef**2 + y_ecef**2 + z_ecef**2) - EARTH_RADIUS_KM
    
    return math.degrees(lat), math.degrees(lon), alt

class SpaceObject:
    def __init__(self, name: str, line1: str, line2: str, is_debris: bool = False):
        self.name = name
        self.line1 = line1
        self.line2 = line2
        self.is_debris = is_debris
        self.satrec = Satrec.twoline2rv(line1, line2)
        self.norad_id = self.satrec.satnum
        
        # Calculate semi-major axis proxy from mean motion
        # mean motion is revs per day. Convert to rad/sec
        n_rad_s = (self.satrec.no_kozai / 60.0)  # rad per minute
        # Semi-major axis a = (mu / n^2)^(1/3)
        mu = 398600.5  # Earth gravitational constant km^3/s^2
        n_rad_s_sec = n_rad_s / 60.0
        self.semi_major_axis = (mu / (n_rad_s_sec**2))**(1/3) if n_rad_s_sec > 0 else EARTH_RADIUS_KM + 500.0
        self.mean_altitude = self.semi_major_axis - EARTH_RADIUS_KM

    def propagate(self, dt: datetime) -> tuple[list[float], list[float], tuple[float, float, float]] | None:
        """
        Propagates object to given datetime.
        Returns: (position vector km, velocity vector km/s, (lat, lon, alt))
        """
        # Convert datetime to Julian Date parts
        dt_utc = dt.astimezone(timezone.utc)
        jd, fr = jday(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, dt_utc.second + dt_utc.microsecond / 1e6)
        
        e, r, v = self.satrec.sgp4(jd, fr)
        if e != 0:
            return None  # Propagation error
            
        lat, lon, alt = teme_to_geodetic(r, jd + fr)
        return list(r), list(v), (lat, lon, alt)

class ConjunctionEngine:
    def __init__(self, satellites: list[SpaceObject], debris: list[SpaceObject]):
        self.satellites = satellites
        self.debris = debris

    def run_collision_prediction(self, start_time: datetime, forecast_hours: float = 24.0) -> list[dict]:
        """
        Runs conjunction analysis for satellites vs debris.
        Uses coarse altitude filter to optimize check, then propagates at fine steps.
        """
        alerts = []
        forecast_steps = int(forecast_hours * 4)  # 15-minute steps
        
        # Group debris by altitude buckets (50km) to optimize search
        debris_by_bucket = {}
        for d in self.debris:
            bucket = int(d.mean_altitude / 50)
            debris_by_bucket.setdefault(bucket, []).append(d)
            # Add to adjacent buckets to cover boundaries
            debris_by_bucket.setdefault(bucket - 1, []).append(d)
            debris_by_bucket.setdefault(bucket + 1, []).append(d)
            
        # Analyze each satellite
        conjunction_counter = 1
        for sat in self.satellites:
            bucket = int(sat.mean_altitude / 50)
            candidates = debris_by_bucket.get(bucket, [])
            if not candidates:
                continue
                
            # Perform coarse propagation check
            for deb in candidates:
                min_dist = float('inf')
                closest_time = None
                
                # Check every 30 minutes first
                for step in range(0, forecast_steps, 2):
                    check_time = start_time + timedelta(minutes=step * 15)
                    
                    sat_state = sat.propagate(check_time)
                    deb_state = deb.propagate(check_time)
                    
                    if not sat_state or not deb_state:
                        continue
                        
                    r_sat, _, _ = sat_state
                    r_deb, _, _ = deb_state
                    
                    dist = math.sqrt(sum((a - b)**2 for a, b in zip(r_sat, r_deb)))
                    if dist < min_dist:
                        min_dist = dist
                        closest_time = check_time
                        
                # If coarse check is close (< 100km), run a fine search around that time
                if min_dist < 100.0 and closest_time:
                    fine_min_dist = min_dist
                    fine_closest_time = closest_time
                    
                    # Search +/- 15 minutes at 1-minute steps
                    for offset in range(-15, 16):
                        check_time = fine_closest_time + timedelta(minutes=offset)
                        sat_state = sat.propagate(check_time)
                        deb_state = deb.propagate(check_time)
                        
                        if not sat_state or not deb_state:
                            continue
                            
                        r_sat, v_sat, _ = sat_state
                        r_deb, v_deb, _ = deb_state
                        
                        dist = math.sqrt(sum((a - b)**2 for a, b in zip(r_sat, r_deb)))
                        if dist < fine_min_dist:
                            fine_min_dist = dist
                            fine_closest_time = check_time
                            
                    # If fine approach is under 15km, record as conjunction alert
                    if fine_min_dist < 15.0:
                        # Estimate collision probability using simple spatial function
                        # P = e^(-d^2 / 2s^2) where s is uncertainty (e.g. 2.0km)
                        s = 2.0
                        prob = math.exp(-(fine_min_dist**2) / (2 * (s**2)))
                        
                        # Categorize risk levels
                        if fine_min_dist < 1.5:
                            risk = "Critical"
                            severity = 0.95 + (0.05 * (1.5 - fine_min_dist) / 1.5)
                        elif fine_min_dist < 4.0:
                            risk = "High"
                            severity = 0.70 + 0.25 * (4.0 - fine_min_dist) / 2.5
                        elif fine_min_dist < 8.0:
                            risk = "Medium"
                            severity = 0.40 + 0.30 * (8.0 - fine_min_dist) / 4.0
                        else:
                            risk = "Low"
                            severity = 0.10 + 0.30 * (15.0 - fine_min_dist) / 7.0

                        # Calculate relative velocity
                        sat_state = sat.propagate(fine_closest_time)
                        deb_state = deb.propagate(fine_closest_time)
                        _, v_sat, pos_sat = sat_state
                        _, v_deb, pos_deb = deb_state
                        
                        v_rel = math.sqrt(sum((a - b)**2 for a, b in zip(v_sat, v_deb)))
                        
                        alerts.append({
                            "id": f"CONJ-{conjunction_counter:04d}",
                            "satellite_id": sat.norad_id,
                            "satellite_name": sat.name,
                            "debris_id": deb.norad_id,
                            "debris_name": deb.name,
                            "closest_approach_time": fine_closest_time.isoformat(),
                            "distance_km": round(fine_min_dist, 3),
                            "probability": round(prob, 5),
                            "risk_level": risk,
                            "severity_score": round(severity, 2),
                            "relative_velocity_kms": round(v_rel, 2),
                            "lat": round(pos_sat[0], 4),
                            "lon": round(pos_sat[1], 4),
                            "alt": round(pos_sat[2], 2)
                        })
                        conjunction_counter += 1
                        
        # Sort by closest time
        alerts.sort(key=lambda x: x["closest_approach_time"])
        return alerts
