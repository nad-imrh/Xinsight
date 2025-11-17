# app/routers/sentiment.py
from fastapi import APIRouter
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

        if sentiment == "positive":
            sentiment_results["positive"] += 1
            if len(sentiment_results["positive_examples"]) < 5:
                sentiment_results["positive_examples"].append({
                    "text": tweet.full_text[:100],
                    "engagement": engagement,
                    "score": round(compound_score, 3)
                })

        elif sentiment == "negative":
            sentiment_results["negative"] += 1
            if len(sentiment_results["negative_examples"]) < 5:
                sentiment_results["negative_examples"].append({
                    "text": tweet.full_text[:100],
                    "engagement": engagement,
                    "score": round(compound_score, 3)
                })

        else:
            sentiment_results["neutral"] += 1
            if len(sentiment_results["neutral_examples"]) < 5:
                sentiment_results["neutral_examples"].append({
                    "text": tweet.full_text[:100],
                    "engagement": engagement,
                    "score": round(compound_score, 3)
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
    model = load_model(brand_id, "sentiment")
    return {"success": True, **model}


@router.get("/{brand_id}/sentiment/analyze")
async def analyze_sentiment_realtime(brand_id: str, text: str):
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