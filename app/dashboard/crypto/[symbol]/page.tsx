import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { TradingViewChart } from "@/components/tradingview-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, User, Tag, Share2, Bookmark } from "lucide-react"
import Link from "next/link"
import { getAllMarketAssets, getCryptoPrices } from "@/lib/crypto-api"
import { generateAssetArticle } from "@/lib/article-generator"

interface CryptoDetailPageProps {
  params: Promise<{ symbol: string }>
}

export default async function CryptoDetailPage({ params }: CryptoDetailPageProps) {
  const resolvedParams = await params
  
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  // Find asset dynamically from all available assets
  const allAssets = await getAllMarketAssets()
  const paramLower = resolvedParams.symbol.toLowerCase()
  const cryptoInfo = allAssets.find(a => a.id === paramLower || a.symbol.toLowerCase() === paramLower)
  
  if (!cryptoInfo) {
    notFound()
  }

  const symbol = cryptoInfo.symbol.toUpperCase()
  
  // Fetch Price Data
  const prices = await getCryptoPrices([cryptoInfo.id])
  const priceData = prices[0] || cryptoInfo
  const isPositive = (priceData?.price_change_percentage_24h || 0) >= 0

  // Generate Blog Article
  const article = generateAssetArticle(
    cryptoInfo.name, 
    symbol, 
    priceData.current_price, 
    priceData.price_change_percentage_24h
  )

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      
      <main className="flex-1 container max-w-5xl mx-auto py-8 px-4 md:px-6">
        {/* Navigation */}
        <Link 
          href="/dashboard/research" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Centre de Recherche
        </Link>

        {/* Article Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {article.subtitle}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.publishDate}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <article className="lg:col-span-8 space-y-8">
            {/* Chart Section embedded in article */}
            <figure className="rounded-xl overflow-hidden border bg-card shadow-sm">
              <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                 <div className="flex items-center gap-2">
                   <img src={cryptoInfo.image} className="w-6 h-6" alt={symbol} />
                   <span className="font-bold">{symbol}/USD</span>
                 </div>
                 <Badge variant={isPositive ? "default" : "destructive"} className="font-mono">
                    {isPositive ? "+" : ""}{priceData.price_change_percentage_24h.toFixed(2)}%
                 </Badge>
              </div>
              <div className="h-[400px]">
                <TradingViewChart symbol={symbol} height={400} />
              </div>
              <figcaption className="p-3 text-center text-xs text-muted-foreground bg-muted/10">
                Graphique en temps réel : {cryptoInfo.name} performance sur les marchés
              </figcaption>
            </figure>

            {/* Article Text */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {article.sections.map((section, idx) => (
                <div key={idx} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-lg leading-7 text-muted-foreground/90">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="sticky top-24 border-primary/20 shadow-lg bg-background/95 backdrop-blur-sm z-10">
              <CardHeader>
                <CardTitle>Investir dans {cryptoInfo.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-muted-foreground">Prix Actuel</span>
                  <span className="text-3xl font-bold">
                    ${priceData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="p-3 bg-background rounded-lg border text-center">
                      <div className="text-muted-foreground mb-1">Vol. 24h</div>
                      <div className="font-semibold">${(priceData.total_volume / 1e9).toFixed(1)}B</div>
                   </div>
                   <div className="p-3 bg-background rounded-lg border text-center">
                      <div className="text-muted-foreground mb-1">Cap. Marché</div>
                      <div className="font-semibold">${(priceData.market_cap / 1e9).toFixed(1)}B</div>
                   </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full h-12 text-lg font-bold shadow-green-500/20 shadow-lg" size="lg" asChild>
                    <Link href={`/dashboard/contact?subject=Achat ${symbol}&message=Je souhaite investir dans ${cryptoInfo.name} (${symbol}). Merci de me recontacter.`}>
                      Acheter {symbol}
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Contactez votre administrateur pour exécuter un ordre d'achat immédiat.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="z-0 relative">
              <CardHeader>
                <CardTitle className="text-sm">Articles Similaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "L'Or (GOLD) : Valeur refuge ultime ?",
                  "Pourquoi les Tech Stocks explosent",
                  "Bitcoin vs Ethereum : Le duel"
                ].map((title, i) => (
                  <div key={i} className="group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded transition-colors">
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
