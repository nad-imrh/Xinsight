# X Analytics - Twitter Data Comparison Dashboard

Platform analytics untuk membandingkan performa data Twitter (X) antara dua brand dengan visualisasi komprehensif.

## Struktur Folder

\`\`\`
x-analytics/
├── app/                    # Frontend Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── load-data/         # Halaman upload data
│   │   └── page.tsx
│   ├── dashboard/         # Halaman comparison dashboard
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout dengan navbar
│   └── globals.css        # Global styles
├── components/            # Komponen React
│   ├── navbar.tsx         # Navigation bar
│   ├── dashboard.tsx      # Main dashboard dengan tabs
│   ├── data-upload.tsx    # Upload interface
│   ├── charts/            # Komponen chart (engagement, sentiment, dll)
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── advanced-analytics.ts  # Analytics processing
│   ├── topic-modelling.ts     # Topic modeling (LDA)
│   └── types.ts              # TypeScript interfaces
├── be/                    # Backend FastAPI (Python)
│   ├── main.py           # FastAPI server dengan endpoints
│   ├── requirements.txt  # Python dependencies
│   ├── README.md         # Backend documentation
│   └── models/           # Folder penyimpanan .pkl files
└── public/               # Static assets
\`\`\`

## Penjelasan Struktur

Proyek ini memiliki struktur yang bersih dengan pemisahan yang jelas:

### Frontend (`app/`, `components/`, `lib/`)
Semua file yang mengatur **tampilan dan interface web**:
- **`app/`** - Halaman Next.js (Home, Load Data, Dashboard)
- **`components/`** - Komponen UI React yang reusable
- **`lib/`** - Helper functions dan utilities untuk processing data

### Backend (`be/`)
Semua file yang mengatur **server dan API backend**:
- **`main.py`** - FastAPI server dengan endpoints
- **`models/`** - Folder penyimpanan file .pkl hasil analisis
- **`requirements.txt`** - Dependencies Python

## Fitur

### Frontend
- **Landing Page**: Hero section dengan gradient text "Unlock X Insights That Matter", engagement metrics card (+348%), dan 6 feature cards
- **Navigation**: Navbar persisten dengan menu **Home, Load Data, dan Comparison Dashboard** - user bisa berpindah halaman kapan saja
- **Data Upload**: Interface untuk upload 2 dataset CSV (Disney & Netflix) dengan preview
- **Comparison Dashboard**: 6 tabs analisis lengkap:
  - **Comparison**: Perbandingan metrics utama (followers, tweets, engagement, sentiment)
  - **Engagement**: Followers growth dan tweet engagement charts
  - **Sentiment**: Analisis sentimen dengan pie charts dan contoh tweets
  - **Hashtags**: Performa top hashtags dengan bar charts
  - **Topics**: Topic modeling dengan bar charts dan radar charts
  - **Trends**: Trend analysis time series dengan daily distribution

### Backend (FastAPI)
Backend FastAPI yang terpisah untuk:
- **Upload CSV**: Endpoint untuk upload dan validasi data
- **Sentiment Analysis**: Analisis sentimen dan save hasil ke .pkl file
- **Topic Modeling**: Extract topics dengan TF-IDF dan save ke .pkl file
- **Load Models**: Load saved .pkl models untuk digunakan kembali
- **List Models**: Lihat daftar semua models yang tersimpan

Semua hasil analisis otomatis disimpan dalam format .pkl di folder `be/models/`.

## Cara Menjalankan Web

### 1. Menjalankan Frontend (Next.js)

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Jalankan development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Buka browser**:
   \`\`\`
   http://localhost:3000
   \`\`\`
   Anda akan melihat landing page dengan hero section dan feature cards.

4. **Build untuk production** (optional):
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

### 2. Menjalankan Backend (FastAPI)

1. **Masuk ke folder backend**:
   \`\`\`bash
   cd be
   \`\`\`

2. **Install dependencies Python**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Jalankan server FastAPI**:
   \`\`\`bash
   python main.py
   \`\`\`

4. **Backend akan berjalan di**:
   \`\`\`
   http://localhost:8000
   \`\`\`

5. **Akses API Documentation**:
   \`\`\`
   http://localhost:8000/docs
   \`\`\`

### Cara Menggunakan Aplikasi

1. **Landing Page** (`http://localhost:3000`):
   - Halaman pertama yang muncul
   - Lihat overview produk, features, dan engagement metrics
   - Klik tombol "Explore Dashboard" untuk mulai
   - Gunakan navbar di atas untuk navigasi

2. **Load Data** (via navbar atau klik tombol):
   - Upload file CSV untuk Disney dan Netflix
   - Atau klik tombol "Load Sample Data" untuk demo dengan data contoh
   - Setelah kedua dataset berhasil di-load, otomatis redirect ke dashboard
   - Data disimpan di sessionStorage
   - **Backend otomatis menyimpan models** ke .pkl files

3. **Comparison Dashboard** (via navbar atau setelah upload data):
   - Lihat 6 tabs analisis lengkap dengan berbagai visualisasi
   - Klik tab untuk berpindah antara Comparison, Engagement, Sentiment, Hashtags, Topics, dan Trends
   - Gunakan navbar untuk kembali ke Home atau Load Data kapan saja

### Navigasi Antar Halaman

Gunakan **navbar** di bagian atas untuk berpindah halaman:
- **Home**: Kembali ke landing page
- **Load Data**: Upload atau load data baru
- **Comparison Dashboard**: Lihat dashboard analytics (perlu data terlebih dahulu)

## Backend API Endpoints

Backend FastAPI menyediakan endpoints berikut:

- `GET /` - Root endpoint dengan list semua endpoints
- `GET /api/health` - Health check
- `POST /api/upload-csv` - Upload file CSV
- `POST /api/analyze-sentiment` - Analisis sentiment dan save ke .pkl
- `POST /api/extract-topics` - Extract topics dan save ke .pkl
- `GET /api/load-model/{username}/{model_type}` - Load saved model
- `GET /api/list-models` - List semua .pkl files tersimpan

### Model Storage (.pkl files)

Hasil analisis disimpan otomatis dalam format pickle (.pkl):
- `{username}_sentiment_model.pkl` - Sentiment analysis results
- `{username}_topic_model.pkl` - Topic modeling results

File .pkl ini dapat di-load kembali untuk konsistensi prediksi atau training lebih lanjut.

### Contoh Load Model di Backend

\`\`\`python
import pickle

# Load sentiment model
with open('be/models/disney_sentiment_model.pkl', 'rb') as f:
    sentiment_model = pickle.load(f)
    print(sentiment_model['sentiment'])
    print(sentiment_model['positive_pct'])

# Load topic model
with open('be/models/disney_topic_model.pkl', 'rb') as f:
    topic_model = pickle.load(f)
    print(topic_model['topics'])
    print(topic_model['total_tweets'])
\`\`\`

## Tech Stack

**Frontend:**
- Framework: Next.js 15 dengan App Router
- Language: TypeScript
- Styling: Tailwind CSS v4
- Charts: Recharts
- UI Components: shadcn/ui (Button, Card, Tabs, dll)
- Icons: Lucide React
- State Management: React hooks + sessionStorage

**Backend:**
- Framework: FastAPI (Python)
- Data Processing: Pandas
- Model Storage: Pickle
- CORS: FastAPI CORS middleware
- Server: Uvicorn

## Development Notes

- Frontend berjalan di `http://localhost:3000`
- Backend berjalan di `http://localhost:8000`
- Models disimpan di backend dalam format .pkl di folder `be/models/`
- Topic modeling menggunakan TF-IDF algorithm
- Sentiment analysis menggunakan keyword matching dengan lexicon
- Data sample tersedia untuk testing tanpa upload file
- Struktur folder mengikuti best practices Next.js 15 dan FastAPI

---

Dikembangkan dengan v0.app
