from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
import joblib
import pandas as pd
import os

# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(
    title="Rental Price Predictor API",
    description="Predict optimized rental prices using a trained ML model",
    version="1.0.0"
)

# -----------------------------
# CORS middleware
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------
# Load model safely
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "optimized_price_model.joblib")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = joblib.load(MODEL_PATH)

# -----------------------------
# Request schema (Pydantic v2)
# -----------------------------
class RentalInput(BaseModel):
    nb_of_guests: int
    nb_of_bedrooms: float
    nb_of_beds: int
    nb_of_bathrooms: float
    country: str
    city: str
    type: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "nb_of_guests": 4,
                "nb_of_bedrooms": 2,
                "nb_of_beds": 3,
                "nb_of_bathrooms": 1.5,
                "country": "France",
                "city": "Paris",
                "type": "Apartment"
            }
        }
    )

# -----------------------------
# Health check
# -----------------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": True}

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict_price(data: RentalInput):
    df_input = pd.DataFrame([data.model_dump()])
    prediction = float(model.predict(df_input)[0])

    return {
        "suggested_price": round(prediction, 2),
        "yield_optimized_15": round(prediction * 1.15, 2)
    }
