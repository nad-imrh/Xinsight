# app/routers/brands.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import re

from core.shared import MODELS_DIR, load_model

router = APIRouter(prefix="/api", tags=["brands"])

# ✅ DEFAULT FOLLOWERS DATA
DEFAULT_FOLLOWERS: Dict[str, int] = {
    "disney": 6115060,
    "netflix": 24812743,
}


@router.get("/brands")
async def list_brands():
    """
    List semua brand yang punya model (dilihat dari isi folder models/)
    ✅ Dengan followers count
    """
    brand_map: Dict[str, Dict[str, Any]] = {}

    for model_file in MODELS_DIR.glob("*.pkl"):
        name = model_file.name  # contoh: netflix_engagement_model.pkl
        m = re.match(r"(.+?)_(engagement|sentiment|topic|hashtags)_model\.pkl", name)
        if not m:
            continue
        brand_id, model_type = m.group(1), m.group(2)
        try:
            data = load_model(brand_id, model_type)
        except HTTPException:
            continue

        brand_entry = brand_map.setdefault(
            brand_id,
            {
                "brand_id": brand_id,
                "brand_name": data.get("brand_name", brand_id.title()),
                "followers": DEFAULT_FOLLOWERS.get(brand_id, 0),  # ✅ Tambah followers
                "models": set(),
            },
        )
        brand_entry["models"].add(model_type)

    brands = []
    for b in brand_map.values():
        # ✅ Get total tweets from engagement model
        total_tweets = 0
        try:
            eng_data = load_model(b["brand_id"], "engagement")
            total_tweets = eng_data.get("data", {}).get("total_tweets", 0)
        except:
            pass
        
        brands.append(
            {
                "brand_id": b["brand_id"],
                "brand_name": b["brand_name"],
                "followers": b["followers"],
                "total_tweets": total_tweets,
                "available_models": sorted(list(b["models"])),
            }
        )

    return {"success": True, "total_brands": len(brands), "brands": brands}


@router.get("/brands/{brand_id}")
async def get_brand_profile(brand_id: str):
    """
    Profil lengkap 1 brand:
    - engagement (dengan followers)
    - sentiment (dengan contoh tweets)
    - topics
    - hashtags
    """
    brand_id = brand_id.lower()
    brand_profile: Dict[str, Any] = {
        "brand_id": brand_id,
        "followers": DEFAULT_FOLLOWERS.get(brand_id, 0),  # ✅ Tambah followers
    }
    errors = {}

    # ✅ Load Engagement
    try:
        model = load_model(brand_id, "engagement")
        brand_profile.setdefault("brand_name", model.get("brand_name", brand_id.title()))
        engagement_data = model["data"]
        
        # Ensure followers ada
        if "followers" not in engagement_data:
            engagement_data["followers"] = DEFAULT_FOLLOWERS.get(brand_id, 0)
        
        brand_profile["engagement"] = engagement_data
    except HTTPException as e:
        errors["engagement"] = e.detail

    # ✅ Load Sentiment (dengan examples)
    try:
        model = load_model(brand_id, "sentiment")
        brand_profile.setdefault("brand_name", model.get("brand_name", brand_id.title()))
        sentiment_data = model["data"]
        
        # Include examples (minimal 2 per sentimen)
        brand_profile["sentiment"] = {
            "positive": sentiment_data.get("positive", 0),
            "neutral": sentiment_data.get("neutral", 0),
            "negative": sentiment_data.get("negative", 0),
            "positive_pct": sentiment_data.get("positive_pct", 0),
            "neutral_pct": sentiment_data.get("neutral_pct", 0),
            "negative_pct": sentiment_data.get("negative_pct", 0),
            "examples": {
                "positive": sentiment_data.get("positive_examples", [])[:2],
                "neutral": sentiment_data.get("neutral_examples", [])[:2],
                "negative": sentiment_data.get("negative_examples", [])[:2],
            }
        }
    except HTTPException as e:
        errors["sentiment"] = e.detail

    # ✅ Load Topics
    try:
        model = load_model(brand_id, "topics")
        brand_profile.setdefault("brand_name", model.get("brand_name", brand_id.title()))
        brand_profile["topics"] = model["data"]
    except HTTPException as e:
        errors["topics"] = e.detail

    # ✅ Load Hashtags
    try:
        model = load_model(brand_id, "hashtags")
        brand_profile.setdefault("brand_name", model.get("brand_name", brand_id.title()))
        brand_profile["hashtags"] = model.get("data", [])[:10]  # Top 10
    except HTTPException as e:
        errors["hashtags"] = e.detail

    if "brand_name" not in brand_profile:
        raise HTTPException(
            status_code=404,
            detail=f"Brand '{brand_id}' belum punya model apapun",
        )

    return {"success": True, "brand": brand_profile, "errors": errors or None}


# ✅ GET FOLLOWERS ENDPOINT
@router.get("/brands/{brand_id}/followers")
async def get_brand_followers(brand_id: str):
    """
    Ambil followers count untuk brand tertentu
    """
    brand_id = brand_id.lower()
    followers = DEFAULT_FOLLOWERS.get(brand_id, 0)
    
    if followers == 0:
        raise HTTPException(
            status_code=404,
            detail=f"Followers data for brand '{brand_id}' not found. Please add to DEFAULT_FOLLOWERS."
        )
    
    return {
        "success": True,
        "brand_id": brand_id,
        "followers": followers
    }


@router.get("/load-model/{brand_id}/{model_type}")
async def load_model_endpoint(brand_id: str, model_type: str):
    """
    Backward-compatible endpoint untuk load model mentah.
    model_type: 'engagement', 'sentiment', 'topics', 'hashtags'
    """
    brand_id = brand_id.lower()
    data = load_model(brand_id, model_type)
    
    # ✅ Inject followers jika model_type = engagement
    if model_type == "engagement" and "followers" not in data.get("data", {}):
        data["data"]["followers"] = DEFAULT_FOLLOWERS.get(brand_id, 0)
    
    return {
        "success": True,
        "brand_id": brand_id,
        "model_type": model_type,
        "data": data,
    }


@router.get("/list-models")
async def list_models():
    """
    List semua file model (.pkl) di folder models.
    """
    model_files = list(MODELS_DIR.glob("*.pkl"))
    models = []
    for model_file in model_files:
        file_size = model_file.stat().st_size
        models.append(
            {
                "filename": model_file.name,
                "path": str(model_file),
                "size_bytes": file_size,
                "size_kb": round(file_size / 1024, 2),
            }
        )

    return {"success": True, "total_models": len(models), "models": models}