import os
import random
import urllib.request
import urllib.error

# Hardcoded fallback satellites and debris to seed our procedural generator
FALLBACK_SATELLITES = [
    {"name": "ISS (ZARYA)", "norad_id": 25544, "inc": 51.64, "ecc": 0.0006, "mean_motion": 15.49},
    {"name": "STARLINK-1008", "norad_id": 44713, "inc": 53.05, "ecc": 0.0001, "mean_motion": 15.06},
    {"name": "STARLINK-1045", "norad_id": 44750, "inc": 53.06, "ecc": 0.0002, "mean_motion": 15.06},
    {"name": "STARLINK-3012", "norad_id": 55100, "inc": 53.21, "ecc": 0.0001, "mean_motion": 15.12},
    {"name": "STARLINK-5021", "norad_id": 58200, "inc": 43.01, "ecc": 0.0001, "mean_motion": 15.20},
    {"name": "HUBBLE SPACE TELESCOPE", "norad_id": 20580, "inc": 28.47, "ecc": 0.0003, "mean_motion": 15.08},
    {"name": "TIANGONG SPACE STATION", "norad_id": 48274, "inc": 41.47, "ecc": 0.0004, "mean_motion": 15.58},
    {"name": "GPS BIIF-1 (PRN 01)", "norad_id": 37753, "inc": 55.25, "ecc": 0.0051, "mean_motion": 2.01},
    {"name": "GPS BIIF-2 (PRN 25)", "norad_id": 38833, "inc": 55.31, "ecc": 0.0048, "mean_motion": 2.01},
    {"name": "NOAA 19", "norad_id": 33591, "inc": 98.71, "ecc": 0.0013, "mean_motion": 14.12},
    {"name": "METEOR M2", "norad_id": 40069, "inc": 98.81, "ecc": 0.0006, "mean_motion": 14.13},
    {"name": "ENVISAT", "norad_id": 27386, "inc": 98.54, "ecc": 0.0001, "mean_motion": 14.26},
    {"name": "AQUA", "norad_id": 27424, "inc": 98.21, "ecc": 0.0001, "mean_motion": 14.60},
    {"name": "TERRA", "norad_id": 25994, "inc": 98.22, "ecc": 0.0001, "mean_motion": 14.59},
    {"name": "LANDSAT 8", "norad_id": 39084, "inc": 98.20, "ecc": 0.0001, "mean_motion": 14.57},
]

FALLBACK_DEBRIS = [
    {"name": "FENGYUN 1C DEBRIS", "norad_id": 30544, "inc": 98.6, "ecc": 0.045, "mean_motion": 13.9},
    {"name": "COSMOS 2251 DEBRIS", "norad_id": 34100, "inc": 74.0, "ecc": 0.021, "mean_motion": 14.3},
    {"name": "IRIDIUM 33 DEBRIS", "norad_id": 35210, "inc": 86.4, "ecc": 0.015, "mean_motion": 14.2},
    {"name": "DELTA 1 R/B DEBRIS", "norad_id": 14120, "inc": 98.2, "ecc": 0.005, "mean_motion": 14.5},
    {"name": "CZ-4B DEBRIS", "norad_id": 25950, "inc": 98.5, "ecc": 0.012, "mean_motion": 14.1},
    {"name": "SL-8 R/B DEBRIS", "norad_id": 18201, "inc": 82.9, "ecc": 0.002, "mean_motion": 13.8},
    {"name": "ASAT DEBRIS (MICROSAT-R)", "norad_id": 44101, "inc": 97.2, "ecc": 0.010, "mean_motion": 15.6},
]

def calculate_tle_checksum(line: str) -> int:
    """Calculates the standard checksum for a TLE line."""
    total = 0
    for char in line[:68]:
        if char.isdigit():
            total += int(char)
        elif char == '-':
            total += 1
    return total % 10

def generate_valid_tle_lines(name: str, norad_id: int, inc: float, ecc: float, mean_motion: float) -> tuple[str, str, str]:
    """Generates syntactically correct Line 1 and Line 2 for TLE with checksums."""
    # Design formatting parameters
    designator = f"{random.randint(10, 26):02d}{random.randint(1, 99):03d}A"
    epoch_year = random.randint(24, 26)
    epoch_day = random.random() * 365.0
    
    # Line 1 formatting
    # 1 25544U 98067A   24177.58739505  .00016717  00000-0  30184-3 0  9997
    line1 = f"1 {norad_id:05d}U {designator:<8s} {epoch_year:02d}{epoch_day:012.8f}  .00000000  00000-0  00000-0 0  999"
    line1 += str(calculate_tle_checksum(line1))
    
    # Line 2 formatting
    # 2 25544  51.6418  24.7381 0006738 129.3512 309.8462 15.49508407459744
    ecc_str = f"{int(ecc * 10000000):07d}"
    raan = random.random() * 360.0
    arg_pe = random.random() * 360.0
    mean_anon = random.random() * 360.0
    rev_num = random.randint(1000, 99999)
    
    line2 = f"2 {norad_id:05d} {inc:8.4f} {raan:8.4f} {ecc_str} {arg_pe:8.4f} {mean_anon:8.4f} {mean_motion:11.8f}{rev_num:5d}"
    line2 += str(calculate_tle_checksum(line2))
    
    return name, line1, line2

def get_orbital_datasets() -> tuple[list[tuple[str, str, str]], list[tuple[str, str, str]]]:
    """
    Fetches active TLEs from Celestrak, falling back to procedural simulation if offline.
    Returns: (list of satellites TLEs, list of debris TLEs)
    """
    satellites = []
    debris = []
    
    celestrak_sat_url = os.environ.get("SATELLITE_DATA_API", "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle")
    celestrak_debris_url = os.environ.get("SPACE_DEBRIS_API", "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle")
    
    # Attempt to fetch satellites
    try:
        req = urllib.request.Request(
            celestrak_sat_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            lines = response.read().decode('utf-8').splitlines()
            # TLE has 3 lines per object (name, line 1, line 2)
            for i in range(0, len(lines) - 2, 3):
                if lines[i].strip():
                    satellites.append((lines[i].strip(), lines[i+1].strip(), lines[i+2].strip()))
    except Exception as e:
        print(f"Could not fetch live satellites from {celestrak_sat_url}: {e}. Generating offline catalog.")
        
    # Attempt to fetch debris
    try:
        req = urllib.request.Request(
            celestrak_debris_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            lines = response.read().decode('utf-8').splitlines()
            for i in range(0, len(lines) - 2, 3):
                if lines[i].strip():
                    debris.append((lines[i].strip(), lines[i+1].strip(), lines[i+2].strip()))
    except Exception as e:
        print(f"Could not fetch live debris from {celestrak_debris_url}: {e}. Generating offline catalog.")

    # Populate satellites procedurally if empty or short
    if len(satellites) < 15:
        # Generate at least 80 active satellites to make mission control look busy and premium
        existing_ids = {sat[1].split()[1] for sat in satellites if len(sat[1].split()) > 1}
        for sat_info in FALLBACK_SATELLITES:
            if str(sat_info["norad_id"]) not in existing_ids:
                satellites.append(generate_valid_tle_lines(
                    sat_info["name"], sat_info["norad_id"], sat_info["inc"], sat_info["ecc"], sat_info["mean_motion"]
                ))
        
        # Populate more random starlink-like and science satellites
        start_id = 60000
        for i in range(100):
            sat_name = f"STARLINK-{(3000 + i)}" if i % 2 == 0 else f"OPSAT-{(100 + i)}"
            satellites.append(generate_valid_tle_lines(
                sat_name, start_id + i, random.choice([53.0, 97.8, 28.5, 41.5]), random.uniform(0.0001, 0.001), random.uniform(15.0, 15.6)
            ))
            
    # Populate debris procedurally if empty or short
    if len(debris) < 15:
        # Generate 150+ debris objects to populate the space visualizer
        existing_ids = {deb[1].split()[1] for deb in debris if len(deb[1].split()) > 1}
        for deb_info in FALLBACK_DEBRIS:
            if str(deb_info["norad_id"]) not in existing_ids:
                debris.append(generate_valid_tle_lines(
                    deb_info["name"], deb_info["norad_id"], deb_info["inc"], deb_info["ecc"], deb_info["mean_motion"]
                ))
                
        # Generate a large debris cloud around LEO
        start_id = 70000
        for i in range(200):
            deb_name = f"DEBRIS [NORAD #{start_id + i}]"
            debris.append(generate_valid_tle_lines(
                deb_name, start_id + i, random.uniform(20.0, 110.0), random.uniform(0.001, 0.08), random.uniform(13.5, 15.8)
            ))
            
    return satellites, debris
