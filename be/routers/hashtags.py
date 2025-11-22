# app/routers/hashtags.py
from fastapi import APIRouter, HTTPException
from core.shared import load_model

router = APIRouter(prefix="/api", tags=["hashtags"])


# ============================================================
# GET: Ambil semua hashtag hasil analisis
# ============================================================

@router.get("/brands/{brand_id}/hashtags")
async def get_hashtag_stats(brand_id: str):
    """
    Mengambil hasil analisis hashtag setelah upload CSV.
    """
    try:
        data = load_model(brand_id, "hashtags")

        hashtags = data.get("data", [])

        return {
            "brand_id": brand_id,
            "total_hashtags": len(hashtags),
            "hashtags": hashtags,
            "meta": data.get("meta", {})
        }

    except Exception:
        raise HTTPException(status_code=404, detail="Hashtag data not found")


# ============================================================
# GET: Ambil hashtag trending (top 10)
# ============================================================

@router.get("/brands/{brand_id}/hashtags/trending")
async def trending_hashtags(brand_id: str):
    """
    Mengambil 10 hashtag teratas berdasarkan jumlah tweet.
    """
    try:
        data = load_model(brand_id, "hashtags")
        hashtags = data.get("data", [])

        # Sort list by count (DESC)
        sorted_list = sorted(hashtags, key=lambda x: x["count"], reverse=True)

        return {
            "brand_id": brand_id,
            "trending": sorted_list[:10]
        }

    except Exception:
        raise HTTPException(status_code=404, detail="Trending hashtag not found")


# ============================================================
# MODELING: Hashtag Analyzer
# Dipanggil saat upload CSV
# ============================================================

def compute_hashtag_analysis(brand_id: str, brand_name: str, tweets):
    """
    Menghitung statistik hashtag dari semua tweet yang di-upload.

    Format output konsisten:
    {
        "data": [ { "hashtag": "#xxx", "count": 5, ... }, ... ],
        "meta": {...}
    }
    """
    import re
    from collections import defaultdict

    hashtag_stats = defaultdict(lambda: {
        "count": 0,
        "total_engagement": 0,
        "avg_engagement": 0
    })

    for t in tweets:
        text = t.full_text
        engagement = (
            t.favorite_count
            + t.retweet_count
            + t.reply_count
            + t.quote_count
        )

        hashtags = re.findall(r"#\w+", text)

        for tag in hashtags:
            stat = hashtag_stats[tag]
            stat["count"] += 1
            stat["total_engagement"] += engagement

    # Hitung rata-rata engagement
    for tag, stat in hashtag_stats.items():
        if stat["count"] > 0:
            stat["avg_engagement"] = stat["total_engagement"] / stat["count"]

    # Ubah dict menjadi LIST
    hashtag_list = [
        {
            "hashtag": tag,
            "count": stat["count"],
            "total_engagement": stat["total_engagement"],
            "avg_engagement": stat["avg_engagement"]
        }
        for tag, stat in hashtag_stats.items()
    ]

    # ✅ Tambahan sesuai permintaan (sort by count DESC)
    hashtag_list = sorted(hashtag_list, key=lambda x: x["count"], reverse=True)

    return {
        "data": hashtag_list,
        "meta": {
            "brand_id": brand_id,
            "brand_name": brand_name,
            "unique_hashtags": len(hashtag_list),
        }
    }
