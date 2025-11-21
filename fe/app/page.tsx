'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp, BarChart3, Users, Target, Heart, Hash, MessageSquare, Clock } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
import { DataUpload } from '@/components/data-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(true)
  const [disneyData, setDisneyData] = useState(null)
  const [netflixData, setNetflixData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')

  useEffect(() => {
    if (disneyData && netflixData) {
      const timer = setTimeout(() => {
        setActiveTab('comparison')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [disneyData, netflixData])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/twitter-data')
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[v0] Data loaded successfully - Disney tweets:', data.disney.tweets, 'Netflix tweets:', data.netflix.tweets)
      
      setDisneyData(data.disney)
      setNetflixData(data.netflix)
      setError(null)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  if (showLanding) {
    return (
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
       <section className="relative min-h-screen flex items-center justify-center px-6 py-10 overflow-hidden -mt-10">



          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Unlock{' '}
                <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  X Insights
                </span>
                <br />
                That Matter
              </h1>
            
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                Transform your X (Twitter) data into actionable insights. Real-time analytics, trend detection, and audience engagement metrics all in one powerful platform.
              </p>
            
              <div className="flex gap-4">
                <Link href="/load-data">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6">
                    Explore Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          
            {/* Right - Engagement Card */}
            <div className="relative">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Engagement Rate</p>
                    <h2 className="text-6xl font-bold text-white">+348%</h2>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-screen flex justify-center items-center px-6 bg-gradient-to-b from-black to-slate-950">

          <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center">

            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white">Powerful Analytics Features</h2>
              <p className="text-slate-400 text-lg mt-2">Everything you need to understand your X (Twitter) performance</p>
              </div>

              <div className="grid grid-cols-3 gap-4">


              {[
                { icon: BarChart3, title: 'Comparison Analytics', desc: 'Compare multiple accounts side-by-side with detailed metrics' },
                { icon: Heart, title: 'Engagement Tracking', desc: 'Monitor likes, retweets, replies, and quote tweets in real-time' },
                { icon: MessageSquare, title: 'Sentiment Analysis', desc: 'Understand audience sentiment with AI-powered analysis' },
                { icon: Hash, title: 'Hashtag Performance', desc: 'Track trending hashtags and their engagement metrics' },
                { icon: TrendingUp, title: 'Trend Detection', desc: 'Identify emerging trends and patterns in your data' },
                { icon: Clock, title: 'Time Analysis', desc: 'Discover optimal posting times and temporal patterns' },
              ].map((feature, idx) => (
                <Card key={idx} className="bg-slate-900 border-slate-800 p-4 hover:border-purple-500/50 transition-colors">
                  <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  {React.createElement(feature.icon, { className: "w-5 h-5 text-purple-500" })}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-xs">{feature.desc}</p>
                  </Card>

              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-screen flex items-center justify-center px-6 bg-black">
          <div className="max-w-4xl mx-auto text-center h-full flex flex-col justify-center">

            <h2 className="text-4xl font-bold text-white mb-6">Ready to Unlock Your Insights?</h2>
            <p className="text-slate-400 text-lg mb-8">
              Start analyzing your X (Twitter) data today and discover actionable insights
              </p>

            <Link href="/load-data">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-12 py-6">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-950">
              <TabsTrigger value="upload" className="text-sm">Load Data</TabsTrigger>
              <TabsTrigger value="comparison" className="text-sm">Comparison Dashboard</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="upload" className="m-0 p-6">
          <DataUpload 
            onDisneyData={setDisneyData}
            onNetflixData={setNetflixData}
            onLoadData={loadData}
          />
        </TabsContent>

        <TabsContent value="comparison" className="m-0 p-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Error loading data: {error}</p>
            </div>
          ) : disneyData && netflixData ? (
            <Dashboard disneyData={disneyData} netflixData={netflixData} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">
                {disneyData || netflixData ? 'Waiting for both datasets...' : 'No data available. Please load data to continue.'}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Disney: {disneyData ? 'Ready' : 'Waiting'} | Netflix: {netflixData ? 'Ready' : 'Waiting'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
