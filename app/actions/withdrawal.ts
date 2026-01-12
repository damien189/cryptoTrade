"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function requestWithdrawal(amount: number) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const userId = session.user.id

    // Check user balance
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
    })

    if (!userData) {
      return { error: "User not found" }
    }

    if (amount <= 0) {
      return { error: "Invalid amount" }
    }

    const balance = userData.balance.toNumber()

    if (balance < amount) {
      return { error: "Insufficient balance" }
    }

    // Create withdrawal request
    await prisma.withdrawal.create({
        data: {
            userId: userId,
            amount: amount,
            status: "pending"
        }
    })

    revalidatePath("/dashboard/withdraw")
    return { success: true }
  } catch (error) {
    console.error("[v0] Withdrawal error:", error)
    return { error: "Failed to request withdrawal" }
  }
}
