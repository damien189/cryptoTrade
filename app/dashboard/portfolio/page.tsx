import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCryptoPrices } from "@/lib/crypto-api"
import Link from "next/link"
import { TrendingUp, TrendingDown, Wallet, ExternalLink } from "lucide-react"

// Map symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  XRP: "ripple",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
}

export default async function PortfolioPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      portfolios: true
    }
  })

  if (!userData) {
    redirect("/auth/login")
  }

  // Get all crypto IDs from user's portfolio
  const cryptoIds = userData.portfolios
    .map(p => SYMBOL_TO_ID[p.symbol])
    .filter(Boolean)

  // Fetch current prices
  const prices = cryptoIds.length > 0 ? await getCryptoPrices(cryptoIds) : []

  // Calculate portfolio values
  const portfolioItems = userData.portfolios.map(holding => {
    const cryptoId = SYMBOL_TO_ID[holding.symbol]
    const priceData = prices.find(p => p.id === cryptoId)
    const currentPrice = priceData?.current_price || 0
    const amount = holding.amount.toNumber()
    const avgPrice = holding.averagePrice.toNumber()
    const currentValue = amount * currentPrice
    const costBasis = amount * avgPrice
    const profitLoss = currentValue - costBasis
    const profitLossPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0

    return {
      symbol: holding.symbol,
      amount,
      avgPrice,
      currentPrice,
      currentValue,
      costBasis,
      profitLoss,
      profitLossPercent,
      priceChange24h: priceData?.price_change_percentage_24h || 0,
      image: priceData?.image
    }
  })

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0)
  const totalCostBasis = portfolioItems.reduce((sum, item) => sum + item.costBasis, 0)
  const totalProfitLoss = totalValue - totalCostBasis
  const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={{ email: userData.email, role: userData.role }} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">My Portfolio</h2>
          <p className="text-muted-foreground">View your cryptocurrency holdings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${userData.balance.toNumber().toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toFixed(2)}
                <span className="text-sm ml-2">
                  ({totalProfitLossPercent >= 0 ? "+" : ""}{totalProfitLossPercent.toFixed(2)}%)
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any cryptocurrency holdings yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact your administrator to add holdings to your account.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolioItems.map((item) => (
                  <Link 
                    key={item.symbol} 
                    href={`/dashboard/crypto/${item.symbol}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img src={item.image} alt={item.symbol} className="h-10 w-10 rounded-full" />
                        )}
                        <div>
                          <p className="font-semibold">{item.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.amount.toFixed(6)} @ ${item.avgPrice.toFixed(2)} avg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.currentValue.toFixed(2)}</p>
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm ${item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {item.profitLoss >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                            {item.profitLoss >= 0 ? "+" : ""}{item.profitLossPercent.toFixed(2)}%
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
