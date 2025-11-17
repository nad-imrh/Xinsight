import { Account, TweetRow, EnhancedAccount } from './types'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateTweet(row: any): TweetRow {
  const errors: string[] = []

  if (!row.id_str) errors.push('id_str is required')
  if (!row.full_text) errors.push('full_text is required')
  if (!row.created_at) errors.push('created_at is required')
  if (row.favorite_count === undefined || isNaN(parseInt(row.favorite_count))) {
    errors.push('favorite_count must be a valid number')
  }
  if (row.retweet_count === undefined || isNaN(parseInt(row.retweet_count))) {
    errors.push('retweet_count must be a valid number')
  }
  if (row.reply_count === undefined || isNaN(parseInt(row.reply_count))) {
    errors.push('reply_count must be a valid number')
  }

  if (errors.length > 0) {
    throw new ValidationError(`Invalid tweet: ${errors.join(', ')}`)
  }

  return {
    conversation_id_str: row.conversation_id_str || '',
    id_str: row.id_str,
    full_text: row.full_text,
    created_at: row.created_at,
    favorite_count: row.favorite_count,
    retweet_count: row.retweet_count,
    reply_count: row.reply_count,
    quote_count: row.quote_count || '0',
    tweet_url: row.tweet_url || '',
    user_id_str: row.user_id_str || '',
    username: row.username || '',
    image_url: row.image_url,
    in_reply_to_screen_name: row.in_reply_to_screen_name,
    lang: row.lang,
    location: row.location
  }
}

export function parseCSVData(data: any[], accountUsername: string): EnhancedAccount {
  try {
    const tweets: Tweet[] = []
    const hashtagMap = new Map<string, number>()
    const wordMap = new Map<string, number>()
    const postingTimeMap = new Map<string, number>()
    const langMap = new Map<string, number>()
    const locationMap = new Map<string, number>()
    let totalEngagement = 0
    let totalFavorites = 0
    let totalRetweets = 0
    let totalReplies = 0
    let totalQuotes = 0

    // Parse all tweets
    data.forEach(row => {
      if (row.id_str && row.full_text) {
        const validated = validateTweet(row)
        const engagement = parseInt(row.favorite_count || 0) + parseInt(row.retweet_count || 0) + parseInt(row.reply_count || 0)

        tweets.push({
          id_str: validated.id_str,
          full_text: validated.full_text,
          created_at: validated.created_at,
          favorite_count: parseInt(validated.favorite_count),
          retweet_count: parseInt(validated.retweet_count),
          reply_count: parseInt(validated.reply_count),
          quote_count: parseInt(validated.quote_count),
          tweet_url: validated.tweet_url,
          image_url: validated.image_url,
          in_reply_to_screen_name: validated.in_reply_to_screen_name
        })

        totalEngagement += engagement
        totalFavorites += parseInt(validated.favorite_count)
        totalRetweets += parseInt(validated.retweet_count)
        totalReplies += parseInt(validated.reply_count)
        totalQuotes += parseInt(validated.quote_count)

        // Extract hashtags from text
        const hashtagMatches = validated.full_text.match(/#\w+/g) || []
        hashtagMatches.forEach(tag => {
          hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1)
        })

        // Extract words (simple word frequency)
        const words = validated.full_text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !w.startsWith('#') && !w.startsWith('@') && !w.startsWith('http'))
        words.forEach(word => {
          wordMap.set(word, (wordMap.get(word) || 0) + 1)
        })

        // Extract posting time
        const date = new Date(validated.created_at)
        const hour = date.getUTCHours()
        const day = date.getUTCDay()
        const timeKey = `${day}-${hour}`
        postingTimeMap.set(timeKey, (postingTimeMap.get(timeKey) || 0) + 1)

        // Track language and location
        if (validated.lang) {
          langMap.set(validated.lang, (langMap.get(validated.lang) || 0) + 1)
        }
        if (validated.location) {
          locationMap.set(validated.location, (locationMap.get(validated.location) || 0) + 1)
        }
      }
    })

    // Calculate metrics
    const topTweets = tweets.sort((a, b) => {
      const aEng = a.favorite_count + a.retweet_count + a.reply_count
      const bEng = b.favorite_count + b.retweet_count + b.reply_count
      return bEng - aEng
    }).slice(0, 10)

    const topHashtags = Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
    const totalHashtagCount = topHashtags.reduce((sum, h) => sum + h.count, 0)

    const wordFrequency = Array.from(wordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100)

    const postingTimes = Array.from(postingTimeMap.entries())
      .map(([key, count]) => {
        const [day, hour] = key.split('-').map(Number)
        return { day_of_week: day, hour, count, avgEngagement: totalEngagement / tweets.length }
      })

    const account: EnhancedAccount = {
      id: accountUsername.toLowerCase(),
      username: accountUsername,
      user_id_str: tweets[0]?.id_str || '',
      total_tweets: tweets.length,
      followers: 0, // Will be calculated from data
      engagement_rate: tweets.length > 0 ? (totalEngagement / tweets.length / 1000) * 100 : 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 }, // Can be added if sentiment field exists
      top_tweets: topTweets,
      top_hashtags: topHashtags,
      word_frequency: wordFrequency,
      avg_tweet_length: tweets.length > 0 ? Math.round(tweets.reduce((sum, t) => sum + t.full_text.length, 0) / tweets.length) : 0,
      posting_frequency: 0,
      most_active_hour: 0,
      topics: [],
      socialListening: {
        topMentions: [],
        topHashtags: topHashtags.slice(0, 5).map(h => h.tag),
        topKeywords: wordFrequency.slice(0, 5).map(w => w.word),
        mentionCount: 0,
        hashtagCount: topHashtags.length,
        timeRange: 'Last 30 days'
      },
      postingTimes: postingTimes,
      engagementMetrics: {
        totalEngagement,
        avgEngagementPerTweet: tweets.length > 0 ? totalEngagement / tweets.length : 0,
        engagementRate: tweets.length > 0 ? (totalEngagement / tweets.length / 100) * 100 : 0,
        likeRate: tweets.length > 0 ? (totalFavorites / tweets.length / 100) * 100 : 0,
        retweetRate: tweets.length > 0 ? (totalRetweets / tweets.length / 100) * 100 : 0,
        replyRate: tweets.length > 0 ? (totalReplies / tweets.length / 100) * 100 : 0,
        quoteRate: tweets.length > 0 ? (totalQuotes / tweets.length / 100) * 100 : 0
      },
      trends: [],
      language_distribution: Array.from(langMap.entries())
        .map(([lang, count]) => ({ lang, count }))
        .sort((a, b) => b.count - a.count),
      location_distribution: Array.from(locationMap.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
    }

    return account
  } catch (err) {
    throw new ValidationError(
      `Error parsing CSV data: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
  }
}
