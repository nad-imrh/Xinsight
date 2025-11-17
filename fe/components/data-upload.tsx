'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Check, Upload } from 'lucide-react'
import { Account } from '@/lib/types'
import { parseCSV, convertToTweets, groupTweetsByUser } from '@/lib/csv-parser'
import { processAccountAnalytics, processEnhancedAnalytics } from '@/lib/advanced-analytics'

export function DataUpload() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [disneyFile, setDisneyFile] = useState<File | null>(null)
  const [netflixFile, setNetflixFile] = useState<File | null>(null)
  const [disneyProcessed, setDisneyProcessed] = useState(false)
  const [netflixProcessed, setNetflixProcessed] = useState(false)

  const handleDisneyUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDisneyFile(file)
      setDisneyProcessed(false)
    }
  }

  const handleNetflixUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNetflixFile(file)
      setNetflixProcessed(false)
    }
  }

  const processDisneyData = async () => {
    if (!disneyFile) {
      setError('Please select Disney CSV file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const content = await disneyFile.text()
      console.log('[v0] Disney CSV content length:', content.length)
      const rows = parseCSV(content)
      console.log('[v0] Disney CSV parsed rows:', rows.length)

      if (rows.length === 0) {
        throw new Error('No valid data found in Disney CSV')
      }

      const grouped = groupTweetsByUser(rows)
      const usernames = Object.keys(grouped)
      const username = usernames[0]

      const tweets = convertToTweets(grouped[username])
      const account = await processAccountAnalytics(tweets, username, `user_${username}`)
      const enhanced = await processEnhancedAnalytics(tweets, account)
      
      console.log('[v0] Disney data processed, saving to sessionStorage...')
      
      sessionStorage.setItem('disneyData', JSON.stringify(enhanced))
      setDisneyProcessed(true)
      
      console.log('[v0] Disney data saved successfully')
      
      const netflixData = sessionStorage.getItem('netflixData')
      if (netflixData) {
        console.log('[v0] Both datasets ready, redirecting...')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process Disney CSV'
      console.error('[v0] Disney processing error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const processNetflixData = async () => {
    if (!netflixFile) {
      setError('Please select Netflix CSV file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const content = await netflixFile.text()
      console.log('[v0] Netflix CSV content length:', content.length)
      const rows = parseCSV(content)
      console.log('[v0] Netflix CSV parsed rows:', rows.length)

      if (rows.length === 0) {
        throw new Error('No valid data found in Netflix CSV')
      }

      const grouped = groupTweetsByUser(rows)
      const usernames = Object.keys(grouped)
      const username = usernames[0]

      const tweets = convertToTweets(grouped[username])
      const account = await processAccountAnalytics(tweets, username, `user_${username}`)
      const enhanced = await processEnhancedAnalytics(tweets, account)
      
      console.log('[v0] Netflix data processed, saving to sessionStorage...')
      
      sessionStorage.setItem('netflixData', JSON.stringify(enhanced))
      setNetflixProcessed(true)
      
      console.log('[v0] Netflix data saved successfully')
      
      const disneyData = sessionStorage.getItem('disneyData')
      if (disneyData) {
        console.log('[v0] Both datasets ready, redirecting...')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process Netflix CSV'
      console.error('[v0] Netflix processing error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {disneyProcessed && netflixProcessed && (
        <Alert className="bg-green-900/20 border-green-800">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-300">Both datasets processed successfully! Redirecting to dashboard...</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Disney CSV</CardTitle>
            <CardDescription>
              Upload tweet data for Disney account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleDisneyUpload}
                  disabled={loading}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">Click to upload</p>
                    <p className="text-slate-400 text-xs">CSV with Disney tweets</p>
                  </div>
                  {disneyFile && (
                    <p className="text-slate-300 text-xs">{disneyFile.name}</p>
                  )}
                </div>
              </label>
            </div>

            <Button
              onClick={processDisneyData}
              disabled={!disneyFile || loading || disneyProcessed}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : disneyProcessed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Processed
                </>
              ) : (
                'Process Disney Data'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Netflix CSV</CardTitle>
            <CardDescription>
              Upload tweet data for Netflix account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleNetflixUpload}
                  disabled={loading}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">Click to upload</p>
                    <p className="text-slate-400 text-xs">CSV with Netflix tweets</p>
                  </div>
                  {netflixFile && (
                    <p className="text-slate-300 text-xs">{netflixFile.name}</p>
                  )}
                </div>
              </label>
            </div>

            <Button
              onClick={processNetflixData}
              disabled={!netflixFile || loading || netflixProcessed}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : netflixProcessed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Processed
                </>
              ) : (
                'Process Netflix Data'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Analytics Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>✓ Topic Modelling (LDA-based topic extraction)</li>
            <li>✓ Sentiment Analysis (positive/neutral/negative)</li>
            <li>✓ Social Listening (mentions, hashtags, keywords)</li>
            <li>✓ Engagement Analysis (likes, retweets, replies, quotes)</li>
            <li>✓ Trend Analysis (temporal patterns and trends)</li>
            <li>✓ Posting Time Analysis (optimal posting hours)</li>
            <li>✓ Hashtag Performance & Word Frequency</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
