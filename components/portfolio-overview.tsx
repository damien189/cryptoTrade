"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Wallet, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { getCryptoPrices } from "@/lib/crypto-api"
import { useEffect, useState } from "react"

interface Portfolio {
  id: string
  symbol: string
  amount: string
  average_price: string
}

interface PortfolioOverviewProps {
  balance: number | string
  portfolios: Portfolio[]
}

// Map symbols to CoinGecko IDs (same as in portfolio page)
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

export function PortfolioOverview({ balance, portfolios }: PortfolioOverviewProps) {
  const [totalValue, setTotalValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function calculatePortfolioValue() {
      if (portfolios.length === 0) {
        setTotalValue(0)
        setIsLoading(false)
        return
      }

      try {
        // Convert symbols to IDs for the API
        const ids = portfolios
          .map((p) => SYMBOL_TO_ID[p.symbol.toUpperCase()])
          .filter(Boolean)
        
        // Remove duplicates
        const uniqueIds = Array.from(new Set(ids))
        
        if (uniqueIds.length === 0) {
          setTotalValue(0)
          setIsLoading(false)
          return
        }

        const prices = await getCryptoPrices(uniqueIds)

        let total = 0
        portfolios.forEach((portfolio) => {
          const cryptoId = SYMBOL_TO_ID[portfolio.symbol.toUpperCase()]
          const crypto = prices.find((p) => p.id === cryptoId)
          if (crypto) {
            total += Number.parseFloat(portfolio.amount) * crypto.current_price
          }
        })

        setTotalValue(total)
      } catch (error) {
        console.error("[v0] Error calculating portfolio value:", error)
      } finally {
        setIsLoading(false)
      }
    }

    calculatePortfolioValue()
  }, [portfolios])

  const balanceNum = typeof balance === "string" ? Number.parseFloat(balance) : balance

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde Disponible</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${balanceNum.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Prêt à investir</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur du Portefeuille</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : `$${totalValue.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">{portfolios.length} actifs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : `$${(balanceNum + totalValue).toFixed(2)}`}</div>
          <Button asChild variant="link" className="h-auto p-0 text-xs">
            <Link href="/dashboard/withdraw">
              Demander un Retrait <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
