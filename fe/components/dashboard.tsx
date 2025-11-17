'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ComparisonMetrics,
  type ComparisonAccount,
} from './components/comparison-metrics'
import { StatsCard } from './components/stats-card'
import { TweetEngagementChart } from './charts/tweet-engagement-chart'
import { FollowersGrowthChart } from './charts/followers-growth-chart'
import { SentimentAnalysisChart } from './charts/sentiment-analysis-chart'
import { HashtagPerformanceChart } from './charts/hashtag-performance-chart'
import { TopTweetsTable } from './components/top-tweets-table'
import { TopicModellingChart } from './charts/topic-modelling-chart'
import { TrendAnalysisChart } from './charts/trend-analysis-chart'
import {
  EnhancedAccount,
  SentimentData,
  Topic,
  TrendData,
  HashtagData,
} from '@/lib/types'

interface BackendBrandPayload {
  brand: {
    id: string
    name: string
    total_tweets: number
  }
  analytics: {
    engagement?: any
    sentiment?: any
    topics?: any
    hashtags?: any
  }
}

interface DashboardProps {
  brands?: BackendBrandPayload[]
}

function toSentimentData(sent: any): SentimentData {
  if (!sent) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
    }
  }

  return {
    positive: sent.positive_pct ?? sent.positive ?? 0,
    neutral: sent.neutral_pct ?? sent.neutral ?? 0,
    negative: sent.negative_pct ?? sent.negative ?? 0,
  }
}

function convertBackendBrandToEnhancedAccount(
  payload: BackendBrandPayload,
): EnhancedAccount {
  const { brand, analytics } = payload
  const eng = analytics?.engagement || {}
  const sent = analytics?.sentiment || {}
  const topics = analytics?.topics || {}

  // ✅ FIX: Ambil hashtags dengan benar
  const hashtagsRaw = analytics?.hashtags || []
  
  console.log('🔍 Converting brand:', brand.name)
  console.log('📊 Raw hashtags data:', hashtagsRaw)
  
  // ✅ FIX: Mapping hashtags yang benar
  const hashtagsList: HashtagData[] = Array.isArray(hashtagsRaw)
    ? hashtagsRaw.slice(0, 10).map((h: any): HashtagData => ({
        hashtag: h.hashtag ?? h.tag ?? '',
        tag: h.hashtag ?? h.tag ?? '',
        count: h.count ?? 0,
        engagement: h.total_engagement ?? h.avg_engagement ?? 0,
      }))
    : []

  console.log('✅ Mapped hashtags:', hashtagsList)

  const totalTweets = eng.total_tweets ?? brand.total_tweets ?? 0
  const topTweetsRaw = Array.isArray(eng.top_tweets) ? eng.top_tweets : []

  return {
    id: brand.id,
    username: brand.name,
    user_id_str: brand.id,
    total_tweets: totalTweets,
    tweets: totalTweets,
    followers: 0,
    engagement_rate: eng.engagement_rate ?? 0,
    sentiment: toSentimentData(sent),
    top_tweets: topTweetsRaw.map((t: any) => ({
      id_str: t.id_str ?? '',
      full_text: t.text ?? '',
      created_at: t.created_at ?? '',
      favorite_count: t.favorite_count ?? 0,
      retweet_count: t.retweet_count ?? 0,
      reply_count: 0,
      quote_count: 0,
      tweet_url: '',
    })),
    
    // ✅ FIX: Hanya satu property hashtags
    top_hashtags: hashtagsList,
    hashtags: hashtagsList,
    
    word_frequency: [],
    avg_tweet_length: undefined,
    posting_frequency: undefined,
    most_active_hour: undefined,

    topics: (topics.topics || []).map(
      (t: any): Topic => ({
        id: String(t.id ?? ''),
        label: t.label ?? '',
        keywords: t.keywords ?? [],
        weight: Array.isArray(t.weights) ? t.weights[0] ?? 0 : 0,
        tweetCount: t.tweet_count ?? 0,
      }),
    ),
    socialListening: {
      topMentions: [],
      topHashtags: hashtagsList.slice(0, 5),
      topKeywords: topics.top_keywords ?? [],
      mentionCount: 0,
      hashtagCount: hashtagsList.length,
      timeRange: '',
    },
    postingTimes: (eng.posting_hours || []).map((h: any) => ({
      hour: h.hour ?? 0,
      day_of_week: 0,
      count: h.engagement ?? 0,
      avgEngagement: h.engagement ?? 0,
    })),
    engagementMetrics: {
      totalEngagement: eng.total_engagement ?? 0,
      avgEngagementPerTweet: eng.avg_engagement ?? 0,
      engagementRate: eng.engagement_rate ?? 0,
      likeRate: 0,
      retweetRate: 0,
      replyRate: 0,
      quoteRate: 0,
    },
    trends: (eng.trend || []).map(
      (d: any): TrendData => ({
        date: d.date ?? '',
        count: d.engagement ?? 0,
        avgEngagement: d.engagement ?? 0,
        topHashtags: [],
      }),
    ),
    language_distribution: [],
    location_distribution: [],
  }
}

function calcTopTweetEngagement(acc: EnhancedAccount): number {
  if (!acc.top_tweets || acc.top_tweets.length === 0) return 0
  return acc.top_tweets.reduce((max, t) => {
    const eng =
      (t.favorite_count ?? 0) +
      (t.retweet_count ?? 0) +
      (t.reply_count ?? 0) +
      (t.quote_count ?? 0)
    return Math.max(max, eng)
  }, 0)
}

export function Dashboard({ brands }: DashboardProps) {
  console.log('🎯 Dashboard received brands:', brands)

  const enhancedAccounts: EnhancedAccount[] = Array.isArray(brands)
    ? brands.map(convertBackendBrandToEnhancedAccount)
    : []

  console.log('✅ Enhanced accounts:', enhancedAccounts)

  const fallbackA: EnhancedAccount = {
    id: 'brand_a',
    username: '@BrandA',
    user_id_str: 'brand_a',
    total_tweets: 1000,
    tweets: 1000,
    followers: 50000,
    engagement_rate: 4.5,
    sentiment: { positive: 60, neutral: 30, negative: 10 },
    top_tweets: [],
    top_hashtags: [],
    word_frequency: [],
    hashtags: [],
    avg_tweet_length: undefined,
    posting_frequency: undefined,
    most_active_hour: undefined,
    topics: [],
    socialListening: {
      topMentions: [],
      topHashtags: [],
      topKeywords: [],
      mentionCount: 0,
      hashtagCount: 0,
      timeRange: '',
    },
    postingTimes: [],
    engagementMetrics: {
      totalEngagement: 0,
      avgEngagementPerTweet: 0,
      engagementRate: 4.5,
      likeRate: 0,
      retweetRate: 0,
      replyRate: 0,
      quoteRate: 0,
    },
    trends: [],
    language_distribution: [],
    location_distribution: [],
  }

  const fallbackB: EnhancedAccount = {
    ...fallbackA,
    id: 'brand_b',
    username: '@BrandB',
    user_id_str: 'brand_b',
    total_tweets: 1500,
    tweets: 1500,
    followers: 80000,
    engagement_rate: 5.1,
    sentiment: { positive: 70, neutral: 20, negative: 10 },
  }

  const accA = enhancedAccounts[0] ?? fallbackA
  const accB = enhancedAccounts[1] ?? fallbackB

  // ✅ FIX: Pastikan hashtags tidak di-overwrite
  const safeA = {
    ...accA,
    tweets: accA.tweets ?? accA.total_tweets ?? 0,
    total_tweets: accA.total_tweets ?? accA.tweets ?? 0,
    followers: accA.followers ?? 0,
    engagement_rate: accA.engagement_rate ?? 0,
    hashtags: Array.isArray(accA.hashtags) && accA.hashtags.length > 0
      ? accA.hashtags
      : Array.isArray(accA.top_hashtags) && accA.top_hashtags.length > 0
      ? accA.top_hashtags
      : [],
    topics: Array.isArray(accA.topics) ? accA.topics : [],
    trends: Array.isArray(accA.trends) ? accA.trends : [],
  }

  const safeB = {
    ...accB,
    tweets: accB.tweets ?? accB.total_tweets ?? 0,
    total_tweets: accB.total_tweets ?? accB.tweets ?? 0,
    followers: accB.followers ?? 0,
    engagement_rate: accB.engagement_rate ?? 0,
    hashtags: Array.isArray(accB.hashtags) && accB.hashtags.length > 0
      ? accB.hashtags
      : Array.isArray(accB.top_hashtags) && accB.top_hashtags.length > 0
      ? accB.top_hashtags
      : [],
    topics: Array.isArray(accB.topics) ? accB.topics : [],
    trends: Array.isArray(accB.trends) ? accB.trends : [],
  }

  console.log('🎯 Safe accounts hashtags:', {
    brandA: safeA.username,
    hashtagsA: safeA.hashtags,
    brandB: safeB.username,
    hashtagsB: safeB.hashtags,
  })

  const hasAtLeastTwoBrands = enhancedAccounts.length >= 2
  const isComparison = hasAtLeastTwoBrands

  const comparisonAccounts: ComparisonAccount[] = enhancedAccounts.map((acc) => ({
    username: acc.username,
    tweets: acc.total_tweets,
    followers: acc.followers,
    engagement_rate: acc.engagement_rate,
    sentiment_positive: acc.sentiment?.positive ?? 0,
  }))

  const topEngagementA = calcTopTweetEngagement(safeA)
  const brandStyleA: 'disney' | 'netflix' = 'disney'
  const brandStyleB: 'disney' | 'netflix' = 'netflix'

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {isComparison
                ? `${safeA.username} vs ${safeB.username} Twitter Analytics`
                : 'Twitter Analytics Dashboard'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isComparison
                ? 'Advanced analytics and comparison metrics'
                : 'Comprehensive performance insights and metrics'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {hasAtLeastTwoBrands && (
          <div className="mb-8">
            <ComparisonMetrics brands={comparisonAccounts.slice(0, 2)} />
          </div>
        )}

        {!isComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Followers"
              value={`${(safeA.followers / 1000).toFixed(1)}K`}
              change="+12.5%"
            />
            <StatsCard
              title="Avg. Engagement"
              value={`${safeA.engagement_rate}%`}
              change="+2.1%"
            />
            <StatsCard
              title="Total Tweets"
              value={safeA.total_tweets.toLocaleString()}
              change="+45"
            />
            <StatsCard
              title="Top Tweet Engagement"
              value={`${(topEngagementA / 1000).toFixed(1)}K`}
              change="+18.3%"
            />
          </div>
        )}

        <Tabs defaultValue={isComparison ? 'comparison' : 'overview'} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-slate-900">
            {isComparison ? (
              <>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="hashtags">Top Hashtags</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </>
            )}
          </TabsList>

          {isComparison ? (
            <>
              <TabsContent value="comparison" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeA.username} — Engagement Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TweetEngagementChart />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeB.username} — Engagement Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TweetEngagementChart />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeA.username} — Sentiment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SentimentAnalysisChart
                        sentiment={safeA.sentiment}
                        brand={brandStyleA}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeB.username} — Sentiment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SentimentAnalysisChart
                        sentiment={safeB.sentiment}
                        brand={brandStyleB}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeA.username} — Top Hashtags Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HashtagPerformanceChart
                        hashtags={safeA.hashtags}
                        brand={brandStyleA}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {safeB.username} — Top Hashtags Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HashtagPerformanceChart
                        hashtags={safeB.hashtags}
                        brand={brandStyleB}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="topics" className="space-y-6">
                <TopicModellingChart
                  topics={safeA.topics}
                  title={`${safeA.username} — Topic Analysis`}
                  brand={brandStyleA}
                />
                <TopicModellingChart
                  topics={safeB.topics}
                  title={`${safeB.username} — Topic Analysis`}
                  brand={brandStyleB}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <TrendAnalysisChart
                  data={safeA.trends}
                  title={`${safeA.username} — Trend Analysis`}
                  brand={brandStyleA}
                />
                <TrendAnalysisChart
                  data={safeB.trends}
                  title={`${safeB.username} — Trend Analysis`}
                  brand={brandStyleB}
                />
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Account Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Tweets</span>
                        <span className="text-white font-semibold">
                          {safeA.total_tweets.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Followers</span>
                        <span className="text-white font-semibold">
                          {(safeA.followers / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Engagement Rate</span>
                        <span className="text-white font-semibold">
                          {safeA.engagement_rate}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Top Tweets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TopTweetsTable />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Tweet Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TweetEngagementChart />
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Followers Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FollowersGrowthChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SentimentAnalysisChart
                      sentiment={safeA.sentiment}
                      brand={brandStyleA}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Hashtag Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HashtagPerformanceChart
                      hashtags={safeA.hashtags}
                      brand={brandStyleA}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="topics" className="space-y-6">
                <TopicModellingChart
                  topics={safeA.topics}
                  title="Topic Modelling Analysis"
                  brand={brandStyleA}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <TrendAnalysisChart
                  data={safeA.trends}
                  title="Trend Analysis"
                  brand={brandStyleA}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}