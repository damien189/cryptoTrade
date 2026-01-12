"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getCryptoPrice } from "@/lib/crypto-api"
import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface TradeParams {
  userId: string
  type: "buy" | "sell"
  cryptoId: string
  symbol: string
  amount: number
}

export async function executeTrade({ userId, type, cryptoId, symbol, amount }: TradeParams) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.id !== userId) {
      return { error: "Unauthorized" }
    }

    // Get current crypto price
    const currentPrice = await getCryptoPrice(cryptoId)
    if (currentPrice === 0) {
      return { error: "Failed to fetch crypto price" }
    }

    // Get user data
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
    })

    if (!userData) {
      return { error: "User not found" }
    }

    // Balance is Decimal in Prisma, convert to number for calculation
    const balance = userData.balance.toNumber()

    if (type === "buy") {
      // Check if user has enough balance
      if (balance < amount) {
        return { error: "Insufficient balance" }
      }

      const cryptoAmount = amount / currentPrice
      const newBalance = balance - amount

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      })

      // Check if user already has this crypto
      const existingPortfolio = await prisma.portfolio.findFirst({
        where: {
            userId: userId,
            symbol: symbol
        }
      })

      if (existingPortfolio) {
        // Update existing portfolio
        const existingAmount = existingPortfolio.amount.toNumber()
        const existingAvgPrice = existingPortfolio.averagePrice.toNumber()
        const totalCost = existingAmount * existingAvgPrice + amount
        const totalAmount = existingAmount + cryptoAmount
        const newAvgPrice = totalCost / totalAmount

        await prisma.portfolio.update({
            where: { id: existingPortfolio.id },
            data: {
                amount: totalAmount,
                averagePrice: newAvgPrice
            }
        })
      } else {
        // Create new portfolio entry
        await prisma.portfolio.create({
            data: {
                userId: userId,
                symbol: symbol,
                amount: cryptoAmount,
                averagePrice: currentPrice
            }
        })
      }

      // Record transaction
      await prisma.transaction.create({
          data: {
            userId: userId,
            type: "buy",
            symbol,
            amount: cryptoAmount,
            price: currentPrice,
            total: amount
          }
      })
    } else {
      // Sell
      // Check if user has this crypto
      const portfolio = await prisma.portfolio.findFirst({
        where: {
            userId: userId,
            symbol: symbol
        }
      })

      if (!portfolio) {
        return { error: "You don't own this cryptocurrency" }
      }

      const cryptoAmount = amount / currentPrice
      const existingAmount = portfolio.amount.toNumber()

      if (existingAmount < cryptoAmount) {
        return { error: "Insufficient crypto balance" }
      }

      const newCryptoAmount = existingAmount - cryptoAmount
      const newBalance = balance + amount

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      })

      // Update portfolio
      if (newCryptoAmount <= 0) {
        // Remove portfolio entry if amount is 0
        await prisma.portfolio.delete({ where: { id: portfolio.id } })
      } else {
        await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { amount: newCryptoAmount }
        })
      }

      // Record transaction
      await prisma.transaction.create({
          data: {
            userId: userId,
            type: "sell",
            symbol,
            amount: cryptoAmount,
            price: currentPrice,
            total: amount
          }
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/trade")
    return { success: true }
  } catch (error) {
    console.error("[v0] Trade error:", error)
    return { error: "Failed to execute trade" }
  }
}
