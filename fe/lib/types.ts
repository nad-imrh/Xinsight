// lib/types.ts

export interface Tweet {
  id_str: string
  full_text: string
  created_at: string
  favorite_count: number
  retweet_count: number
  reply_count: number
  quote_count: number
  tweet_url: string
  image_url?: string
  in_reply_to_screen_name?: string
}

export interface HashtagData {
  tag: string
  count: number
  engagement?: number
  percentage?: number
}

export interface WordFrequency {
  word: string
  count: number
}

export interface SentimentData {
  positive: number
  neutral: number
  negative: number
  positiveExamples?: Tweet[]
  neutralExamples?: Tweet[]
  negativeExamples?: Tweet[]
}

export interface PostingTimeData {
  hour: number
  day_of_week: number
  count: number
  avgEngagement: number
}

export interface EngagementMetrics {
  totalEngagement: number
  avgEngagementPerTweet: number
  engagementRate: number
  likeRate: number
  retweetRate: number
  replyRate: number
  quoteRate: number
}

export interface TrendData {
  date: string
  count: number
  avgEngagement: number
  topHashtags: string[]
}

export interface Topic {
  id: string
  label: string
  keywords: string[]
  weight: number
  tweetCount: number
}

export interface SocialListeningData {
  topMentions: string[]
  topHashtags: string[]
  topKeywords: string[]
  mentionCount: number
  hashtagCount: number
  timeRange: string
}

export interface Account {
  id: string
  username: string
  user_id_str: string
  total_tweets: number
  followers: number
  engagement_rate: number
  sentiment: SentimentData
  top_tweets: Tweet[]
  top_hashtags: HashtagData[]
  word_frequency: WordFrequency[]

  // ⬇️ tambahan supaya sesuai dengan yang dipakai di Dashboard
  tweets?: number
  hashtags?: HashtagData[]
  top_tweet_text?: string
  top_tweet_engagement?: number

  avg_tweet_length?: number
  posting_frequency?: number
  most_active_hour?: number
}

export interface EnhancedAccount extends Account {
  topics: Topic[]
  socialListening: SocialListeningData
  postingTimes: PostingTimeData[]
  engagementMetrics: EngagementMetrics
  trends: TrendData[]
  language_distribution: { lang: string; count: number }[]
  location_distribution: { location: string; count: number }[]
}

export interface ComparisonData {
  disney: Account
  netflix: Account
}

export interface TweetRow {
  conversation_id_str: string
  id_str: string
  full_text: string
  created_at: string
  favorite_count: string
  retweet_count: string
  reply_count: string
  quote_count: string
  tweet_url: string
  user_id_str: string
  username: string
  image_url?: string
  in_reply_to_screen_name?: string
  lang?: string
  location?: string
}
