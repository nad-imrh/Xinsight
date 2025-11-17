'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [brandsData, setBrandsData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log("ENV CHECK:", process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    async function loadAllData() {
      try {
        const storedBrands =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('brandsData')
            : null

        console.log('[v0] Dashboard loading, checking stored brandsData...')
        console.log('[v0] brandsData exists:', !!storedBrands)

        if (!storedBrands) {
          console.log('[v0] Missing brandsData, redirecting to /load-data')
          router.push('/load-data')
          return
        }

        const parsed = JSON.parse(storedBrands)

        if (!Array.isArray(parsed) || parsed.length === 0) {
          console.log('[v0] brandsData is empty, redirecting to /load-data')
          router.push('/load-data')
          return
        }

        console.log(
          '[v0] brands loaded:',
          parsed.map((b: any) => ({
            brand: b.brand?.name ?? b.brand?.id,
            tweets:
              b.brand?.total_tweets ?? b.analytics?.engagement?.total_tweets,
          }))
        )

        // ✅ FETCH HASHTAGS UNTUK SETIAP BRAND
        const enrichedBrands = await Promise.all(
          parsed.map(async (brand: any) => {
            try {
              const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brand.brand.id}/hashtags`
              console.log('🔥 Fetching hashtags from:', url)

              const res = await fetch(url, { cache: 'no-store' })
              
              if (!res.ok) {
                console.error('❌ Hashtags fetch failed:', res.status, res.statusText)
                return brand
              }

              const json = await res.json()
              console.log('✅ HASHTAGS RESPONSE:', json)

              // ✅ PASTIKAN STRUKTUR DATA BENAR
              const hashtagsArray = json.hashtags || json.data || []
              
              console.log('📊 Hashtags array length:', hashtagsArray.length)
              console.log('📊 First hashtag:', hashtagsArray[0])

              return {
                ...brand,
                analytics: {
                  ...brand.analytics,
                  hashtags: hashtagsArray, // ✅ Langsung ambil array
                },
              }
            } catch (err) {
              console.error('❌ Error fetching hashtags:', err)
              return brand
            }
          })
        )

        console.log('🎯 Final enriched brands:', enrichedBrands)

        // Simpan hasil gabungan ke state
        setBrandsData(enrichedBrands)

        // Update sessionStorage
        sessionStorage.setItem('brandsData', JSON.stringify(enrichedBrands))
      } catch (error) {
        console.error('[v0] Error parsing brandsData:', error)
        router.push('/load-data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [router])

  // LOADING UI
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  // fallback
  if (!brandsData) return null

  return (
    <main className="min-h-screen bg-slate-950 py-8">
      <Dashboard brands={brandsData} />
    </main>
  )
}