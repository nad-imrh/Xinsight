'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Check, Upload } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
const MAX_BRANDS = 5

type BackendBrandPayload = {
  brand?: {
    id: string
    name: string
    total_tweets: number
  }
  analytics?: any
}

export function DataUpload() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedBrands, setUploadedBrands] = useState<BackendBrandPayload[]>([])
  const [lastSuccess, setLastSuccess] = useState<string | null>(null)

  // ❗ Reset state & sessionStorage setiap kali halaman ini di-mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('brandsData')
      } catch {
        // ignore error
      }
    }
    setUploadedBrands([])
    setSelectedFile(null)
    setLastSuccess(null)
    setError('')
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setLastSuccess(null)
    }
  }

  const saveBrandToSession = (
    payload: BackendBrandPayload,
  ): BackendBrandPayload[] => {
    const existingRaw =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('brandsData')
        : null
    const existing: BackendBrandPayload[] = existingRaw
      ? JSON.parse(existingRaw)
      : []

    if (existing.length >= MAX_BRANDS) {
      throw new Error(`Maximum ${MAX_BRANDS} brands reached`)
    }

    const filtered = existing.filter((b) => b.brand?.id !== payload.brand?.id)
    const updated = [...filtered, payload]

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('brandsData', JSON.stringify(updated))
    }
    setUploadedBrands(updated)
    return updated
  }

  const uploadToBackend = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/api/upload-csv`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Backend error (${res.status}): ${text}`)
    }

    const json = await res.json()
    return json as BackendBrandPayload
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file')
      return
    }

    if (uploadedBrands.length >= MAX_BRANDS) {
      setError(`You already uploaded ${MAX_BRANDS} brands`)
      return
    }

    setLoading(true)
    setError('')
    setLastSuccess(null)

    try {
      console.log('[v0] Uploading file to backend...', selectedFile.name)
      const payload = await uploadToBackend(selectedFile)
      console.log('[v0] Backend response:', payload)

      if (!payload.brand?.id) {
        throw new Error('Invalid backend response: brand.id missing')
      }

      const updated = saveBrandToSession(payload)
      setLastSuccess(`Brand "${payload.brand.name}" processed successfully!`)
      setSelectedFile(null)

      console.log('[v0] Total brands stored:', updated.length)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process CSV'
      console.error('[v0] Upload error:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const brandsCount = uploadedBrands.length
  const canUploadMore = brandsCount < MAX_BRANDS

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastSuccess && (
        <Alert className="bg-green-900/20 border-green-800">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-300">
            {lastSuccess}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Upload Brand CSV</CardTitle>
          <CardDescription>
            Upload satu CSV per brand (misalnya <b>disney.csv</b>, <b>netflix.csv</b>,{' '}
            <b>hbo.csv</b>). Nama brand akan diambil dari nama file dan di-capitalize
            otomatis. Maksimal {MAX_BRANDS} brand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading || !canUploadMore}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    {canUploadMore ? 'Click to upload CSV' : 'Maximum brands reached'}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {canUploadMore
                      ? 'CSV with tweets for any brand'
                      : `You have already uploaded ${MAX_BRANDS} brands`}
                  </p>
                </div>
                {selectedFile && (
                  <p className="text-slate-300 text-xs mt-1">{selectedFile.name}</p>
                )}
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              Brands uploaded:{' '}
              <span className="text-white font-semibold">{brandsCount}</span> /{' '}
              {MAX_BRANDS}
            </p>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || loading || !canUploadMore}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload & Analyze'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadedBrands.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Uploaded Brands</CardTitle>
            <CardDescription>
              Brand yang sudah dianalisis oleh backend. Kamu bisa upload lagi untuk
              brand lain, maksimal {MAX_BRANDS} brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedBrands.map((item, idx) => (
                <div
                  key={item.brand?.id ?? idx}
                  className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-2 bg-slate-950/50"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {item.brand?.name ?? item.brand?.id ?? `Brand ${idx + 1}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {item.brand?.total_tweets ?? 0} tweets analyzed
                    </p>
                  </div>
                  <span className="text-slate-500 text-xs">
                    id: {item.brand?.id ?? '-'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-slate-400 text-xs">
                At least 2 brands recommended for comparison dashboard.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToDashboard}
                disabled={uploadedBrands.length === 0}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
