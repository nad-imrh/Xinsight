'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [brandsData, setBrandsData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedBrands = typeof window !== 'undefined'
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
          tweets: b.brand?.total_tweets ?? b.analytics?.engagement?.total_tweets,
        }))
      )

      setBrandsData(parsed)
    } catch (error) {
      console.error('[v0] Error parsing brandsData:', error)
      router.push('/load-data')
    } finally {
      setIsLoading(false)
    }
  }, [router])

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

  if (!brandsData) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 py-8">
      {/* Dashboard sekarang menerima props generik: brands */}
      <Dashboard brands={brandsData} />
    </main>
  )
}