# app/routers/brands.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import re

from be.core.shared import MODELS_DIR, load_model

router = APIRouter(prefix="/api", tags=["brands"])


@router.get("/brands")
async def list_brands():
    """
    List semua brand yang punya model (dilihat dari isi folder models/)
    """
    brand_map: Dict[str, Dict[str, Any]] = {}

    for model_file in MODELS_DIR.glob("*.pkl"):
        name = model_file.name  # contoh: netflix_engagement_model.pkl
        m = re.match(r"(.+?)_(engagement|sentiment|topic)_model\.pkl", name)
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
                "models": set(),
            },
        )
        brand_entry["models"].add(model_type)

    brands = []
    for b in brand_map.values():
        brands.append(
            {
                "brand_id": b["brand_id"],
                "brand_name": b["brand_name"],
                "available_models": sorted(list(b["models"])),
            }
        )

    return {"success": True, "total_brands": len(brands), "brands": brands}


@router.get("/brands/{brand_id}")
async def get_brand_profile(brand_id: str):
    """
    Profil lengkap 1 brand:
    - engagement
    - sentiment
    - topics
    """
    brand_profile: Dict[str, Any] = {"brand_id": brand_id}
    errors = {}

    for model_type in ["engagement", "sentiment", "topic"]:
        try:
            model = load_model(brand_id, model_type)
            brand_profile.setdefault(
                "brand_name", model.get("brand_name", brand_id.title())
            )
            brand_profile[model_type] = model["data"]
        except HTTPException as e:
            errors[model_type] = e.detail

    if "brand_name" not in brand_profile:
        raise HTTPException(
            status_code=404,
            detail=f"Brand '{brand_id}' belum punya model apapun",
        )

    return {"success": True, "brand": brand_profile, "errors": errors or None}


@router.get("/load-model/{brand_id}/{model_type}")
async def load_model_endpoint(brand_id: str, model_type: str):
    """
    Backward-compatible endpoint untuk load model mentah.
    model_type: 'engagement', 'sentiment', 'topic'
    """
    data = load_model(brand_id, model_type)
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
