# app/routers/sentiment.py
from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime

from be.core.shared import TweetData, load_model

router = APIRouter(prefix="/api/brands", tags=["sentiment"])


def compute_sentiment_model(brand_id: str, brand_name: str, tweets: List[TweetData]) -> Dict[str, Any]:
    positive_keywords = [
        "amazing",
        "love",
        "great",
        "awesome",
        "excellent",
        "fantastic",
        "wonderful",
        "beautiful",
        "best",
        "happy",
    ]
    negative_keywords = [
        "hate",
        "bad",
        "terrible",
        "awful",
        "worst",
        "horrible",
        "disappointing",
        "poor",
        "sad",
        "angry",
    ]

    sentiment_results = {
        "positive": 0,
        "neutral": 0,
        "negative": 0,
        "total_tweets": len(tweets),
        "positive_examples": [],
        "negative_examples": [],
        "neutral_examples": [],
    }

    for tweet in tweets:
        text_lower = tweet.full_text.lower()

        positive_count = sum(1 for kw in positive_keywords if kw in text_lower)
        negative_count = sum(1 for kw in negative_keywords if kw in text_lower)

        engagement = tweet.favorite_count + tweet.retweet_count

        if positive_count > negative_count:
            sentiment_results["positive"] += 1
            if len(sentiment_results["positive_examples"]) < 5:
                sentiment_results["positive_examples"].append(
                    {"text": tweet.full_text[:100], "engagement": engagement}
                )
        elif negative_count > positive_count:
            sentiment_results["negative"] += 1
            if len(sentiment_results["negative_examples"]) < 5:
                sentiment_results["negative_examples"].append(
                    {"text": tweet.full_text[:100], "engagement": engagement}
                )
        else:
            sentiment_results["neutral"] += 1
            if len(sentiment_results["neutral_examples"]) < 5:
                sentiment_results["neutral_examples"].append(
                    {"text": tweet.full_text[:100], "engagement": engagement}
                )

    total = len(tweets) or 1
    sentiment_results["positive_pct"] = round(
        (sentiment_results["positive"] / total) * 100, 2
    )
    sentiment_results["neutral_pct"] = round(
        (sentiment_results["neutral"] / total) * 100, 2
    )
    sentiment_results["negative_pct"] = round(
        (sentiment_results["negative"] / total) * 100, 2
    )

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "model_type": "sentiment",
        "created_at": datetime.now().isoformat(),
        "data": sentiment_results,
    }


@router.get("/{brand_id}/sentiment")
async def get_brand_sentiment(brand_id: str):
    """
    Ambil model sentimen 1 brand
    """
    model = load_model(brand_id, "sentiment")
    return {"success": True, **model}