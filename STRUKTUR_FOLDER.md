# Penjelasan Struktur Folder X Analytics

Dokumen ini menjelaskan struktur folder proyek X Analytics dengan bahasa yang mudah dipahami.

## Struktur Lengkap

\`\`\`
x-analytics/
│
├── app/                    # FRONTEND - Halaman Web
├── components/             # FRONTEND - Komponen UI
├── lib/                    # FRONTEND - Helper Functions
├── be/                     # BACKEND - Server & API
├── public/                 # Static Files (gambar, icon)
└── package.json            # Konfigurasi Frontend
\`\`\`

---

## Detail Setiap Folder

### 1. Folder `app/` (FRONTEND)

**Fungsi:** Berisi semua **halaman web** yang dilihat user di browser

**Isi:**
- `page.tsx` - Halaman Home (Landing Page)
- `layout.tsx` - Template layout dengan navbar
- `globals.css` - CSS styling global
- `load-data/page.tsx` - Halaman untuk upload CSV
- `dashboard/page.tsx` - Halaman dashboard perbandingan

**Analogi:** Seperti "buku menu" di restoran - menampilkan apa yang user bisa lihat dan klik

---

### 2. Folder `components/` (FRONTEND)

**Fungsi:** Berisi **komponen UI yang bisa dipakai ulang** (reusable)

**Isi:**
- `navbar.tsx` - Navigation bar di atas
- `dashboard.tsx` - Komponen dashboard utama
- `data-upload.tsx` - Form upload file CSV
- `charts/` - Folder berisi chart visualisasi (line, bar, pie, dll)
- `components/` - UI components kecil (button, card, stats, dll)

**Analogi:** Seperti "lego blocks" - bisa disusun dan dipakai berkali-kali untuk membuat halaman

---

### 3. Folder `lib/` (FRONTEND)

**Fungsi:** Berisi **helper functions dan utilities** untuk processing data

**Isi:**
- `analytics.ts` - Fungsi analisis data
- `advanced-analytics.ts` - Sentiment analysis
- `topic-modelling.ts` - Topic extraction
- `types.ts` - TypeScript type definitions
- `utils.ts` - Utility functions umum

**Analogi:** Seperti "toolbox" berisi alat-alat bantu untuk mengolah data

---

### 4. Folder `be/` (BACKEND)

**Fungsi:** Berisi **server backend** untuk processing data dan API

**Isi:**
- `main.py` - FastAPI server utama
- `requirements.txt` - Daftar library Python yang dibutuhkan
- `README.md` - Dokumentasi backend
- `models/` - Folder penyimpanan file .pkl (hasil analisis)

**Fitur Backend:**
1. Upload CSV file
2. Sentiment Analysis → save ke .pkl
3. Topic Modeling → save ke .pkl
4. Load saved models dari .pkl
5. List semua models tersimpan

**Analogi:** Seperti "dapur" di restoran - tempat processing dan memasak data

---

### 5. Folder `public/`

**Fungsi:** Menyimpan **file static** seperti gambar, icon, fonts

**Contoh isi:**
- Logo
- Icon
- Gambar ilustrasi
- Font files

**Analogi:** Seperti "gudang assets" yang bisa diakses langsung

---

## Alur Kerja Aplikasi

\`\`\`
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Buka browser
       ▼
┌─────────────────────────────┐
│   Frontend (Next.js)        │
│   - app/                    │ ← Halaman yang dilihat user
│   - components/             │ ← UI components
│   - lib/                    │ ← Processing di browser
└──────┬──────────────────────┘
       │
       │ 2. Upload CSV atau request API
       ▼
┌─────────────────────────────┐
│   Backend (FastAPI)         │
│   - be/main.py              │ ← Server API
│   - be/models/              │ ← Save .pkl files
└─────────────────────────────┘
\`\`\`

---

## Perbedaan Frontend vs Backend

| Aspek | Frontend | Backend |
|-------|----------|---------|
| **Lokasi Folder** | `app/`, `components/`, `lib/` | `be/` |
| **Bahasa** | TypeScript/JavaScript | Python |
| **Framework** | Next.js, React | FastAPI |
| **Fungsi** | Tampilan & Interface | Processing & API |
| **Berjalan di** | Browser user | Server |
| **Port** | `http://localhost:3000` | `http://localhost:8000` |

---

## Kenapa Tidak Ada Folder `fe/`?

Anda mungkin bertanya: "Kenapa frontend tidak ada di folder `fe/` seperti backend di `be/`?"

**Jawaban:**
- Next.js **HARUS** memiliki folder `app/` di root level agar bisa berjalan
- Jika kita pindahkan ke `fe/app/`, aplikasi tidak akan berfungsi
- Struktur saat ini sudah mengikuti **best practices Next.js**

**Solusi:**
Kita tidak perlu folder `fe/` karena semua folder di luar `be/` sudah jelas adalah **frontend**:
- ✅ `app/` = Frontend
- ✅ `components/` = Frontend  
- ✅ `lib/` = Frontend
- ✅ `be/` = Backend

---

## Kesimpulan

Struktur folder saat ini sudah **rapi dan terorganisir** dengan pemisahan yang jelas:

**Frontend (Tampilan Web):**
\`\`\`
app/, components/, lib/
\`\`\`

**Backend (Server & API):**
\`\`\`
be/
\`\`\`

Tidak ada file yang berantakan atau duplikat. Semuanya sudah di tempat yang benar!

---

**Pertanyaan?** Baca dokumentasi lengkap di `README.md`
