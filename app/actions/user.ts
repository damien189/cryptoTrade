"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function updateUserName(name: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    if (!name || name.trim().length < 2) {
      return { error: "Name must be at least 2 characters" }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() }
    })

    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update name error:", error)
    return { error: "Failed to update name" }
  }
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  try {
    // No need to manually check session here if we rely on auth.api.changePassword which checks it,
    // but the function signature requires headers.

    if (!newPassword || newPassword.length < 8) {
      return { error: "New password must be at least 8 characters" }
    }

    const { error } = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      },
      headers: await headers()
    })

    if (error) {
      console.error("Change Password Error:", error)
      return { error: error.message || "Failed to update password" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Update password error:", error)
    return { error: "Failed to update password" }
  }
}

export async function getUserWithdrawals() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return {
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: w.amount.toNumber(),
        status: w.status,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("[v0] Get withdrawals error:", error)
    return { error: "Failed to get withdrawals" }
  }
}
