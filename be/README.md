# X Analytics Backend

FastAPI backend for X (Twitter) analytics platform.

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Run the server:
\`\`\`bash
python main.py
\`\`\`

Or with uvicorn:
\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/upload-csv` - Upload and process CSV files
- `POST /api/analyze` - Analyze tweet data
- `GET /api/analytics/{username}` - Get analytics for username

## Development

The backend is organized in the `be` folder with a clean structure:
- `main.py` - Main FastAPI application
- `requirements.txt` - Python dependencies
- Future additions: `models/`, `services/`, `utils/` folders for better organization
