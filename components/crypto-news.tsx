"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { TrendingUp, TrendingDown, Minus, Newspaper, Loader2, ArrowLeft, ExternalLink } from "lucide-react"
import { getCryptoNews, NewsItem } from "@/lib/news-api"

export function CryptoNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await getCryptoNews(12)
        setNews(data)
      } catch (error) {
        console.error("Failed to load news", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNews()
  }, [])

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Haussier
          </Badge>
        )
      case "bearish":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <TrendingDown className="h-3 w-3 mr-1" />
            Baissier
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Minus className="h-3 w-3 mr-1" />
            Neutre
          </Badge>
        )
    }
  }

  return (
    <>
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Newspaper className="h-6 w-6 text-primary" />
            Actualités du Marché
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="cursor-pointer group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.imageurl || "/placeholder-news.jpg"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600"
                      }}
                    />
                    <div className="absolute top-2 right-2 backdrop-blur-md bg-background/50 rounded-full px-2 py-0.5">
                      {getSentimentBadge(item.sentiment)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <span className="font-semibold">{item.source}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(item.published_on * 1000), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 p-5">
                    <h4 className="font-semibold text-lg leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {item.body}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {item.tags.split('|').slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedNews && (
            <div className="flex flex-col">
              <div className="relative h-[300px] w-full">
                <img 
                  src={selectedNews.imageurl} 
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    {getSentimentBadge(selectedNews.sentiment)}
                    <span className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                      {selectedNews.source}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight text-foreground shadow-sm">
                    {selectedNews.title}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Publié {formatDistanceToNow(new Date(selectedNews.published_on * 1000), { addSuffix: true, locale: fr })}</span>
                  {selectedNews.tags && (
                    <>
                      <span>•</span>
                      <div className="flex gap-2">
                        {selectedNews.tags.split('|').map((tag) => (
                          <span key={tag} className="text-primary">{tag}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {selectedNews.body}
                  </p>
                  {/* Note: CryptoCompare free API only gives a body snippet. We must link to full article. */}
                  <p className="italic text-sm text-muted-foreground mt-4">
                    ...Lire l'article complet sur le site source pour plus de détails.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                  <Button variant="outline" onClick={() => setSelectedNews(null)}>
                    Fermer
                  </Button>
                  <Button asChild className="gap-2">
                    <a href={selectedNews.url} target="_blank" rel="noopener noreferrer">
                      Lire l'article complet <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

