'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComparisonMetrics } from './components/comparison-metrics'
import { StatsCard } from './components/stats-card'
import { TweetEngagementChart } from './charts/tweet-engagement-chart'
import { FollowersGrowthChart } from './charts/followers-growth-chart'
import { SentimentAnalysisChart } from './charts/sentiment-analysis-chart'
import { HashtagPerformanceChart } from './charts/hashtag-performance-chart'
import { TweetSourceChart } from './charts/tweet-source-chart'
import { TopTweetsTable } from './components/top-tweets-table'
import { TopicModellingChart } from './charts/topic-modelling-chart'
import { AudienceInsightsChart } from './charts/audience-insights-chart'
import { PostingTimeHeatmap } from './charts/posting-time-heatmap'
import { TrendAnalysisChart } from './charts/trend-analysis-chart'
import { EngagementAnalysisChart } from './charts/engagement-analysis-chart'

interface Account {
  id: string
  username: string
  tweets?: number
  total_tweets?: number
  followers: number
  engagement_rate: number
  sentiment?: { positive: number; negative: number; neutral: number }
  sentiment_positive?: number
  sentiment_negative?: number
  sentiment_neutral?: number
  top_tweet_text?: string
  top_tweet_engagement?: number
  top_tweets?: Array<{ full_text: string; favorite_count: number; retweet_count: number }>
  hashtags?: Array<{ tag: string; count: number }>
  top_hashtags?: Array<{ tag: string; count: number }>
  word_frequency?: Array<{ word: string; count: number }>
  topics?: Array<{ id: string; label: string; keywords: string[]; weight: number; tweetCount: number }>
  postingTimes?: Array<{ hour: number; count: number; avgEngagement: number }>
  engagementMetrics?: { totalEngagement: number; avgEngagementPerTweet: number; likeRate: number; retweetRate: number; replyRate: number; quoteRate: number }
  trends?: Array<{ date: string; count: number; avgEngagement: number; topHashtags: string[] }>
  socialListening?: { topMentions: string[]; topHashtags: string[]; topKeywords: string[] }
}

interface DashboardProps {
  disneyData?: Account
  netflixData?: Account
}

export function Dashboard({ disneyData, netflixData }: DashboardProps) {
  const disney = disneyData || {
    id: 'disney',
    username: '@Disney',
    tweets: 1243,
    followers: 125400,
    engagement_rate: 4.8,
    sentiment_positive: 65,
    sentiment_negative: 10,
    sentiment_neutral: 25,
    top_tweet_text: 'Magical moments await!',
    top_tweet_engagement: 45000,
    hashtags: [
      { tag: '#Disney', count: 450 },
      { tag: '#Magic', count: 380 },
      { tag: '#Entertainment', count: 320 },
      { tag: '#Family', count: 290 }
    ],
    word_frequency: [
      { word: 'magical', count: 245 },
      { word: 'adventure', count: 198 },
      { word: 'characters', count: 167 },
      { word: 'stories', count: 156 }
    ]
  }

  const netflix = netflixData || {
    id: 'netflix',
    username: '@netflix',
    tweets: 1564,
    followers: 89200,
    engagement_rate: 5.2,
    sentiment_positive: 72,
    sentiment_negative: 8,
    sentiment_neutral: 20,
    top_tweet_text: 'New releases every week!',
    top_tweet_engagement: 52000,
    hashtags: [
      { tag: '#Netflix', count: 520 },
      { tag: '#Binge', count: 410 },
      { tag: '#Content', count: 345 },
      { tag: '#Series', count: 312 }
    ],
    word_frequency: [
      { word: 'binge', count: 287 },
      { word: 'watch', count: 234 },
      { word: 'series', count: 201 },
      { word: 'amazing', count: 189 }
    ]
  }

  const safeDisneyData = disneyData 
    ? {
        ...disneyData,
        hashtags: Array.isArray(disneyData.hashtags) ? disneyData.hashtags : Array.isArray(disneyData.top_hashtags) ? disneyData.top_hashtags : [],
        word_frequency: Array.isArray(disneyData.word_frequency) ? disneyData.word_frequency : [],
        total_tweets: disneyData.total_tweets || disneyData.tweets || 0,
        topics: Array.isArray(disneyData.topics) ? disneyData.topics : [],
        postingTimes: Array.isArray(disneyData.postingTimes) ? disneyData.postingTimes : [],
        engagementMetrics: disneyData.engagementMetrics || {},
        trends: Array.isArray(disneyData.trends) ? disneyData.trends : [],
        socialListening: disneyData.socialListening || {}
      }
    : disney

  const safeNetflixData = netflixData
    ? {
        ...netflixData,
        hashtags: Array.isArray(netflixData.hashtags) ? netflixData.hashtags : Array.isArray(netflixData.top_hashtags) ? netflixData.top_hashtags : [],
        word_frequency: Array.isArray(netflixData.word_frequency) ? netflixData.word_frequency : [],
        total_tweets: netflixData.total_tweets || netflixData.tweets || 0,
        topics: Array.isArray(netflixData.topics) ? netflixData.topics : [],
        postingTimes: Array.isArray(netflixData.postingTimes) ? netflixData.postingTimes : [],
        engagementMetrics: netflixData.engagementMetrics || {},
        trends: Array.isArray(netflixData.trends) ? netflixData.trends : [],
        socialListening: netflixData.socialListening || {}
      }
    : netflix

  const isComparison = disneyData && netflixData

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {isComparison ? 'Disney vs Netflix Twitter Analytics' : 'Twitter Analytics Dashboard'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isComparison ? 'Advanced analytics and comparison metrics' : 'Comprehensive performance insights and metrics'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isComparison && (
          <div className="mb-8">
            <ComparisonMetrics disneyData={disney} netflixData={netflix} />
          </div>
        )}

        {!isComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Followers" value={`${(safeDisneyData.followers / 1000).toFixed(1)}K`} change="+12.5%" />
            <StatsCard title="Avg. Engagement" value={`${safeDisneyData.engagement_rate}%`} change="+2.1%" />
            <StatsCard title="Total Tweets" value={(safeDisneyData.total_tweets || 0).toLocaleString()} change="+45" />
            <StatsCard title="Top Tweet Engagement" value={`${(safeDisneyData.top_tweet_engagement / 1000).toFixed(0)}K`} change="+18.3%" />
          </div>
        )}

        <Tabs defaultValue={isComparison ? "comparison" : "overview"} className="w-full">
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
                      <CardTitle className="text-white">Disney - Engagement Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TweetEngagementChart />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Netflix - Engagement Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TweetEngagementChart />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Disney - Top Hashtags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(safeDisneyData.hashtags || []).map((h, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-slate-300">{h.tag}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${(h.count / 520) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-slate-400 text-sm w-8">{h.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Netflix - Top Hashtags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(safeNetflixData.hashtags || []).map((h, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-slate-300">{h.tag}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${(h.count / 520) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-slate-400 text-sm w-8">{h.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Disney - Followers Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FollowersGrowthChart />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Netflix - Followers Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FollowersGrowthChart />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Disney - Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SentimentAnalysisChart sentiment={safeDisneyData.sentiment} brand="disney" />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Netflix - Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SentimentAnalysisChart sentiment={safeNetflixData.sentiment} brand="netflix" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Disney - Top Hashtags Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HashtagPerformanceChart hashtags={safeDisneyData.hashtags} brand="disney" />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Netflix - Top Hashtags Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HashtagPerformanceChart hashtags={safeNetflixData.hashtags} brand="netflix" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="topics" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <TopicModellingChart 
                    topics={safeDisneyData.topics || []} 
                    title="Disney - Topic Analysis" 
                    brand="disney"
                  />
                  <TopicModellingChart 
                    topics={safeNetflixData.topics || []} 
                    title="Netflix - Topic Analysis" 
                    brand="netflix"
                  />
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <TrendAnalysisChart 
                    data={safeDisneyData.trends || []} 
                    title="Disney - Trend Analysis" 
                    brand="disney"
                  />
                  <TrendAnalysisChart 
                    data={safeNetflixData.trends || []} 
                    title="Netflix - Trend Analysis" 
                    brand="netflix"
                  />
                </div>
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
                        <span className="text-white font-semibold">{safeDisneyData.tweets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Followers</span>
                        <span className="text-white font-semibold">{(safeDisneyData.followers / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Engagement Rate</span>
                        <span className="text-white font-semibold">{safeDisneyData.engagement_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Top Tweet Engagement</span>
                        <span className="text-white font-semibold">{(safeDisneyData.top_tweet_engagement / 1000).toFixed(0)}K</span>
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
                    <SentimentAnalysisChart sentiment={safeDisneyData.sentiment} brand="disney" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Hashtag Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HashtagPerformanceChart hashtags={safeDisneyData.hashtags} brand="disney" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="topics" className="space-y-6">
                <TopicModellingChart 
                  topics={safeDisneyData.topics || []} 
                  title="Topic Modelling Analysis" 
                  brand="disney"
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <TrendAnalysisChart 
                  data={safeDisneyData.trends || []} 
                  title="Trend Analysis" 
                  brand="disney"
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}
