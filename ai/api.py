"""
Honey Chain AI Analytics & Disease Detection Microservice (SIH26021)
FastAPI Python Microservice for Hive Health, Colony Risk & Productivity Analytics

Uses trained XGBoost models for prediction, with rule-based fallback if models are unavailable.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import math
import os
import numpy as np
from datetime import datetime

app = FastAPI(
    title="Honey Chain AI Microservice",
    description="AI Analytics Engine for Smart Beekeeping Management & Colony Health Assessment",
    version="2.0.0"
)

# ─── Model Loading ───────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
_classifier = None
_regressor = None
_models_loaded = False

STATUS_LABELS = {0: "HEALTHY", 1: "STRESSED", 2: "AT_RISK", 3: "CRITICAL"}
RISK_FROM_STATUS = {"HEALTHY": "LOW", "STRESSED": "MEDIUM", "AT_RISK": "HIGH", "CRITICAL": "CRITICAL"}

def load_models():
    """Load trained XGBoost models from disk. Called once at startup."""
    global _classifier, _regressor, _models_loaded
    clf_path = os.path.join(MODELS_DIR, "health_classifier.pkl")
    reg_path = os.path.join(MODELS_DIR, "health_regressor.pkl")

    try:
        import joblib
        if os.path.exists(clf_path) and os.path.exists(reg_path):
            _classifier = joblib.load(clf_path)
            _regressor = joblib.load(reg_path)
            _models_loaded = True
            print(f"✅ ML Models loaded from {MODELS_DIR}")
        else:
            print(f"⚠️ Model files not found at {MODELS_DIR}. Using rule-based fallback.")
    except Exception as e:
        print(f"⚠️ Failed to load models: {e}. Using rule-based fallback.")


@app.on_event("startup")
async def startup_event():
    load_models()


# ─── Request Models ──────────────────────────────────────────────────────
class HiveTelemetry(BaseModel):
    hive_id: str
    temperature: float      # °C
    humidity: float          # %
    weight: float            # kg
    bee_activity: float      # 0.0 - 1.0
    pressure: Optional[float] = 1013.0  # hPa
    hour_of_day: Optional[int] = None   # 0-23
    season_code: Optional[int] = None   # 0=Winter, 1=Spring, 2=Summer, 3=Monsoon
    colony_type: Optional[str] = "Apis mellifera"

class ImageAnalysisRequest(BaseModel):
    image_name: str
    hive_id: Optional[str] = "HIVE-007"
    colony_type: Optional[str] = "Apis mellifera"


# ─── ML Prediction ──────────────────────────────────────────────────────
def predict_with_model(data: HiveTelemetry) -> dict:
    """Use trained XGBoost models for prediction."""
    hour = data.hour_of_day if data.hour_of_day is not None else datetime.now().hour
    season = data.season_code if data.season_code is not None else _guess_season()

    features = np.array([[
        data.temperature,
        data.humidity,
        data.weight,
        data.bee_activity,
        data.pressure or 1013.0,
        hour,
        season,
    ]])

    # Classifier: health status
    status_code = int(_classifier.predict(features)[0])
    status_label = STATUS_LABELS.get(status_code, "UNKNOWN")
    risk_level = RISK_FROM_STATUS.get(status_label, "MEDIUM")

    # Classifier confidence (probability of predicted class)
    probas = _classifier.predict_proba(features)[0]
    confidence = round(float(probas[status_code]), 2)

    # Regressor: health score
    health_score = int(max(5, min(99, round(float(_regressor.predict(features)[0])))))

    # Productivity estimation
    surplus = max(0.0, data.weight - 22.0)
    estimated_harvest = round(surplus * (0.7 + data.bee_activity * 0.25), 1)

    # Build detailed penalties/observations
    observations = []
    if data.temperature < 30.0:
        observations.append(f"Low internal temperature ({data.temperature}°C) indicates brood chilling hazard.")
    elif data.temperature > 37.0:
        observations.append(f"Elevated temperature ({data.temperature}°C) indicates overheating stress.")
    if data.humidity > 78.0:
        observations.append(f"Excess moisture ({data.humidity}%) increases fungal & chalkbrood risk.")
    elif data.humidity < 45.0:
        observations.append(f"Dry ambient humidity ({data.humidity}%).")
    if data.bee_activity < 0.50:
        observations.append(f"Suppressed foraging traffic ({int(data.bee_activity*100)}%).")
    if data.weight < 22.0:
        observations.append(f"Low hive weight ({data.weight}kg) — possible queenless or absconded colony.")

    # Recommendation
    if risk_level == "LOW":
        recommendation = "Maintain standard inspection schedule. Flow conditions favorable."
    elif risk_level == "MEDIUM":
        recommendation = "Schedule inspection within 3 days. Check hive ventilation and water access."
    elif risk_level == "HIGH":
        recommendation = "Immediate inspection recommended. Possible disease or environmental stress detected."
    else:
        recommendation = "URGENT: Colony in critical condition. Immediate intervention required."

    return {
        "health_score": health_score,
        "risk_level": risk_level,
        "health_status": status_label,
        "estimated_harvest_kg": estimated_harvest,
        "confidence_score": confidence,
        "harvest_window_days": 5 if estimated_harvest > 12 else 10,
        "observations": observations,
        "recommendation": recommendation,
        "model_type": "XGBoost (trained)",
    }


def predict_with_rules(data: HiveTelemetry) -> dict:
    """Fallback rule-based prediction when ML models are not available."""
    score = 100.0
    penalties = []

    if data.temperature < 32.0:
        p = min(30.0, (32.0 - data.temperature) * 10)
        score -= p
        penalties.append(f"Low internal temperature ({data.temperature}°C) indicates brood chilling hazard.")
    elif data.temperature > 36.0:
        p = min(30.0, (data.temperature - 36.0) * 12)
        score -= p
        penalties.append(f"Elevated temperature ({data.temperature}°C) indicates overheating stress.")

    if data.humidity > 75.0:
        score -= 15.0
        penalties.append(f"Excess moisture ({data.humidity}%) increases fungal & chalkbrood risk.")
    elif data.humidity < 50.0:
        score -= 10.0
        penalties.append(f"Dry ambient humidity ({data.humidity}%).")

    if data.bee_activity < 0.65:
        score -= 20.0
        penalties.append(f"Suppressed foraging traffic ({int(data.bee_activity*100)}%).")

    final_score = int(max(15, min(99, round(score))))

    if final_score >= 88:
        risk = "LOW"
    elif final_score >= 72:
        risk = "MEDIUM"
    elif final_score >= 50:
        risk = "HIGH"
    else:
        risk = "CRITICAL"

    surplus = max(0.0, data.weight - 22.0)
    prod_kg = round(surplus * (0.85 + data.bee_activity * 0.1), 1)

    return {
        "health_score": final_score,
        "risk_level": risk,
        "health_status": "HEALTHY" if risk == "LOW" else "STRESSED" if risk == "MEDIUM" else "AT_RISK" if risk == "HIGH" else "CRITICAL",
        "estimated_harvest_kg": prod_kg,
        "confidence_score": 0.65,
        "harvest_window_days": 5 if prod_kg > 12 else 10,
        "observations": penalties,
        "recommendation": "Maintain standard inspection schedule." if risk == "LOW" else "Check hive ventilation and water access.",
        "model_type": "Rule-based (fallback)",
    }


def _guess_season() -> int:
    """Guess Indian season from current month."""
    month = datetime.now().month
    if month in (12, 1, 2):
        return 0  # Winter
    elif month in (3, 4, 5):
        return 1  # Spring
    elif month in (6, 7, 8):
        return 2  # Summer / early monsoon
    else:
        return 3  # Monsoon / autumn


# ─── Routes ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "active",
        "service": "Honey Chain AI Analytics Service",
        "models_loaded": _models_loaded,
        "model_type": "XGBoost (trained)" if _models_loaded else "Rule-based (fallback)",
        "notice": "SIH26021 - Prototype AI predictive indicators (KVIC Honey Mission)"
    }


@app.post("/analyze/hive")
def analyze_hive(data: HiveTelemetry):
    if _models_loaded:
        result = predict_with_model(data)
    else:
        result = predict_with_rules(data)

    return {
        "hive_id": data.hive_id,
        "timestamp": datetime.now().isoformat(),
        **result,
    }


@app.post("/analyze/image")
def analyze_image(req: ImageAnalysisRequest):
    return {
        "image": req.image_name,
        "hive_id": req.hive_id,
        "colony_type": req.colony_type,
        "timestamp": datetime.now().isoformat(),
        "brood_pattern_uniformity": 93.2,
        "varroa_mite_detected": False,
        "queen_cup_detected": False,
        "visual_health_score": 92,
        "advisory": "Clean comb architecture detected. No visible foulbrood signs.",
        "model_type": "Simulated (visual ML out of prototype scope)",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
