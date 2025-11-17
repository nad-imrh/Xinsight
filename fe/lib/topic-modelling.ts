// LDA Topic Modelling using TF-IDF with improved keyword extraction
import { Tweet, Topic } from './types'

interface TokenFrequency {
  [token: string]: number
}

interface DocumentFrequency {
  [token: string]: number
}

class TopicModeller {
  private tokenizeText(text: string): string[] {
    const cleanedText = text
      .toLowerCase()
      .replace(/https?:\/\/\S+/gi, '') // Remove URLs
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/@\w+/g, '') // Remove mentions
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    return cleanedText
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word))
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for',
      'of', 'as', 'by', 'that', 'this', 'it', 'from', 'are', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can',
      'your', 'our', 'my', 'his', 'her', 'its', 'their', 'what', 'who', 'when', 'where', 'why', 'how',
      'movie', 'watch', 'show', 'streaming', 'content', 'series', 'film', 'video', 'tweet', 'twitter',
      'like', 'said', 'just', 'would', 'could', 'also', 'get', 'got', 'one', 'two', 'new',
      'http', 'https', 'www', 'com', 'co', 'now', 'more', 'all', 'out', 'only', 'here', 'there'
    ])
    return stopWords.has(word)
  }

  async extractTopicsWithLDA(tweets: Tweet[], numTopics: number = 5): Promise<Topic[]> {
    try {
      console.log('[v0] Topic Extraction: Starting with', tweets.length, 'tweets')
      
      const validTweets = tweets.filter(t => {
        const text = (t.full_text || t.text || '').trim()
        const isValid = text.length > 10
        return isValid
      })

      if (validTweets.length === 0) {
        console.log('[v0] Topic Extraction: No valid tweets (all too short)')
        return []
      }

      console.log('[v0] Topic Extraction: Valid tweets for analysis:', validTweets.length)
      console.log('[v0] Topic Extraction: Sample texts:', validTweets.slice(0, 3).map(t => 
        (t.full_text || t.text || '').substring(0, 80)
      ))

      // Try API-based extraction first
      try {
        console.log('[v0] Topic Extraction: Attempting API call...')
        const response = await fetch('/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texts: validTweets.map(t => t.full_text || t.text || '').slice(0, 100),
            numTopics
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.topics && data.topics.length > 0) {
            console.log('[v0] Topic Extraction: API returned', data.topics.length, 'topics')
            return data.topics
          }
        } else {
          console.log('[v0] Topic Extraction: API returned non-OK status:', response.status)
        }
      } catch (apiError) {
        console.log('[v0] Topic Extraction: API call failed, using local TF-IDF')
      }

      // Fallback to local extraction
      const topics = this.extractTopicsLocal(validTweets, numTopics)
      console.log('[v0] Topic Extraction: Local extraction returned', topics.length, 'topics')
      return topics
    } catch (error) {
      console.error('[v0] Topic Extraction: Error:', error)
      return this.extractTopicsLocal(tweets, numTopics)
    }
  }

  private calculateTfIdf(
    tokens: string[][],
    documentIndex: number
  ): { [token: string]: number } {
    const tf: TokenFrequency = {}
    const docLength = tokens[documentIndex].length

    tokens[documentIndex].forEach(token => {
      tf[token] = (tf[token] || 0) + 1 / docLength
    })

    const docFreq: DocumentFrequency = {}
    const totalDocs = tokens.length

    tokens.forEach(doc => {
      const uniqueTokens = new Set(doc)
      uniqueTokens.forEach(token => {
        docFreq[token] = (docFreq[token] || 0) + 1
      })
    })

    const tfIdf: { [token: string]: number } = {}
    Object.entries(tf).forEach(([token, tfValue]) => {
      const idf = Math.log(totalDocs / (docFreq[token] || 1))
      tfIdf[token] = tfValue * idf
    })

    return tfIdf
  }

  extractTopicsLocal(tweets: Tweet[], numTopics: number = 5): Topic[] {
    if (tweets.length === 0) return []

    console.log('[v0] Local Topic Extraction: Processing', tweets.length, 'tweets')

    const allHashtags = new Map<string, number>()
    tweets.forEach(tweet => {
      const text = tweet.full_text || tweet.text || ''
      const hashtags = text.match(/#\w+/g) || []
      hashtags.forEach(tag => {
        allHashtags.set(tag.toLowerCase(), (allHashtags.get(tag.toLowerCase()) || 0) + 1)
      })
    })
    
    console.log('[v0] Local Topic Extraction: Found', allHashtags.size, 'unique hashtags')

    const tokens = tweets.map(tweet => {
      const text = tweet.full_text || tweet.text || ''
      return this.tokenizeText(text)
    })
    
    const validTokens = tokens.filter(t => t.length > 0)
    console.log('[v0] Local Topic Extraction: Valid token sets:', validTokens.length)
    
    if (validTokens.length === 0) {
      console.log('[v0] Local Topic Extraction: No tokens extracted')
      return []
    }

    // Calculate TF-IDF
    const tfidfScores = validTokens.map((_, index) => this.calculateTfIdf(validTokens, index))

    const termScores: { [term: string]: number } = {}
    const termFrequency: { [term: string]: number } = {}

    tfidfScores.forEach(scores => {
      Object.entries(scores).forEach(([term, score]) => {
        termScores[term] = (termScores[term] || 0) + score
        termFrequency[term] = (termFrequency[term] || 0) + 1
      })
    })

    const minFrequency = Math.max(2, Math.floor(validTokens.length * 0.05))
    const filteredTerms = Object.entries(termScores)
      .filter(([term, _]) => {
        const isValidTerm = termFrequency[term] >= minFrequency && 
                           term.length >= 4 &&
                           !term.includes('http') &&
                           !term.includes('www') &&
                           !term.match(/^[0-9]+$/)
        return isValidTerm
      })
      .sort((a, b) => b[1] - a[1])
    
    console.log('[v0] Local Topic Extraction: Top terms after filtering:', filteredTerms.slice(0, 10).map(t => t[0]))

    const topTerms = filteredTerms.slice(0, Math.max(numTopics * 4, 20))

    const topics: Topic[] = []
    let topicCount = 0

    // Create topics from term clusters
    for (let i = 0; i < topTerms.length && topicCount < numTopics; i += 3) {
      const keywords = [topTerms[i][0], topTerms[i + 1]?.[0], topTerms[i + 2]?.[0]]
        .filter(Boolean) as string[]

      if (keywords.length > 0) {
        const tweetCount = tweets.filter(tweet => {
          const text = (tweet.full_text || tweet.text || '').toLowerCase()
          const textWithoutHashtags = text.replace(/#\w+/g, '')
          return keywords.some(kw => textWithoutHashtags.includes(kw))
        }).length

        if (tweetCount > 0) {
          const topicName = this.generateTopicName(keywords)
          
          topics.push({
            id: `topic-${topicCount}`,
            label: topicName,
            keywords,
            weight: termScores[keywords[0]],
            tweetCount
          })
          topicCount++
        }
      }
    }

    // Normalize weights
    const maxWeight = Math.max(...topics.map(t => t.weight), 1)
    topics.forEach(topic => {
      topic.weight = topic.weight / maxWeight
    })

    console.log('[v0] Local Topic Extraction: Final topics:', topics.map(t => ({
      label: t.label,
      keywords: t.keywords,
      tweets: t.tweetCount
    })))

    return topics.sort((a, b) => b.weight - a.weight)
  }

  private generateTopicName(keywords: string[]): string {
    // Define topic categories based on keyword patterns
    const topicPatterns = [
      { pattern: ['stream', 'watch', 'episode', 'season', 'series'], name: 'Streaming Content' },
      { pattern: ['movie', 'film', 'cinema', 'premiere'], name: 'Movies & Films' },
      { pattern: ['show', 'series', 'episode', 'season'], name: 'TV Shows' },
      { pattern: ['disney', 'pixar', 'marvel', 'starwars'], name: 'Disney Franchises' },
      { pattern: ['netflix', 'originals', 'exclusive'], name: 'Netflix Originals' },
      { pattern: ['sports', 'game', 'match', 'live'], name: 'Sports & Live Events' },
      { pattern: ['news', 'announcement', 'update'], name: 'News & Updates' },
      { pattern: ['release', 'premiere', 'launch', 'coming'], name: 'New Releases' },
      { pattern: ['kids', 'family', 'children'], name: 'Family Content' },
      { pattern: ['documentary', 'true', 'story'], name: 'Documentaries' },
      { pattern: ['comedy', 'funny', 'laugh'], name: 'Comedy' },
      { pattern: ['drama', 'thriller', 'mystery'], name: 'Drama & Thriller' },
      { pattern: ['action', 'adventure', 'hero'], name: 'Action & Adventure' },
      { pattern: ['subscribe', 'subscription', 'membership'], name: 'Subscriptions' },
      { pattern: ['your', 'watch', 'enjoy'], name: 'User Experience' }
    ]

    // Find matching patterns
    for (const category of topicPatterns) {
      const matchCount = keywords.filter(kw => 
        category.pattern.some(p => kw.includes(p) || p.includes(kw))
      ).length
      
      if (matchCount > 0) {
        return category.name
      }
    }

    // Fallback: Capitalize first keyword and add context
    const mainKeyword = keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1)
    return `${mainKeyword} Discussion`
  }

  extractTopics(tweets: Tweet[], numTopics: number = 5): Topic[] {
    return this.extractTopicsLocal(tweets, numTopics)
  }
}

export const topicModeller = new TopicModeller()
