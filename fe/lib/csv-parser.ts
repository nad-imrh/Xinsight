import { Tweet, TweetRow } from './types'

export function parseCSV(csvContent: string): TweetRow[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').replace(/\\"/g, ''))
  console.log('[v0] CSV Headers found:', headers)
  
  const rows: TweetRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    const values = parseCSVLine(line)

    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index].replace(/^["']|["']$/g, '').replace(/\\"/g, '')
      })
      rows.push(row as TweetRow)
    }
  }

  console.log('[v0] CSV Parser: Parsed', rows.length, 'rows from CSV')
  if (rows.length > 0) {
    console.log('[v0] First row sample:', Object.keys(rows[0]).slice(0, 5), 'columns')
    console.log('[v0] First row data sample:', {
      text: rows[0]['full_text'] || rows[0]['text'] || rows[0]['Text'] || 'NOT FOUND',
      id: rows[0]['id_str'] || rows[0]['id'] || 'NOT FOUND'
    })
  }
  
  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function convertToTweets(rows: TweetRow[]): Tweet[] {
  console.log('[v0] Converting', rows.length, 'rows to tweets')
  
  const tweets = rows.map((row, index) => {
    // Try multiple possible field names for text content
    const text = (row as any)['full_text'] || 
                 (row as any)['text'] || 
                 (row as any)['Text'] || 
                 (row as any)['Full Text'] ||
                 (row as any)['tweet_text'] ||
                 (row as any)['content'] ||
                 (row as any)['Content'] ||
                 ''
    
    if (index < 2 && !text) {
      console.log('[v0] Empty text for row', index, 'Available fields:', Object.keys(row).slice(0, 10))
    }
    
    // Try multiple field names for ID
    const id = (row as any)['id_str'] || 
               (row as any)['id'] || 
               (row as any)['conversation_id_str'] || 
               (row as any)['ID'] ||
               `tweet_${Math.random()}`
    
    // Try multiple field names for created_at
    const createdAt = (row as any)['created_at'] || 
                      (row as any)['date'] || 
                      (row as any)['Date'] ||
                      (row as any)['timestamp'] ||
                      new Date().toISOString()
    
    return {
      id_str: id,
      full_text: text,
      text: text,
      created_at: new Date(createdAt).toISOString(),
      favorite_count: parseInt((row as any)['favorite_count'] || (row as any)['likes'] || (row as any)['Likes'] || '0', 10) || 0,
      retweet_count: parseInt((row as any)['retweet_count'] || (row as any)['retweets'] || (row as any)['Retweets'] || '0', 10) || 0,
      reply_count: parseInt((row as any)['reply_count'] || (row as any)['replies'] || (row as any)['Replies'] || '0', 10) || 0,
      quote_count: parseInt((row as any)['quote_count'] || (row as any)['quotes'] || (row as any)['Quotes'] || '0', 10) || 0,
      tweet_url: (row as any)['tweet_url'] || (row as any)['url'] || (row as any)['URL'] || `https://twitter.com/twitter/status/${id}`,
      image_url: (row as any)['image_url'] || (row as any)['media_url'],
      in_reply_to_screen_name: (row as any)['in_reply_to_screen_name'] || (row as any)['reply_to'],
    }
  })
  
  console.log('[v0] Converted tweets sample:', tweets.slice(0, 2).map(t => ({ 
    id: t.id_str, 
    text: t.full_text?.substring(0, 50),
    textLength: t.full_text?.length 
  })))
  
  return tweets
}

export function groupTweetsByUser(rows: TweetRow[]): { [username: string]: TweetRow[] } {
  const grouped: { [username: string]: TweetRow[] } = {}

  rows.forEach(row => {
    const username = row.username || row.Username || 'unknown'
    if (!grouped[username]) {
      grouped[username] = []
    }
    grouped[username].push(row)
  })

  return grouped
}

export function validateTweets(tweets: Tweet[]): Tweet[] {
  const validated = tweets.filter(tweet => {
    const text = tweet.full_text || tweet.text || ''
    const hasText = text.trim().length > 0
    const hasValidId = tweet.id_str && tweet.id_str.length > 0
    return hasText && hasValidId
  })
  
  console.log('[v0] Validated tweets:', validated.length, 'out of', tweets.length)
  
  if (validated.length > 0) {
    console.log('[v0] Sample validated tweet:', {
      id: validated[0].id_str,
      text: validated[0].full_text?.substring(0, 100),
      length: validated[0].full_text?.length
    })
  }
  
  return validated
}
