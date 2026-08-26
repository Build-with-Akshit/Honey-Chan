"""
Honey Chain — Synthetic Hive Dataset Generator
Generates realistic beehive sensor data for training ML models.

Features: temperature, humidity, weight, bee_activity, pressure, hour_of_day, season_code
Labels:   health_status (0-3), health_score (0-100), disease_risk (0.0-1.0), estimated_harvest_kg
"""

import csv
import random
import math
import os

random.seed(42)

SEASONS = {0: "Winter", 1: "Spring", 2: "Summer", 3: "Monsoon"}

# Realistic baseline ranges per season
SEASON_PROFILES = {
    0: {"temp_base": 30.0, "hum_base": 55.0, "activity_base": 0.55, "weight_base": 28.0},  # Winter
    1: {"temp_base": 33.5, "hum_base": 60.0, "activity_base": 0.82, "weight_base": 35.0},  # Spring (peak flow)
    2: {"temp_base": 35.5, "hum_base": 70.0, "activity_base": 0.75, "weight_base": 32.0},  # Summer
    3: {"temp_base": 34.0, "hum_base": 80.0, "activity_base": 0.60, "weight_base": 30.0},  # Monsoon
}

# Health status mapping
# 0 = HEALTHY, 1 = STRESSED, 2 = AT_RISK, 3 = CRITICAL
STATUS_LABELS = {0: "HEALTHY", 1: "STRESSED", 2: "AT_RISK", 3: "CRITICAL"}


def generate_row(row_id: int) -> dict:
    season = random.choice([0, 1, 2, 3])
    profile = SEASON_PROFILES[season]
    hour = random.randint(0, 23)

    # Circadian temperature adjustment
    hour_factor = math.sin((hour - 6) * math.pi / 12) * 1.5  # peaks at noon

    # Base sensor values with noise
    temperature = round(profile["temp_base"] + hour_factor + random.gauss(0, 0.8), 1)
    humidity = round(profile["hum_base"] + random.gauss(0, 3.0), 1)
    weight = round(profile["weight_base"] + random.gauss(0, 2.5), 1)
    bee_activity = round(max(0.05, min(0.99, profile["activity_base"] + random.gauss(0, 0.08))), 2)
    pressure = round(1013.0 + random.gauss(0, 5.0), 1)

    # Clamp humidity
    humidity = max(30.0, min(95.0, humidity))
    weight = max(15.0, weight)

    # --- Determine health based on realistic domain rules ---
    penalty = 0.0

    # Temperature stress
    if temperature < 30.0:
        penalty += (30.0 - temperature) * 3.0
    elif temperature > 37.0:
        penalty += (temperature - 37.0) * 4.0

    # Humidity stress
    if humidity > 78.0:
        penalty += (humidity - 78.0) * 1.5
    elif humidity < 45.0:
        penalty += (45.0 - humidity) * 1.0

    # Low activity
    if bee_activity < 0.50:
        penalty += (0.50 - bee_activity) * 40.0

    # Underweight hive (possible queenless or absconded)
    if weight < 22.0:
        penalty += (22.0 - weight) * 2.0

    # Add some random noise to penalty (real world is noisy)
    penalty += random.gauss(0, 3.0)
    penalty = max(0.0, penalty)

    health_score = int(max(5, min(99, round(100.0 - penalty))))

    # Health status from score
    if health_score >= 85:
        health_status = 0  # HEALTHY
    elif health_score >= 68:
        health_status = 1  # STRESSED
    elif health_score >= 45:
        health_status = 2  # AT_RISK
    else:
        health_status = 3  # CRITICAL

    # Disease risk correlates inversely with health
    disease_risk = round(max(0.0, min(1.0, (100 - health_score) / 100.0 + random.gauss(0, 0.05))), 2)

    # Estimated harvest: depends on weight surplus over base tare (~22kg) and activity
    surplus = max(0.0, weight - 22.0)
    estimated_harvest_kg = round(surplus * (0.7 + bee_activity * 0.25) + random.gauss(0, 0.5), 1)
    estimated_harvest_kg = max(0.0, estimated_harvest_kg)

    return {
        "id": row_id,
        "temperature": temperature,
        "humidity": humidity,
        "weight": weight,
        "bee_activity": bee_activity,
        "pressure": pressure,
        "hour_of_day": hour,
        "season_code": season,
        "health_score": health_score,
        "health_status": health_status,
        "disease_risk": disease_risk,
        "estimated_harvest_kg": estimated_harvest_kg,
    }


def inject_anomalies(rows: list) -> list:
    """Inject ~10% anomalous/extreme rows to ensure model learns edge cases."""
    anomaly_count = len(rows) // 10

    for _ in range(anomaly_count):
        anomaly_type = random.choice(["overheat", "freezing", "humid_fungal", "colony_collapse", "superflow"])
        season = random.choice([0, 1, 2, 3])
        hour = random.randint(0, 23)
        row_id = len(rows) + 1

        if anomaly_type == "overheat":
            row = {
                "id": row_id, "temperature": round(random.uniform(38.0, 42.0), 1),
                "humidity": round(random.uniform(60.0, 85.0), 1), "weight": round(random.uniform(25.0, 40.0), 1),
                "bee_activity": round(random.uniform(0.20, 0.50), 2), "pressure": round(random.uniform(1005, 1020), 1),
                "hour_of_day": hour, "season_code": 2,
                "health_score": random.randint(15, 40), "health_status": 3,
                "disease_risk": round(random.uniform(0.65, 0.95), 2),
                "estimated_harvest_kg": round(random.uniform(0.0, 5.0), 1),
            }
        elif anomaly_type == "freezing":
            row = {
                "id": row_id, "temperature": round(random.uniform(20.0, 28.0), 1),
                "humidity": round(random.uniform(35.0, 55.0), 1), "weight": round(random.uniform(20.0, 30.0), 1),
                "bee_activity": round(random.uniform(0.10, 0.35), 2), "pressure": round(random.uniform(1005, 1020), 1),
                "hour_of_day": hour, "season_code": 0,
                "health_score": random.randint(20, 50), "health_status": 2,
                "disease_risk": round(random.uniform(0.50, 0.80), 2),
                "estimated_harvest_kg": round(random.uniform(0.0, 3.0), 1),
            }
        elif anomaly_type == "humid_fungal":
            row = {
                "id": row_id, "temperature": round(random.uniform(33.0, 36.0), 1),
                "humidity": round(random.uniform(82.0, 95.0), 1), "weight": round(random.uniform(28.0, 38.0), 1),
                "bee_activity": round(random.uniform(0.40, 0.65), 2), "pressure": round(random.uniform(1000, 1015), 1),
                "hour_of_day": hour, "season_code": 3,
                "health_score": random.randint(30, 60), "health_status": 2,
                "disease_risk": round(random.uniform(0.55, 0.85), 2),
                "estimated_harvest_kg": round(random.uniform(2.0, 8.0), 1),
            }
        elif anomaly_type == "colony_collapse":
            row = {
                "id": row_id, "temperature": round(random.uniform(28.0, 33.0), 1),
                "humidity": round(random.uniform(50.0, 70.0), 1), "weight": round(random.uniform(15.0, 22.0), 1),
                "bee_activity": round(random.uniform(0.05, 0.20), 2), "pressure": round(random.uniform(1005, 1020), 1),
                "hour_of_day": hour, "season_code": season,
                "health_score": random.randint(5, 25), "health_status": 3,
                "disease_risk": round(random.uniform(0.80, 0.98), 2),
                "estimated_harvest_kg": 0.0,
            }
        else:  # superflow — very healthy productive hive
            row = {
                "id": row_id, "temperature": round(random.uniform(33.5, 35.5), 1),
                "humidity": round(random.uniform(55.0, 68.0), 1), "weight": round(random.uniform(42.0, 55.0), 1),
                "bee_activity": round(random.uniform(0.88, 0.99), 2), "pressure": round(random.uniform(1010, 1018), 1),
                "hour_of_day": hour, "season_code": 1,
                "health_score": random.randint(90, 99), "health_status": 0,
                "disease_risk": round(random.uniform(0.01, 0.10), 2),
                "estimated_harvest_kg": round(random.uniform(15.0, 28.0), 1),
            }

        rows.append(row)

    return rows


def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "hive_dataset.csv")

    rows = [generate_row(i + 1) for i in range(1500)]
    rows = inject_anomalies(rows)
    random.shuffle(rows)

    # Re-index
    for i, row in enumerate(rows):
        row["id"] = i + 1

    fieldnames = [
        "id", "temperature", "humidity", "weight", "bee_activity",
        "pressure", "hour_of_day", "season_code",
        "health_score", "health_status", "disease_risk", "estimated_harvest_kg",
    ]

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Generated {len(rows)} rows → {output_path}")

    # Quick stats
    status_counts = {}
    for r in rows:
        s = STATUS_LABELS[r["health_status"]]
        status_counts[s] = status_counts.get(s, 0) + 1
    print(f"📊 Distribution: {status_counts}")


if __name__ == "__main__":
    main()
