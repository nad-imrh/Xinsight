# Backend API Setup Guide (Optional)

This guide explains how to set up an optional FastAPI backend for the X Analytics application.

## Why Backend?

The current frontend application processes CSV files entirely in the browser using JavaScript. A backend API is optional but can provide:

- **Server-side processing** - Handle large CSV files
- **Database storage** - Persist analytics data
- **Advanced analytics** - Use Python libraries like scikit-learn, NLTK
- **API rate limiting** - Control usage
- **Authentication** - Secure data access

## Quick Setup

### 1. Create Backend Project

\`\`\`bash
mkdir x-analytics-backend
cd x-analytics-backend
\`\`\`

### 2. Create `requirements.txt`

\`\`\`txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
numpy==1.26.2
python-multipart==0.0.6
scikit-learn==1.3.2
nltk==3.8.1
python-dotenv==1.0.0
\`\`\`

### 3. Create `main.py`

\`\`\`python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime
import io

app = FastAPI(title="X Analytics API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "X Analytics API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/upload/disney")
async def upload_disney(file: UploadFile = File(...)):
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Basic validation
        required_columns = ['full_text', 'favorite_count', 'retweet_count']
        missing_cols = [col for col in required_columns if col not in df.columns]
        
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Process data
        total_tweets = len(df)
        total_engagement = df['favorite_count'].sum() + df['retweet_count'].sum()
        avg_engagement = total_engagement / total_tweets if total_tweets > 0 else 0
        
        # Extract top hashtags
        hashtags = []
        for text in df['full_text'].dropna():
            tags = [word for word in str(text).split() if word.startswith('#')]
            hashtags.extend(tags)
        
        hashtag_counts = pd.Series(hashtags).value_counts().head(10)
        
        return {
            "status": "success",
            "account": "Disney",
            "total_tweets": total_tweets,
            "total_engagement": int(total_engagement),
            "avg_engagement": round(avg_engagement, 2),
            "top_hashtags": [
                {"tag": tag, "count": int(count)}
                for tag, count in hashtag_counts.items()
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/netflix")
async def upload_netflix(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        required_columns = ['full_text', 'favorite_count', 'retweet_count']
        missing_cols = [col for col in required_columns if col not in df.columns]
        
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        total_tweets = len(df)
        total_engagement = df['favorite_count'].sum() + df['retweet_count'].sum()
        avg_engagement = total_engagement / total_tweets if total_tweets > 0 else 0
        
        hashtags = []
        for text in df['full_text'].dropna():
            tags = [word for word in str(text).split() if word.startswith('#')]
            hashtags.extend(tags)
        
        hashtag_counts = pd.Series(hashtags).value_counts().head(10)
        
        return {
            "status": "success",
            "account": "Netflix",
            "total_tweets": total_tweets,
            "total_engagement": int(total_engagement),
            "avg_engagement": round(avg_engagement, 2),
            "top_hashtags": [
                {"tag": tag, "count": int(count)}
                for tag, count in hashtag_counts.items()
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare")
async def compare_accounts(disney_file: UploadFile, netflix_file: UploadFile):
    try:
        # Read both CSVs
        disney_df = pd.read_csv(io.StringIO((await disney_file.read()).decode('utf-8')))
        netflix_df = pd.read_csv(io.StringIO((await netflix_file.read()).decode('utf-8')))
        
        # Process comparison metrics
        comparison = {
            "disney": {
                "total_tweets": len(disney_df),
                "avg_engagement": float(disney_df['favorite_count'].mean() + disney_df['retweet_count'].mean())
            },
            "netflix": {
                "total_tweets": len(netflix_df),
                "avg_engagement": float(netflix_df['favorite_count'].mean() + netflix_df['retweet_count'].mean())
            }
        }
        
        return comparison
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

### 4. Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 5. Run Backend

\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

The API will be available at `http://localhost:8000`

View API documentation at `http://localhost:8000/docs`

## Integrate with Frontend

To connect the frontend to this backend, update the fetch calls in your frontend code:

\`\`\`typescript
// Instead of processing in browser:
const response = await fetch('http://localhost:8000/api/upload/disney', {
  method: 'POST',
  body: formData
});
const data = await response.json();
\`\`\`

## Environment Variables

Create `.env` file:

\`\`\`
DATABASE_URL=postgresql://user:pass@localhost:5432/analytics
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
\`\`\`

## Deploy Backend

### Option 1: Render

1. Push code to GitHub
2. Connect to Render
3. Deploy as Web Service

### Option 2: Railway

1. Push code to GitHub
2. Connect to Railway
3. Deploy automatically

### Option 3: Docker

Create `Dockerfile`:

\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t x-analytics-api .
docker run -p 8000:8000 x-analytics-api
\`\`\`

## Next Steps

1. Add database for persistent storage (PostgreSQL, MongoDB)
2. Implement caching (Redis)
3. Add authentication (JWT tokens)
4. Implement advanced analytics (ML models)
5. Add rate limiting
6. Set up monitoring and logging

## Notes

- Current frontend works without backend (client-side processing)
- Backend is optional for enhanced features
- Keep frontend and backend in separate repositories
- Use environment variables for configuration
- Add proper error handling and validation
- Implement proper security measures for production
