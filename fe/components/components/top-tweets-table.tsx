import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'

const topTweets = [
  {
    id: 1,
    text: 'Just launched our new analytics dashboard! 🚀',
    likes: 2543,
    replies: 128,
    retweets: 456,
    impressions: 45200,
  },
  {
    id: 2,
    text: 'What\'s your favorite feature? Let us know in the replies 👇',
    likes: 1872,
    replies: 234,
    retweets: 312,
    impressions: 38900,
  },
  {
    id: 3,
    text: 'Thank you for 100K followers! 🙌',
    likes: 3125,
    replies: 89,
    retweets: 567,
    impressions: 52300,
  },
]

export function TopTweetsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tweet</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Likes</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Replies</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Retweets</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Impressions</th>
          </tr>
        </thead>
        <tbody>
          {topTweets.map((tweet) => (
            <tr key={tweet.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              <td className="py-4 px-4 text-foreground max-w-sm truncate">{tweet.text}</td>
              <td className="text-right py-4 px-4 text-foreground">{tweet.likes.toLocaleString()}</td>
              <td className="text-right py-4 px-4 text-foreground">{tweet.replies.toLocaleString()}</td>
              <td className="text-right py-4 px-4 text-foreground">{tweet.retweets.toLocaleString()}</td>
              <td className="text-right py-4 px-4 text-foreground">{tweet.impressions.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
