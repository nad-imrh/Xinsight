'use client'
import React from 'react'
import Link from 'next/link'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/dashboard'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [disneyData, setDisneyData] = useState(null)
  const [netflixData, setNetflixData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedDisneyData = sessionStorage.getItem('disneyData')
    const storedNetflixData = sessionStorage.getItem('netflixData')
    
    console.log('[v0] Dashboard loading, checking stored data...')
    console.log('[v0] Disney exists:', !!storedDisneyData)
    console.log('[v0] Netflix exists:', !!storedNetflixData)
    
    if (storedDisneyData && storedNetflixData) {
      try {
        const disney = JSON.parse(storedDisneyData)
        const netflix = JSON.parse(storedNetflixData)
        
        console.log('[v0] Data loaded - Disney tweets:', disney.total_tweets, 'Netflix tweets:', netflix.total_tweets)
        
        setDisneyData(disney)
        setNetflixData(netflix)
        setIsLoading(false)
      } catch (error) {
        console.error('[v0] Error parsing data:', error)
        router.push('/load-data')
      }
    } else {
      console.log('[v0] Missing data, redirecting to load-data')
      router.push('/load-data')
    }
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (!disneyData || !netflixData) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 py-8">
      <Dashboard disneyData={disneyData} netflixData={netflixData} />
    </main>
  )
}
