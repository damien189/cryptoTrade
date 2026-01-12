"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { getCryptoPrices } from "@/lib/crypto-api"

const prisma = new PrismaClient()

// Mapping for symbol to ID for CoinGecko/CryptoAPI
const SYMBOL_TO_ID: Record<string, string> = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  "SOL": "solana",
  "ADA": "cardano",
  "XRP": "ripple",
  "DOGE": "dogecoin",
  "DOT": "polkadot",
  "AVAX": "avalanche-2",
  "USDT": "tether",
  "USDC": "usd-coin"
}

export async function getUserStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        portfolios: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Calculate current portfolio value
    const portfolioTokens = user.portfolios.map(p => ({
      symbol: p.symbol,
      amount: p.amount.toNumber(),
      avgPrice: p.averagePrice.toNumber(),
      id: SYMBOL_TO_ID[p.symbol] || p.symbol.toLowerCase()
    }))

    const cryptoIds = portfolioTokens.map(p => p.id).filter(Boolean)
    const prices = await getCryptoPrices(cryptoIds)
    const priceMap = new Map(prices.map(p => [p.id, p.current_price]))

    let totalPortfolioValue = 0
    let totalInvested = 0
    
    // Asset allocation data
    const assets = portfolioTokens.map(token => {
      const currentPrice = priceMap.get(token.id) || token.avgPrice // fallback to avg if price not found
      const value = token.amount * currentPrice
      const cost = token.amount * token.avgPrice
      const pnl = value - cost
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
      
      totalPortfolioValue += value
      totalInvested += cost

      return {
        name: token.symbol,
        value: parseFloat(value.toFixed(2)),
        amount: token.amount,
        price: currentPrice,
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercent: parseFloat(pnlPercent.toFixed(2))
      }
    }).sort((a, b) => b.value - a.value)

    const balance = user.balance.toNumber()
    const totalNetWorth = balance + totalPortfolioValue
    const totalPnL = totalPortfolioValue - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    return {
      balance,
      totalPortfolioValue,
      totalNetWorth,
      totalInvested,
      totalPnL,
      totalPnLPercent,
      assets,
      // For charts, we ideally want history. 
      // We can synthesize a "Recent Activity" based on transactions? 
      // Or just return the breakdown for now.
    }
  } catch (error) {
    console.error("Get stats error:", error)
    return { error: "Failed to fetch statistics" }
  }
}
