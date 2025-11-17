# app/routers/engagement.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
import re

from core.shared import TweetData, MODELS_DIR, load_model

router = APIRouter(prefix="/api/brands", tags=["engagement"])

# ✅ DEFAULT FOLLOWERS DATA
DEFAULT_FOLLOWERS: Dict[str, int] = {
    "disney": 6115060,
    "netflix": 24812743,
}


def compute_engagement_analytics(brand_id: str, brand_name: str, tweets: List[TweetData]) -> Dict[str, Any]:
    total_tweets = len(tweets)
    
    # ✅ Ambil followers count
    followers = DEFAULT_FOLLOWERS.get(brand_id, 0)
    
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
                "followers": followers,
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
                "created_at": t.created_at,
            }
        )

    avg_engagement = total_engagement / total_tweets
    
    # ✅ Engagement rate calculation (lebih akurat dengan followers)
    if followers > 0:
        engagement_rate = round((total_engagement / followers / total_tweets) * 100, 2)
    else:
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
            "followers": followers,  # ✅ Tambahkan followers
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
    brand_id = brand_id.lower()
    model = load_model(brand_id, "engagement")
    
    # ✅ Ensure followers ada di response
    if "followers" not in model.get("data", {}):
        followers = DEFAULT_FOLLOWERS.get(brand_id, 0)
        model["data"]["followers"] = followers
    
    return {"success": True, **model}


# ✅ ENGAGEMENT SUMMARY - Analytics tambahan
@router.get("/{brand_id}/engagement/summary")
async def get_engagement_summary(brand_id: str):
    """
    Ringkasan engagement analytics:
    - Total engagement
    - Average engagement per tweet
    - Engagement rate
    - Best performing tweet
    """
    brand_id = brand_id.lower()
    
    try:
        model = load_model(brand_id, "engagement")
        data = model.get("data", {})
        
        total_tweets = data.get("total_tweets", 0)
        total_engagement = data.get("total_engagement", 0)
        avg_engagement = data.get("avg_engagement", 0)
        engagement_rate = data.get("engagement_rate", 0)
        followers = data.get("followers", DEFAULT_FOLLOWERS.get(brand_id, 0))
        
        top_tweets = data.get("top_tweets", [])
        best_tweet = top_tweets[0] if top_tweets else None
        
        return {
            "success": True,
            "brand_id": brand_id,
            "summary": {
                "total_tweets": total_tweets,
                "total_engagement": total_engagement,
                "avg_engagement_per_tweet": avg_engagement,
                "engagement_rate": engagement_rate,
                "followers": followers,
                "best_performing_tweet": {
                    "text": best_tweet.get("text", "") if best_tweet else "",
                    "engagement": best_tweet.get("engagement", 0) if best_tweet else 0,
                    "favorite_count": best_tweet.get("favorite_count", 0) if best_tweet else 0,
                    "retweet_count": best_tweet.get("retweet_count", 0) if best_tweet else 0,
                } if best_tweet else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ❌ HAPUS COMPARISON - Return 410 Gone
@router.get("/comparison")
async def compare_brands():
    """
    DEPRECATED: Comparison feature has been removed.
    Use individual brand endpoints instead.
    """
    raise HTTPException(
        status_code=410,
        detail="Comparison feature has been removed. Please use GET /api/brands/{brand_id}/engagement for individual brand analytics."
    )