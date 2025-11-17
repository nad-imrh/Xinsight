# app/routers/topics.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
from collections import Counter
import re
import pickle
import numpy as np
from pathlib import Path

from core.shared import TweetData, load_model

router = APIRouter(prefix="/api/brands", tags=["topics"])

# Lokasi global LDA model
GLOBAL_TOPIC_MODEL_PATH = Path("models/global_topic_model.pkl")


def preprocess_text(text: str) -> str:
    """
    Bersihkan teks untuk input LDA
    """
    text = text.lower()
    text = re.sub(r"http\S+|@\w+|#\w+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def compute_topic_model(
    brand_id: str, brand_name: str, tweets: List[TweetData], num_topics: int = 10
) -> Dict[str, Any]:

    # --------------------------------------
    # 1. Load global LDA model
    # --------------------------------------
    if not GLOBAL_TOPIC_MODEL_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Global topic model not found. Upload missing: models/global_topic_model.pkl",
        )

    with open(GLOBAL_TOPIC_MODEL_PATH, "rb") as f:
        pipeline = pickle.load(f)

    vectorizer = pipeline.named_steps["vectorizer"]
    lda = pipeline.named_steps["lda"]

    # --------------------------------------
    # 2. Preprocess tweets
    # --------------------------------------
    clean_texts = [preprocess_text(t.full_text) for t in tweets]

    # Vectorize
    X = vectorizer.transform(clean_texts)

    # --------------------------------------
    # 3. Topic distribution per tweet
    # --------------------------------------
    topic_distributions = lda.transform(X)

    # Dominant topic ID per tweet
    dominant_topics = np.argmax(topic_distributions, axis=1)
    topic_counts = Counter(dominant_topics)

    # --------------------------------------
    # 4. Extract keywords per topic
    # --------------------------------------
    words = vectorizer.get_feature_names_out()
    topics_output = []

    available_topics = min(num_topics, lda.n_components)

    for topic_idx in range(available_topics):
        component = lda.components_[topic_idx]
        top_indices = component.argsort()[::-1][:10]

        keywords = [words[i] for i in top_indices]
        weights = [float(component[i]) for i in top_indices]

        topics_output.append(
            {
                "id": topic_idx,
                "label": f"Topic {topic_idx + 1}: {' + '.join(keywords[:3])}",
                "keywords": keywords,
                "weights": weights,
                "tweet_count": topic_counts.get(topic_idx, 0),
            }
        )

    # --------------------------------------
    # 5. Filter 5 topik terbesar
    # (TIDAK diurutkan, urutan original LDA dipertahankan)
    # --------------------------------------
    top_5_ids = {topic_id for topic_id, _ in topic_counts.most_common(5)}

    topics_output_filtered = [
        t for t in topics_output if t["id"] in top_5_ids
    ]

    # --------------------------------------
    # 6. Final result
    # --------------------------------------
    topic_results = {
        "topics": topics_output_filtered,
        "total_tweets": len(tweets),
        "unique_topics_found": len(topic_counts),
    }

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "model_type": "topic",
        "created_at": datetime.now().isoformat(),
        "data": topic_results,
    }


@router.get("/{brand_id}/topics")
async def get_brand_topics(brand_id: str):
    """
    Ambil model topik 1 brand (hasil analisis sebelumnya)
    """
    model = load_model(brand_id, "topic")
    return {"success": True, **model}
