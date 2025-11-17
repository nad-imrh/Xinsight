# app/core/shared.py
from pydantic import BaseModel
from typing import Dict, Any, Optional
from pathlib import Path
from fastapi import HTTPException
import pickle
import re

class TweetData(BaseModel):
    id_str: str
    full_text: str
    created_at: str
    username: str
    favorite_count: int = 0
    retweet_count: int = 0
    reply_count: Optional[int] = 0
    quote_count: Optional[int] = 0

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)


def slugify_brand(brand_name: str) -> str:
    """Convert human brand name -> safe id for filenames & URLs"""
    brand = brand_name.strip().lower()
    brand = re.sub(r'[\s\-]+', "_", brand)
    brand = re.sub(r'[^a-z0-9_]', "", brand)
    return brand


def extract_brand_from_filename(filename: str) -> Dict[str, str]:
    """
    Ambil brand dari nama file:
    disney.csv -> name: "Disney", id: "disney"
    netflix_tweets.csv -> name: "Netflix Tweets", id: "netflix_tweets"
    """
    stem = Path(filename).stem
    human_name = re.sub(r'[_\-]+', ' ', stem).strip().title()
    brand_id = slugify_brand(human_name)
    return {"brand_name": human_name, "brand_id": brand_id}


def save_model(brand_id: str, model_type: str, data: Dict[str, Any]) -> Path:
    """
    Simpan model ke .pkl
    model_type: "engagement", "sentiment", "topic"
    """
    model_path = MODELS_DIR / f"{brand_id}_{model_type}_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(data, f)
    return model_path


def load_model(brand_id: str, model_type: str) -> Dict[str, Any]:
    model_path = MODELS_DIR / f"{brand_id}_{model_type}_model.pkl"
    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Model {model_type} untuk brand '{brand_id}' tidak ditemukan"
        )
    with open(model_path, "rb") as f:
        return pickle.load(f)