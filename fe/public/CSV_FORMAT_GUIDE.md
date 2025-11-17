# Twitter Analytics CSV Format Guide

## Your Actual Fields

Your CSV should include these columns from Twitter data export:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `conversation_id_str` | String | Unique conversation identifier | 1234567890 |
| `created_at` | String (ISO 8601) | Tweet creation timestamp | 2024-01-15T14:30:00Z |
| `favorite_count` | Integer | Number of likes | 1500 |
| `full_text` | String | Complete tweet text | "Amazing content!" |
| `id_str` | String | Unique tweet ID | 1001 |
| `image_url` | String (Optional) | URL to tweet image | https://example.com/image.jpg |
| `in_reply_to_screen_name` | String (Optional) | Username if reply | @someone |
| `lang` | String (Optional) | Language code | en |
| `location` | String (Optional) | User location | New York, USA |
| `quote_count` | Integer | Number of quote tweets | 200 |
| `reply_count` | Integer | Number of replies | 300 |
| `retweet_count` | Integer | Number of retweets | 800 |
| `tweet_url` | String | URL to tweet | https://twitter.com/.../status/1001 |
| `user_id_str` | String | Twitter user ID | 123456789 |
| `username` | String | Twitter handle | @Disney |

## Example CSV Format

\`\`\`csv
conversation_id_str,created_at,favorite_count,full_text,id_str,image_url,in_reply_to_screen_name,lang,location,quote_count,reply_count,retweet_count,tweet_url,user_id_str,username
1234567890,2024-01-15T14:30:00Z,1500,"Amazing content! #streaming #entertainment",1001,https://example.com/img.jpg,,en,Los Angeles,200,300,800,https://twitter.com/Disney/status/1001,123456789,Disney
1234567891,2024-01-15T15:00:00Z,2000,"Love this! #shows",1002,,@Netflix,en,New York,150,250,900,https://twitter.com/Netflix/status/1002,987654321,Netflix
\`\`\`

## Data Validation Rules

1. **Required fields**: id_str, full_text, created_at, favorite_count, retweet_count, reply_count
2. **Numeric fields**: All count fields must be valid integers
3. **Date format**: Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
4. **Unique IDs**: id_str should be unique for each tweet
5. **Text encoding**: Use UTF-8 encoding

## How to Export from Twitter

1. Use Twitter API v2 endpoint with following fields:
   - author_id, created_at, public_metrics, text, id, etc.
2. Use third-party tools like Twint, TWARC, or Linktree
3. Export and map to the column names above

## Tips for Best Results

- Include as many tweets as possible (100+ recommended)
- Ensure created_at is in correct timezone format
- Include hashtags in full_text for hashtag analysis
- Add lang and location for demographic analysis
- Keep file under 10MB for performance
