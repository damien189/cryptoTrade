"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function createUser(userData: { email: string; password: string; firstName: string; lastName: string; role: string; balance: number }) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Create auth user using Better Auth API
    const name = `${userData.firstName} ${userData.lastName}`.trim()

    // Note: This will create the user and potentially sign them in context of this request, 
    // but since we are server side, it primarily creates the record.
    const newUserResponse = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: name,
        // We can't set role/balance directly in signUpEmail unless we have custom fields in schema that match and are allowed
        // Better Auth doesn't support arbitrary metadata in signUpEmail body by default unless configured.
        // We will update role and balance after creation.
      }
    })

    if (!newUserResponse) {
      throw new Error("Failed to create user")
    }

    // Update the newly created user with role and balance
    // newUserResponse.user contains the created user
    await prisma.user.update({
      where: { id: newUserResponse.user.id },
      data: {
        role: userData.role,
        balance: userData.balance
      }
    })

    revalidatePath("/admin")
    return { success: true, user: newUserResponse.user }
  } catch (error) {
    console.error("[v0] Create user error:", error)
    return { error: "Failed to create user" }
  }
}

export async function approveWithdrawal(withdrawalId: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Get withdrawal details
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId }
    })

    if (!withdrawal) {
      return { error: "Withdrawal not found" }
    }

    // Update user balance
    const user = await prisma.user.findUnique({
      where: { id: withdrawal.userId },
      select: { balance: true }
    })

    if (!user) {
      return { error: "User not found" }
    }

    const currentBalance = user.balance.toNumber()
    const withdrawalAmount = withdrawal.amount.toNumber()
    const newBalance = currentBalance - withdrawalAmount

    // Update withdrawal status and user balance
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "approved" }
    })

    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: { balance: newBalance }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("[v0] Approve withdrawal error:", error)
    return { error: "Failed to approve withdrawal" }
  }
}

export async function rejectWithdrawal(withdrawalId: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "rejected" }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("[v0] Reject withdrawal error:", error)
    return { error: "Failed to reject withdrawal" }
  }
}
export async function getAdminStats() {
  // ... logic for getting dashboard stats (placeholder if needed, or if it exists elsewhere ignore)
  // Actually, I'll insert the new function above the existing ones or at the end. Use a new block.
}

export async function adminResetUserPassword(userId: string, newPassword: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    // Find the account
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        providerId: "credential"
      }
    })

    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    if (account) {
      // Update existing account
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
      })
    } else {
      // Create account if it doesn't exist (edge case for users created differently?)
      // Usually better-auth creates account with user. If not found, it's weird.
      // We'll create one just in case or return error.
      // Let's return error to be safe, creating account needs more fields potentially.
      return { error: "User has no credential account to update" }
    }

    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Admin reset password error:", error)
    return { error: "Failed to reset password" }
  }
}

export async function searchUsers(query: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 10,
      orderBy: { email: 'asc' }
    })

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        balance: u.balance.toNumber(),
        createdAt: u.createdAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("[v0] Search users error:", error)
    return { error: "Failed to search users" }
  }
}

export async function getUserDetails(userId: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolios: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return { error: "User not found" }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: user.balance.toNumber(),
        createdAt: user.createdAt.toISOString(),
        portfolios: user.portfolios.map(p => ({
          id: p.id,
          symbol: p.symbol,
          amount: p.amount.toNumber(),
          averagePrice: p.averagePrice.toNumber()
        })),
        transactions: user.transactions.map(t => ({
          id: t.id,
          type: t.type,
          symbol: t.symbol,
          amount: t.amount.toNumber(),
          price: t.price.toNumber(),
          total: t.total.toNumber(),
          createdAt: t.createdAt.toISOString()
        }))
      }
    }
  } catch (error) {
    console.error("[v0] Get user details error:", error)
    return { error: "Failed to get user details" }
  }
}

interface AdminTradeParams {
  userId: string
  type: "buy" | "sell"
  cryptoId: string
  symbol: string
  amount: number
  customPrice?: number
}

export async function executeAdminTrade({ userId, type, cryptoId, symbol, amount, customPrice }: AdminTradeParams) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    let currentPrice = 0

    if (customPrice && customPrice > 0) {
      currentPrice = customPrice
    } else {
      // Import getCryptoPrice dynamically to avoid circular dependencies
      const { getCryptoPrice } = await import("@/lib/crypto-api")

      // Get current crypto price
      currentPrice = await getCryptoPrice(cryptoId)
      if (currentPrice === 0) {
        return { error: "Failed to fetch crypto price" }
      }
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    if (!userData) {
      return { error: "User not found" }
    }

    const balance = userData.balance.toNumber()

    if (amount <= 0) {
      return { error: "Trade amount must be positive" }
    }

    if (type === "buy") {
      // For admin: allow trades even if balance is insufficient (admin can add balance first)
      // But we still check for negative balance
      if (balance < amount) {
        return { error: `Insufficient balance. User has $${balance.toFixed(2)} but trade requires $${amount.toFixed(2)}` }
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
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: userId,
          symbol: symbol
        }
      })

      if (!portfolio) {
        return { error: "User doesn't own this cryptocurrency" }
      }

      const cryptoAmount = amount / currentPrice
      const existingAmount = portfolio.amount.toNumber()

      if (existingAmount < cryptoAmount) {
        return { error: `Insufficient crypto balance. User has ${existingAmount.toFixed(8)} ${symbol} but needs ${cryptoAmount.toFixed(8)}` }
      }

      const newCryptoAmount = existingAmount - cryptoAmount
      const newBalance = balance + amount

      await prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      })

      if (newCryptoAmount <= 0) {
        await prisma.portfolio.delete({ where: { id: portfolio.id } })
      } else {
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { amount: newCryptoAmount }
        })
      }

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

    revalidatePath("/admin")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Admin trade error:", error)
    return { error: "Failed to execute trade" }
  }
}

export async function getAllTrades(limit = 50) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const trades = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    return {
      trades: trades.map(t => ({
        id: t.id,
        userId: t.userId,
        userEmail: t.user.email,
        type: t.type,
        symbol: t.symbol,
        amount: t.amount.toNumber(),
        price: t.price.toNumber(),
        total: t.total.toNumber(),
        createdAt: t.createdAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("[v0] Get all trades error:", error)
    return { error: "Failed to get trades" }
  }
}

