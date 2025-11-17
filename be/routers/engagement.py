# app/routers/engagement.py
from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
import re

from be.core.shared import TweetData, MODELS_DIR, load_model

router = APIRouter(prefix="/api/brands", tags=["engagement"])


def compute_engagement_analytics(brand_id: str, brand_name: str, tweets: List[TweetData]) -> Dict[str, Any]:
    total_tweets = len(tweets)
    if total_tweets == 0:
        return {
            "brand_id": brand_id,
            "brand_name": brand_name,
            "model_type": "engagement",
            "created_at": datetime.now().isoformat(),
            "data": {
                "total_tweets": 0,
                "total_engagement": 0,
                "avg_engagement": 0,
                "engagement_rate": 0,
                "trend": [],
                "posting_hours": [],
                "top_tweets": [],
            },
        }

    total_engagement = 0
    engagement_by_date: Dict[str, int] = {}
    engagement_by_hour = [0] * 24
    top_tweets: List[Dict[str, Any]] = []

    for t in tweets:
        engagement = (
            t.favorite_count
            + t.retweet_count
            + (t.reply_count or 0)
            + (t.quote_count or 0)
        )
        total_engagement += engagement

        try:
            dt = pd.to_datetime(t.created_at, errors="coerce", utc=True)
        except Exception:
            dt = None

        if dt is not None and not pd.isna(dt):
            date_key = dt.date().isoformat()
            engagement_by_date[date_key] = engagement_by_date.get(date_key, 0) + engagement
            engagement_by_hour[dt.hour] += engagement

        top_tweets.append(
            {
                "id_str": t.id_str,
                "text": t.full_text[:200],
                "engagement": engagement,
                "favorite_count": t.favorite_count,
                "retweet_count": t.retweet_count,
            }
        )

    avg_engagement = total_engagement / total_tweets
    engagement_rate = round(avg_engagement / total_tweets * 100, 2)

    trend = [{"date": d, "engagement": engagement_by_date[d]} for d in sorted(engagement_by_date.keys())]

    posting_hours = [{"hour": h, "engagement": engagement_by_hour[h]} for h in range(24)]

    top_tweets_sorted = sorted(top_tweets, key=lambda x: x["engagement"], reverse=True)[:10]

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "model_type": "engagement",
        "created_at": datetime.now().isoformat(),
        "data": {
            "total_tweets": total_tweets,
            "total_engagement": total_engagement,
            "avg_engagement": round(avg_engagement, 2),
            "engagement_rate": engagement_rate,
            "trend": trend,
            "posting_hours": posting_hours,
            "top_tweets": top_tweets_sorted,
        },
    }


@router.get("/{brand_id}/engagement")
async def get_brand_engagement(brand_id: str):
    """
    Ambil model engagement 1 brand (Netflix sendiri, Disney sendiri)
    """
    model = load_model(brand_id, "engagement")
    return {"success": True, **model}


@router.get("/comparison")
async def compare_brands():
    """
    Comparison antar brand:
    - engagement_rate
    - total_engagement
    - sentiment (positive/negative/neutral %)
    """
    comparison = []

    for model_file in MODELS_DIR.glob("*_engagement_model.pkl"):
        m = re.match(r"(.+?)_engagement_model\.pkl", model_file.name)
        if not m:
            continue
        brand_id = m.group(1)

        from be.core.shared import load_model  # import di sini biar aman dari circular

        try:
            engagement_model = load_model(brand_id, "engagement")
        except Exception:
            continue

        try:
            sentiment_model = load_model(brand_id, "sentiment")
            s = sentiment_model["data"]
        except Exception:
            s = None

        e = engagement_model["data"]

        comparison.append(
            {
                "brand_id": brand_id,
                "brand_name": engagement_model.get("brand_name", brand_id.title()),
                "total_tweets": e["total_tweets"],
                "total_engagement": e["total_engagement"],
                "engagement_rate": e["engagement_rate"],
                "positive_pct": s["positive_pct"] if s else None,
                "negative_pct": s["negative_pct"] if s else None,
                "neutral_pct": s["neutral_pct"] if s else None,
            }
        )

    return {"success": True, "brands": comparison}