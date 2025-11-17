# app/routers/topics.py
from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime
from collections import Counter
import re

from be.core.shared import TweetData, load_model

router = APIRouter(prefix="/api/brands", tags=["topics"])


def compute_topic_model(
    brand_id: str, brand_name: str, tweets: List[TweetData], num_topics: int = 5
) -> Dict[str, Any]:
    stop_words = {
        "the",
        "is",
        "at",
        "which",
        "on",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "with",
        "to",
        "for",
        "of",
        "as",
        "by",
        "that",
        "this",
    }

    all_words = []
    for tweet in tweets:
        text = tweet.full_text.lower()
        text = re.sub(r"http\S+|@\w+|#", "", text)
        words = re.findall(r"\b\w+\b", text)
        words = [w for w in words if len(w) > 3 and w not in stop_words]
        all_words.extend(words)

    word_freq = Counter(all_words)
    top_words = word_freq.most_common(50)

    topics = []
    topics_dict: Dict[str, List[Dict[str, Any]]] = {}

    for word, count in top_words:
        first_letter = word[0]
        topics_dict.setdefault(first_letter, []).append({"word": word, "weight": count})

    for i, (letter, words) in enumerate(list(topics_dict.items())[:num_topics]):
        topic_words = sorted(words, key=lambda x: x["weight"], reverse=True)[:5]
        topics.append(
            {
                "id": i,
                "label": f"Topic {i + 1}: {' + '.join([w['word'] for w in topic_words[:3]])}",
                "keywords": [w["word"] for w in topic_words],
                "weights": [w["weight"] for w in topic_words],
                "tweet_count": sum(w["weight"] for w in topic_words),
            }
        )

    topic_results = {
        "topics": topics,
        "total_tweets": len(tweets),
        "total_unique_words": len(word_freq),
        "top_keywords": [w for w, c in top_words[:20]],
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
    Ambil model topik 1 brand
    """
    model = load_model(brand_id, "topic")
    return {"success": True, **model}
