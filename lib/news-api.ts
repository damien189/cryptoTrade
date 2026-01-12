// Crypto News API using CryptoCompare
// https://min-api.cryptocompare.com/documentation/news

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  body: string
  imageurl: string
  published_on: number
  sentiment: "bullish" | "bearish" | "neutral"
  tags: string
}

export interface NewsResponse {
  Data: Array<{
    id: string
    title: string
    url: string
    source: string
    body: string
    imageurl: string
    published_on: number
    tags: string
    categories: string
  }>
  Message: string
  Type: number
}

// Keywords to help identify bullish sentiment
const BULLISH_KEYWORDS = [
  "adoption", "launch", "rally", "record", "bull", "high", "growth", 
  "surge", "approved", "etf", "partnership", "upgrade", "success", 
  "buying", "accumul", "positive", "gain", "soar", "breakout"
]

const BEARISH_KEYWORDS = [
  "crash", "scam", "hack", "ban", "lawsuit", "down", "drop", 
  "bear", "low", "fail", "risk", "warning", "sell", "dump", 
  "plunge", "collapse", "fraud", "stolen"
]

function determineSentiment(title: string, body: string): "bullish" | "bearish" | "neutral" {
  const text = `${title} ${body}`.toLowerCase()
  
  let bullishScore = 0
  let bearishScore = 0
  
  BULLISH_KEYWORDS.forEach(word => {
    if (text.includes(word)) bullishScore++
  })
  
  BEARISH_KEYWORDS.forEach(word => {
    if (text.includes(word)) bearishScore++
  })

  if (bullishScore > bearishScore) return "bullish"
  if (bearishScore > bullishScore) return "bearish"
  return "neutral"
}

const NEWS_API = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"

export async function getCryptoNews(limit = 10): Promise<NewsItem[]> {
  try {
    const response = await fetch(NEWS_API, { 
      next: { revalidate: 300 },
      headers: { "Accept": "application/json" }
    })

    if (!response.ok) {
      console.error("[NewsAPI] Error:", response.status)
      return getMockNews()
    }

    const data: NewsResponse = await response.json()
    
    if (!data.Data || !Array.isArray(data.Data)) {
      return getMockNews()
    }

    const processedNews = data.Data.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      body: item.body,
      imageurl: item.imageurl,
      published_on: item.published_on,
      tags: item.tags,
      sentiment: determineSentiment(item.title, item.body)
    }))

    // Filter to favor bullish/neutral news and remove heavy bearish news
    // We want a list that looks "good" for crypto
    const filteredNews = processedNews.filter(item => item.sentiment !== "bearish")
    
    // If we filtered too many, add some back or just return what we have
    // Let's just return the top results from the filtered list
    return filteredNews.slice(0, limit)
    
  } catch (error) {
    console.error("[NewsAPI] Error fetching news:", error)
    return getMockNews()
  }
}

// Updated Mock Data
function getMockNews(): NewsItem[] {
  const now = Math.floor(Date.now() / 1000)
  return [
    {
      id: "1",
      title: "Bitcoin Surges Past $100k Requirement as ETF Inflows Break Records",
      body: "Institutional demand continues to drive the market upwards with record-breaking volumes in spot ETFs.",
      url: "#",
      source: "CryptoGlobe",
      imageurl: "https://images.unsplash.com/photo-1518546305927-5a440ee2e8fa?auto=format&fit=crop&q=80&w=600",
      published_on: now - 3600,
      sentiment: "bullish",
      tags: "BTC, ETF"
    },
    {
      id: "2",
      title: "Major Bank Launches Global Crypto Custody Solution",
      body: "Another step towards mass adoption as tier-1 banks enter the digital asset space.",
      url: "#",
      source: "CoinDesk",
      imageurl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600",
      published_on: now - 7200,
      sentiment: "bullish",
      tags: "Adoption, Banking"
    },
    {
      id: "3",
      title: "Ethereum Network Upgrade Promises 100x Lower Fees",
      body: "The new technical roadmap released by the foundation highlights scalability improvements.",
      url: "#",
      source: "The Block",
      imageurl: "https://images.unsplash.com/photo-1622630998477-20aa696f4c5c?auto=format&fit=crop&q=80&w=600",
      published_on: now - 10800,
      sentiment: "bullish",
      tags: "ETH, Tech"
    }
  ]
}

