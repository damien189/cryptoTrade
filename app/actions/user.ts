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
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "New password must be at least 8 characters" }
    }

    // Use Better Auth to change password
    // Better Auth doesn't have a direct changePassword API in server actions,
    // so we'll need to verify current password and update via the account
    const account = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        providerId: "credential"
      }
    })

    if (!account || !account.password) {
      return { error: "No password-based account found" }
    }

    // Verify current password using bcrypt (Better Auth uses bcrypt by default)
    const bcrypt = await import("bcryptjs")
    const isValid = await bcrypt.compare(currentPassword, account.password)

    if (!isValid) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    })

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
