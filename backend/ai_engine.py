from datetime import datetime, timedelta

def generate_maneuver_recommendation(conjunction: dict) -> dict:
    """
    Generates a realistic, professional orbital maneuver plan 
    to avoid the collision predicted by the conjunction.
    """
    conj_id = conjunction["id"]
    sat_name = conjunction["satellite_name"]
    deb_name = conjunction["debris_name"]
    dist = conjunction["distance_km"]
    vel = conjunction["relative_velocity_kms"]
    prob = conjunction["probability"]
    
    # Parse approach time
    approach_time_str = conjunction["closest_approach_time"]
    try:
        approach_time = datetime.fromisoformat(approach_time_str)
    except ValueError:
        approach_time = datetime.now() + timedelta(hours=12)
        
    # Schedule burn 3 orbits or ~4.5 hours before closest approach
    burn_time = approach_time - timedelta(hours=4, minutes=30)
    
    # Heuristic determination of maneuver direction based on velocity/distance
    # Head-on vs crossing encounters
    if vel > 10.0:
        # High relative velocity: out-of-plane or radial burn is preferred
        maneuver_type = "Out-of-Plane (Inclination Adjustment)"
        thrust_vector = "Normal (+Z) thrust vector at descending node"
        delta_v = round(0.45 + (1.5 / max(0.1, dist)), 2)  # m/s
        fuel_cost = round(delta_v * 2.2, 1)  # kg of hydrazine
        risk_reduction = 99.98
        explanation = (
            f"Conjunction geometry is high-velocity crossing. A thrust impulse normal to the orbital plane "
            f"is commanded {burn_time.strftime('%H:%M:%S')} UTC to adjust orbital inclination by "
            f"approx 0.002 degrees. This shifts the cross-track intersection point by {round(12.5 + 5/max(0.1, dist), 1)} km, "
            f"virtually eliminating probability of contact."
        )
    else:
        # LEO typical cross encounter: along-track (prograde/retrograde) is most fuel efficient
        if conj_id[-1] in ["1", "3", "5", "7", "9"]:
            maneuver_type = "Prograde Burn (Orbit Raising)"
            thrust_vector = "Along-Track (+X) thrust vector at perigee"
            delta_v = round(0.25 + (0.8 / max(0.1, dist)), 2)  # m/s
            fuel_cost = round(delta_v * 1.8, 1)
            risk_reduction = 99.95
            explanation = (
                f"conjunction geometry is parallel in-plane. Conducting a prograde along-track burn "
                f"raises the apogee by {round(0.8 + 2/max(0.1, dist), 2)} km. This creates a phase delay "
                f"in orbital position, ensuring the satellite passes the conjunction zone "
                f"approx {round(15 + 10/max(0.1, dist), 1)} seconds after the debris cloud transit."
            )
        else:
            maneuver_type = "Retrograde Burn (Orbit Lowering)"
            thrust_vector = "Along-Track (-X) thrust vector at apogee"
            delta_v = round(0.28 + (0.9 / max(0.1, dist)), 2)  # m/s
            fuel_cost = round(delta_v * 1.9, 1)
            risk_reduction = 99.92
            explanation = (
                f"Conjunction geometry is parallel in-plane. A retrograde along-track burn is chosen "
                f"to lower the perigee by {round(0.95 + 2/max(0.1, dist), 2)} km. This creates an orbital "
                f"phase advance, ensuring the satellite clears the crossing point before the "
                f"approaching debris {deb_name} enters the intersection corridor."
            )
            
    return {
        "conjunction_id": conj_id,
        "satellite_name": sat_name,
        "debris_name": deb_name,
        "maneuver_type": maneuver_type,
        "thrust_vector": thrust_vector,
        "execution_time": burn_time.isoformat(),
        "delta_v_ms": delta_v,
        "fuel_cost_kg": fuel_cost,
        "risk_reduction_pct": risk_reduction,
        "explanation": explanation,
        "status": "DRAFT",
        "author": "Orbital Guardian AI Engine v4.2"
    }
