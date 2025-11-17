// Advanced analytics calculations
import { Tweet, PostingTimeData, EngagementMetrics, TrendData, SocialListeningData, Topic } from './types'
import { topicModeller } from './topic-modelling'

export function analyzePostingTimes(tweets: Tweet[]): PostingTimeData[] {
  const hourlyData = new Array(24).fill(0).map((_, i) => ({
    hour: i,
    count: 0,
    avgEngagement: 0
  }))

  tweets.forEach(tweet => {
    const date = new Date(tweet.created_at)
    const hour = date.getHours()
    hourlyData[hour].count++
    hourlyData[hour].avgEngagement += tweet.engagement
  })

  hourlyData.forEach(data => {
    if (data.count > 0) {
      data.avgEngagement = data.avgEngagement / data.count
    }
  })

  return hourlyData
}

export function analyzeEngagementMetrics(tweets: Tweet[], topics: Topic[]): EngagementMetrics {
  const totalEngagement = tweets.reduce((sum, t) => sum + t.engagement, 0)
  const avgEngagementPerTweet = tweets.length > 0 ? totalEngagement / tweets.length : 0
  const totalEngagementElements = tweets.reduce((sum, t) => sum + t.likes + t.retweets + t.replies, 0)
  const totalInteractions = tweets.reduce((sum, t) => sum + (t.likes + t.retweets + t.replies), 0)

  const engagementByTopic = topics.map(topic => ({
    topic: topic.label,
    engagement: tweets
      .filter(t => topic.keywords.some(kw => t.text.toLowerCase().includes(kw)))
      .reduce((sum, t) => sum + t.engagement, 0)
  }))

  return {
    totalEngagement,
    avgEngagementPerTweet,
    engagementRate: tweets.length > 0 ? (totalEngagement / (tweets.length * 100)) * 100 : 0,
    likeRate: totalEngagementElements > 0 ? (tweets.reduce((sum, t) => sum + t.likes, 0) / totalEngagementElements) * 100 : 0,
    retweetRate: totalEngagementElements > 0 ? (tweets.reduce((sum, t) => sum + t.retweets, 0) / totalEngagementElements) * 100 : 0,
    replyRate: totalEngagementElements > 0 ? (tweets.reduce((sum, t) => sum + t.replies, 0) / totalEngagementElements) * 100 : 0,
    engagementByTopic
  }
}

export function analyzeTrends(tweets: Tweet[]): TrendData[] {
  const trendMap = new Map<string, TrendData>()

  tweets.forEach(tweet => {
    const date = new Date(tweet.created_at)
    const dateStr = date.toISOString().split('T')[0]

    if (!trendMap.has(dateStr)) {
      trendMap.set(dateStr, {
        date: dateStr,
        count: 0,
        avgEngagement: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        topTopic: ''
      })
    }

    const trend = trendMap.get(dateStr)!
    trend.count++
    trend.avgEngagement += tweet.engagement
  })

  return Array.from(trendMap.values())
    .map(trend => ({
      ...trend,
      avgEngagement: trend.count > 0 ? trend.avgEngagement / trend.count : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function analyzeSocialListening(
  tweets: Tweet[],
  topics: Topic[],
  wordFrequency: Array<{ word: string; count: number }> = []
): SocialListeningData {
  const safeWordFrequency = wordFrequency || []
  const safeTweets = tweets || []
  
  // Extract hashtags and mentions
  const hashtags = new Set<string>()
  safeTweets.forEach(tweet => {
    const hashtagMatches = tweet.text.match(/#\w+/g) || []
    hashtagMatches.forEach(tag => hashtags.add(tag))
  })

  return {
    mentions: safeTweets.length,
    hashtags: Array.from(hashtags).slice(0, 20),
    keywords: safeWordFrequency.slice(0, 20).map(w => w.word),
    trendingTopics: topics.slice(0, 5),
    mentionSentiment: {
      positive: 0,
      neutral: 0,
      negative: 0
    },
    timeRange: 'Last 30 days'
  }
}
