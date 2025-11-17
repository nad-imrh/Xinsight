# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routers import upload, engagement, sentiment, topics, brands

app = FastAPI(title="X Analytics API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, batasi ke domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "X Analytics API",
        "version": "3.0.0",
        "endpoints": [
            "/api/health",
            "/api/upload-csv",
            "/api/brands",
            "/api/brands/{brand_id}",
            "/api/brands/{brand_id}/engagement",
            "/api/brands/{brand_id}/sentiment",
            "/api/brands/{brand_id}/topics",
            "/api/brands/comparison",
            "/api/list-models",
            "/api/load-model/{brand_id}/{model_type}",
        ],
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Register routers
app.include_router(upload.router)
app.include_router(engagement.router)
app.include_router(sentiment.router)
app.include_router(topics.router)
app.include_router(brands.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)