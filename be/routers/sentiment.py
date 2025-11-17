# app/routers/sentiment.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import re
import string

from core.shared import TweetData, load_model

# NLTK imports
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Download required VADER lexicon
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

router = APIRouter(prefix="/api/brands", tags=["sentiment"])

# Initialize VADER sentiment analyzer
sia = SentimentIntensityAnalyzer()


# ============================
# TEXT CLEANING
# ============================
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"&amp", "and", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"\d+", "", text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# ============================
# SENTIMENT PROCESSING
# ============================
def get_sentiment_vader(text: str) -> tuple[str, float]:
    cleaned = clean_text(text)
    score = sia.polarity_scores(cleaned)
    compound = score["compound"]

    if compound >= 0.05:
        sentiment = "positive"
    elif compound <= -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return sentiment, compound


# ============================
# MAIN BRAND SENTIMENT MODEL
# ============================
def compute_sentiment_model(brand_id: str, brand_name: str, tweets: List[TweetData]) -> Dict[str, Any]:
    sentiment_results = {
        "positive": 0,
        "neutral": 0,
        "negative": 0,
        "total_tweets": len(tweets),
        "positive_examples": [],
        "negative_examples": [],
        "neutral_examples": [],
        "average_compound_score": 0.0,
    }

    total_compound = 0.0

    for tweet in tweets:
        sentiment, compound_score = get_sentiment_vader(tweet.full_text)
        total_compound += compound_score
        engagement = tweet.favorite_count + tweet.retweet_count

        # ✅ Simpan minimal 2 contoh per sentimen (max 5 untuk diversitas)
        if sentiment == "positive":
            sentiment_results["positive"] += 1
            if len(sentiment_results["positive_examples"]) < 5:
                sentiment_results["positive_examples"].append({
                    "id_str": tweet.id_str,
                    "text": tweet.full_text,
                    "text_preview": tweet.full_text[:150] + "..." if len(tweet.full_text) > 150 else tweet.full_text,
                    "engagement": engagement,
                    "favorite_count": tweet.favorite_count,
                    "retweet_count": tweet.retweet_count,
                    "score": round(compound_score, 3),
                    "created_at": tweet.created_at,
                })

        elif sentiment == "negative":
            sentiment_results["negative"] += 1
            if len(sentiment_results["negative_examples"]) < 5:
                sentiment_results["negative_examples"].append({
                    "id_str": tweet.id_str,
                    "text": tweet.full_text,
                    "text_preview": tweet.full_text[:150] + "..." if len(tweet.full_text) > 150 else tweet.full_text,
                    "engagement": engagement,
                    "favorite_count": tweet.favorite_count,
                    "retweet_count": tweet.retweet_count,
                    "score": round(compound_score, 3),
                    "created_at": tweet.created_at,
                })

        else:
            sentiment_results["neutral"] += 1
            if len(sentiment_results["neutral_examples"]) < 5:
                sentiment_results["neutral_examples"].append({
                    "id_str": tweet.id_str,
                    "text": tweet.full_text,
                    "text_preview": tweet.full_text[:150] + "..." if len(tweet.full_text) > 150 else tweet.full_text,
                    "engagement": engagement,
                    "favorite_count": tweet.favorite_count,
                    "retweet_count": tweet.retweet_count,
                    "score": round(compound_score, 3),
                    "created_at": tweet.created_at,
                })

    total = len(tweets) or 1
    sentiment_results["positive_pct"] = round((sentiment_results["positive"] / total) * 100, 2)
    sentiment_results["neutral_pct"] = round((sentiment_results["neutral"] / total) * 100, 2)
    sentiment_results["negative_pct"] = round((sentiment_results["negative"] / total) * 100, 2)
    sentiment_results["average_compound_score"] = round(total_compound / total, 3)

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "model_type": "sentiment",
        "analysis_method": "VADER (Valence Aware Dictionary and sEntiment Reasoner)",
        "created_at": datetime.now().isoformat(),
        "data": sentiment_results,
    }


# ============================
# REQUIRED BY upload.py
# ANALYZE SENTIMENT FOR DATAFRAME
# ============================
def analyze_sentiment_df(df):
    """
    Analisis sentiment dari CSV upload (df)
    Mengembalikan ringkasan + list tweet
    """
    if "full_text" not in df.columns:
        raise ValueError("DataFrame must contain column: full_text")

    results = []
    pos = neu = neg = 0
    total_compound = 0.0

    for _, row in df.iterrows():
        text = str(row["full_text"])
        sentiment, compound = get_sentiment_vader(text)
        total_compound += compound

        # aggregate
        if sentiment == "positive":
            pos += 1
        elif sentiment == "negative":
            neg += 1
        else:
            neu += 1

        results.append({
            "text": text,
            "cleaned_text": clean_text(text),
            "sentiment": sentiment,
            "compound": round(compound, 3),
        })

    total = len(df) or 1

    summary = {
        "positive": pos,
        "neutral": neu,
        "negative": neg,
        "positive_pct": round(pos / total * 100, 2),
        "neutral_pct": round(neu / total * 100, 2),
        "negative_pct": round(neg / total * 100, 2),
        "average_compound_score": round(total_compound / total, 3),
    }

    return {
        "summary": summary,
        "tweets": results
    }


# ============================
# ROUTES
# ============================
@router.get("/{brand_id}/sentiment")
async def get_brand_sentiment(brand_id: str):
    """
    Ambil sentiment analysis dengan minimal 2 contoh per sentimen
    """
    brand_id = brand_id.lower()
    model = load_model(brand_id, "sentiment")
    
    # ✅ Ensure minimal 2 examples per sentiment (slice dari 5 yang disimpan)
    data = model.get("data", {})
    
    return {
        "success": True,
        "brand_id": model.get("brand_id"),
        "brand_name": model.get("brand_name"),
        "sentiment_distribution": {
            "positive": data.get("positive", 0),
            "neutral": data.get("neutral", 0),
            "negative": data.get("negative", 0),
            "positive_pct": data.get("positive_pct", 0),
            "neutral_pct": data.get("neutral_pct", 0),
            "negative_pct": data.get("negative_pct", 0),
            "average_compound_score": data.get("average_compound_score", 0),
        },
        "sentiment_examples": {
            "positive": data.get("positive_examples", [])[:2],  # ✅ Min 2 examples
            "neutral": data.get("neutral_examples", [])[:2],
            "negative": data.get("negative_examples", [])[:2],
        },
        "meta": {
            "model_type": model.get("model_type"),
            "analysis_method": model.get("analysis_method"),
            "created_at": model.get("created_at"),
        }
    }


# ✅ GET ALL EXAMPLES (untuk debugging atau analisis lebih dalam)
@router.get("/{brand_id}/sentiment/examples")
async def get_all_sentiment_examples(brand_id: str, limit: int = 5):
    """
    Ambil semua contoh tweets per sentimen (max 5 per kategori)
    """
    brand_id = brand_id.lower()
    model = load_model(brand_id, "sentiment")
    data = model.get("data", {})
    
    return {
        "success": True,
        "brand_id": brand_id,
        "sentiment_examples": {
            "positive": data.get("positive_examples", [])[:limit],
            "neutral": data.get("neutral_examples", [])[:limit],
            "negative": data.get("negative_examples", [])[:limit],
        }
    }


@router.get("/{brand_id}/sentiment/analyze")
async def analyze_sentiment_realtime(brand_id: str, text: str):
    """
    Analisis sentiment real-time untuk teks tertentu
    """
    sentiment, compound = get_sentiment_vader(text)
    cleaned = clean_text(text)

    return {
        "success": True,
        "brand_id": brand_id,
        "original_text": text,
        "cleaned_text": cleaned,
        "sentiment": sentiment,
        "compound_score": round(compound, 3),
        "interpretation": {
            "positive": compound >= 0.05,
            "neutral": -0.05 < compound < 0.05,
            "negative": compound <= -0.05
        }
    }