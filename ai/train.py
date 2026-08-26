"""
Honey Chain — XGBoost Model Training Script
Trains health classification and regression models on synthetic hive data.

Outputs:
  - ai/models/health_classifier.pkl  (XGBClassifier for health_status)
  - ai/models/health_regressor.pkl   (XGBRegressor for health_score)
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, r2_score
from xgboost import XGBClassifier, XGBRegressor

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "hive_dataset.csv")
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")

FEATURES = ["temperature", "humidity", "weight", "bee_activity", "pressure", "hour_of_day", "season_code"]


def main():
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Load dataset
    print(f"📂 Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"   Rows: {len(df)} | Features: {FEATURES}")
    print(f"   Health status distribution:\n{df['health_status'].value_counts().sort_index().to_string()}\n")

    X = df[FEATURES]
    y_status = df["health_status"]
    y_score = df["health_score"]

    # Split
    X_train, X_test, y_status_train, y_status_test = train_test_split(X, y_status, test_size=0.2, random_state=42)
    _, _, y_score_train, y_score_test = train_test_split(X, y_score, test_size=0.2, random_state=42)

    # ── 1. Health Status Classifier ──────────────────────────────────────
    print("🧠 Training XGBClassifier (health_status)...")
    clf = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss",
        use_label_encoder=False,
    )
    clf.fit(X_train, y_status_train)

    y_pred_status = clf.predict(X_test)
    acc = accuracy_score(y_status_test, y_pred_status)
    print(f"   ✅ Accuracy: {acc:.4f}")
    print(f"   Classification Report:\n{classification_report(y_status_test, y_pred_status)}")

    clf_path = os.path.join(MODELS_DIR, "health_classifier.pkl")
    joblib.dump(clf, clf_path)
    print(f"   💾 Saved: {clf_path}\n")

    # ── 2. Health Score Regressor ────────────────────────────────────────
    print("🧠 Training XGBRegressor (health_score)...")
    reg = XGBRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    reg.fit(X_train, y_score_train)

    y_pred_score = reg.predict(X_test)
    mae = mean_absolute_error(y_score_test, y_pred_score)
    r2 = r2_score(y_score_test, y_pred_score)
    print(f"   ✅ MAE: {mae:.2f} | R²: {r2:.4f}")

    reg_path = os.path.join(MODELS_DIR, "health_regressor.pkl")
    joblib.dump(reg, reg_path)
    print(f"   💾 Saved: {reg_path}\n")

    # ── Feature Importance ───────────────────────────────────────────────
    print("📊 Feature Importance (Classifier):")
    importances = clf.feature_importances_
    for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: -x[1]):
        bar = "█" * int(imp * 40)
        print(f"   {feat:18s} {imp:.4f} {bar}")

    print("\n🎉 Training complete! Models saved to ai/models/")


if __name__ == "__main__":
    main()
