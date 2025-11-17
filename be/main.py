from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
from datetime import datetime
import pickle
import json
from pathlib import Path
from collections import Counter
import re

app = FastAPI(title="X Analytics API", version="1.0.0")

# CORS configuration to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TweetData(BaseModel):
    id_str: str
    full_text: str
    created_at: str
    username: str
    favorite_count: int
    retweet_count: int
    reply_count: Optional[int] = 0
    quote_count: Optional[int] = 0

class AccountAnalytics(BaseModel):
    username: str
    total_tweets: int
    followers: int
    engagement_rate: float
    sentiment: Dict[str, float]
    top_hashtags: List[Dict[str, Any]]
    topics: List[Dict[str, Any]]
    trends: List[Dict[str, Any]]

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {
        "message": "X Analytics API",
        "version": "1.0.0",
        "endpoints": [
            "/api/upload-csv",
            "/api/analytics/{username}",
            "/api/health",
            "/api/analyze-sentiment",
            "/api/extract-topics",
            "/api/load-model/{username}/{model_type}",
            "/api/list-models"
        ]
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload and process CSV file containing tweet data
    """
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ['id_str', 'full_text', 'created_at', 'username']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Basic processing
        total_tweets = len(df)
        username = df['username'].iloc[0] if len(df) > 0 else "unknown"
        
        return {
            "success": True,
            "username": username,
            "total_tweets": total_tweets,
            "columns": df.columns.tolist(),
            "message": f"Successfully processed {total_tweets} tweets"
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.post("/api/analyze")
async def analyze_data(tweets: List[TweetData]):
    """
    Perform analytics on tweet data
    """
    try:
        if not tweets:
            raise HTTPException(status_code=400, detail="No tweet data provided")
        
        # Basic analytics calculations
        total_engagement = sum(
            t.favorite_count + t.retweet_count + t.reply_count + t.quote_count 
            for t in tweets
        )
        avg_engagement = total_engagement / len(tweets) if tweets else 0
        
        # Calculate engagement rate (simplified)
        engagement_rate = round(avg_engagement / len(tweets) * 100, 2) if tweets else 0
        
        return {
            "username": tweets[0].username,
            "total_tweets": len(tweets),
            "total_engagement": total_engagement,
            "avg_engagement": round(avg_engagement, 2),
            "engagement_rate": engagement_rate,
            "message": "Analytics processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing data: {str(e)}")

@app.post("/api/analyze-sentiment")
async def analyze_sentiment(tweets: List[TweetData]):
    """
    Perform sentiment analysis and save model to .pkl
    """
    try:
        if not tweets:
            raise HTTPException(status_code=400, detail="No tweet data provided")
        
        # Simple sentiment analysis using keyword matching
        positive_keywords = ['amazing', 'love', 'great', 'awesome', 'excellent', 
                           'fantastic', 'wonderful', 'beautiful', 'best', 'happy']
        negative_keywords = ['hate', 'bad', 'terrible', 'awful', 'worst', 
                           'horrible', 'disappointing', 'poor', 'sad', 'angry']
        
        sentiment_results = {
            'positive': 0,
            'neutral': 0,
            'negative': 0,
            'total_tweets': len(tweets),
            'positive_examples': [],
            'negative_examples': [],
            'neutral_examples': []
        }
        
        for tweet in tweets:
            text_lower = tweet.full_text.lower()
            
            # Count sentiment keywords
            positive_count = sum(1 for kw in positive_keywords if kw in text_lower)
            negative_count = sum(1 for kw in negative_keywords if kw in text_lower)
            
            if positive_count > negative_count:
                sentiment_results['positive'] += 1
                if len(sentiment_results['positive_examples']) < 5:
                    sentiment_results['positive_examples'].append({
                        'text': tweet.full_text[:100],
                        'engagement': tweet.favorite_count + tweet.retweet_count
                    })
            elif negative_count > positive_count:
                sentiment_results['negative'] += 1
                if len(sentiment_results['negative_examples']) < 5:
                    sentiment_results['negative_examples'].append({
                        'text': tweet.full_text[:100],
                        'engagement': tweet.favorite_count + tweet.retweet_count
                    })
            else:
                sentiment_results['neutral'] += 1
                if len(sentiment_results['neutral_examples']) < 5:
                    sentiment_results['neutral_examples'].append({
                        'text': tweet.full_text[:100],
                        'engagement': tweet.favorite_count + tweet.retweet_count
                    })
        
        # Calculate percentages
        total = len(tweets)
        sentiment_results['positive_pct'] = round((sentiment_results['positive'] / total) * 100, 2)
        sentiment_results['neutral_pct'] = round((sentiment_results['neutral'] / total) * 100, 2)
        sentiment_results['negative_pct'] = round((sentiment_results['negative'] / total) * 100, 2)
        
        # Save sentiment model to .pkl
        username = tweets[0].username
        model_path = MODELS_DIR / f"{username}_sentiment_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(sentiment_results, f)
        
        print(f"[Backend] Saved sentiment model to {model_path}")
        
        return {
            "success": True,
            "sentiment": sentiment_results,
            "model_saved": str(model_path),
            "message": f"Sentiment analysis complete for {total} tweets"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in sentiment analysis: {str(e)}")


@app.post("/api/extract-topics")
async def extract_topics(tweets: List[TweetData], num_topics: int = 5):
    """
    Extract topics using TF-IDF and save model to .pkl
    """
    try:
        if not tweets:
            raise HTTPException(status_code=400, detail="No tweet data provided")
        
        # Tokenize and extract words
        stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 
                     'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this'}
        
        all_words = []
        for tweet in tweets:
            text = tweet.full_text.lower()
            # Remove URLs, mentions, hashtags
            text = re.sub(r'http\S+|@\w+|#', '', text)
            words = re.findall(r'\b\w+\b', text)
            words = [w for w in words if len(w) > 3 and w not in stop_words]
            all_words.extend(words)
        
        # Count word frequencies
        word_freq = Counter(all_words)
        
        # Extract top keywords as topics
        topics = []
        top_words = word_freq.most_common(50)
        
        # Group words into topics (simplified clustering by first letter)
        topics_dict = {}
        for word, count in top_words:
            first_letter = word[0]
            if first_letter not in topics_dict:
                topics_dict[first_letter] = []
            topics_dict[first_letter].append({'word': word, 'weight': count})
        
        # Create topic objects
        for i, (letter, words) in enumerate(list(topics_dict.items())[:num_topics]):
            topic_words = sorted(words, key=lambda x: x['weight'], reverse=True)[:5]
            topics.append({
                'id': i,
                'label': f"Topic {i+1}: {' + '.join([w['word'] for w in topic_words[:3]])}",
                'keywords': [w['word'] for w in topic_words],
                'weights': [w['weight'] for w in topic_words],
                'tweet_count': sum(w['weight'] for w in topic_words)
            })
        
        # Topic modeling results
        topic_results = {
            'topics': topics,
            'total_tweets': len(tweets),
            'total_unique_words': len(word_freq),
            'top_keywords': [w for w, c in top_words[:20]]
        }
        
        # Save topic model to .pkl
        username = tweets[0].username
        model_path = MODELS_DIR / f"{username}_topic_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(topic_results, f)
        
        print(f"[Backend] Saved topic model to {model_path}")
        
        return {
            "success": True,
            "topics": topic_results,
            "model_saved": str(model_path),
            "message": f"Extracted {len(topics)} topics from {len(tweets)} tweets"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in topic extraction: {str(e)}")


@app.get("/api/load-model/{username}/{model_type}")
async def load_model(username: str, model_type: str):
    """
    Load saved model from .pkl file
    model_type: 'sentiment' or 'topic'
    """
    try:
        model_path = MODELS_DIR / f"{username}_{model_type}_model.pkl"
        
        if not model_path.exists():
            raise HTTPException(
                status_code=404, 
                detail=f"Model not found: {model_path}"
            )
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        return {
            "success": True,
            "model_type": model_type,
            "username": username,
            "data": model_data,
            "loaded_from": str(model_path)
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Model file not found for {username}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model: {str(e)}")


@app.get("/api/list-models")
async def list_models():
    """
    List all saved .pkl model files
    """
    try:
        model_files = list(MODELS_DIR.glob("*.pkl"))
        
        models = []
        for model_file in model_files:
            file_size = model_file.stat().st_size
            models.append({
                "filename": model_file.name,
                "path": str(model_file),
                "size_bytes": file_size,
                "size_kb": round(file_size / 1024, 2)
            })
        
        return {
            "success": True,
            "total_models": len(models),
            "models": models
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing models: {str(e)}")

@app.get("/api/analytics/{username}")
async def get_analytics(username: str):
    """
    Get cached analytics for a specific username
    """
    # In production, this would fetch from database
    return {
        "username": username,
        "message": "Analytics endpoint - implement database integration",
        "note": "This is a placeholder for production implementation"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
