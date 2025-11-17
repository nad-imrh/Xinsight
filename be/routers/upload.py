# app/routers/upload.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import pandas as pd
import io

from core.shared import TweetData, extract_brand_from_filename, save_model
from routers.engagement import compute_engagement_analytics
from routers.sentiment import compute_sentiment_model
from routers.topics import compute_topic_model
from routers.hashtags import compute_hashtag_analysis

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        required_columns = ["id_str", "full_text", "created_at"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}",
            )

        numeric_cols = ["favorite_count", "retweet_count", "reply_count", "quote_count"]
        for col in numeric_cols:
            if col not in df.columns:
                df[col] = 0
            df[col] = df[col].fillna(0).astype(int)

        brand_meta = extract_brand_from_filename(file.filename)
        brand_name = brand_meta["brand_name"]
        brand_id = brand_meta["brand_id"]

        tweets: List[TweetData] = []
        for _, row in df.iterrows():
            tweets.append(
                TweetData(
                    id_str=str(row["id_str"]),
                    full_text=str(row["full_text"]),
                    created_at=str(row["created_at"]),
                    username=str(row.get("username", brand_name)),
                    favorite_count=int(row.get("favorite_count", 0)),
                    retweet_count=int(row.get("retweet_count", 0)),
                    reply_count=int(row.get("reply_count", 0)),
                    quote_count=int(row.get("quote_count", 0)),
                )
            )

        # === Jalankan analitik: Engagement, Sentiment, Topic, Hashtag ===
        engagement_model = compute_engagement_analytics(brand_id, brand_name, tweets)
        sentiment_model = compute_sentiment_model(brand_id, brand_name, tweets)
        topic_model = compute_topic_model(brand_id, brand_name, tweets)
        hashtag_model = compute_hashtag_analysis(brand_id, brand_name, tweets)

        eng_path = save_model(brand_id, "engagement", engagement_model)
        sent_path = save_model(brand_id, "sentiment", sentiment_model)
        topic_path = save_model(brand_id, "topic", topic_model)
        hashtag_path = save_model(brand_id, "hashtags", hashtag_model)

        return {
            "success": True,
            "brand": {
                "id": brand_id,
                "name": brand_name,
                "total_tweets": len(tweets),
            },
            "analytics": {
                "engagement": engagement_model["data"],
                "sentiment": sentiment_model["data"],
                "topics": topic_model["data"],
                "hashtags": hashtag_model["data"],
            },
            "models_saved": {
                "engagement": str(eng_path),
                "sentiment": str(sent_path),
                "topic": str(topic_path),
                "hashtags": str(hashtag_path),
            },
            "message": f"Analisis lengkap untuk brand '{brand_name}' ({len(tweets)} tweets) berhasil diproses",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
