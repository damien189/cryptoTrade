"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

// Generate a unique referral code for a user
function generateReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase()
}

// Get or create referral code for current user
export async function getOrCreateReferralCode() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    })

    if (!user) {
      return { error: "User not found" }
    }

    // If user already has a referral code, return it
    if (user.referralCode) {
      return { code: user.referralCode }
    }

    // Generate a new unique code
    let code = generateReferralCode()
    let attempts = 0
    
    while (attempts < 10) {
      const existing = await prisma.user.findUnique({
        where: { referralCode: code }
      })
      
      if (!existing) break
      code = generateReferralCode()
      attempts++
    }

    // Update user with new code
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: code }
    })

    revalidatePath("/dashboard/referrals")
    return { code }
  } catch (error) {
    console.error("[v0] Get referral code error:", error)
    return { error: "Failed to get referral code" }
  }
}

// Get user's referrals
export async function getUserReferrals() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    // Get referred user emails
    const referredUserIds = referrals.map(r => r.referredId)
    const referredUsers = await prisma.user.findMany({
      where: { id: { in: referredUserIds } },
      select: { id: true, email: true, createdAt: true }
    })

    const userMap = new Map(referredUsers.map(u => [u.id, u]))

    return {
      referrals: referrals.map(r => ({
        id: r.id,
        referredEmail: userMap.get(r.referredId)?.email || "Unknown",
        referredAt: userMap.get(r.referredId)?.createdAt.toISOString() || r.createdAt.toISOString(),
        bonus: r.bonus.toNumber(),
        status: r.status
      }))
    }
  } catch (error) {
    console.error("[v0] Get referrals error:", error)
    return { error: "Failed to get referrals" }
  }
}

// Apply referral code during signup (call this after user creation)
export async function applyReferralCode(userId: string, referralCode: string) {
  try {
    if (!referralCode) return { success: true }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() }
    })

    if (!referrer) {
      return { error: "Invalid referral code" }
    }

    // Can't refer yourself
    if (referrer.id === userId) {
      return { error: "Cannot use your own referral code" }
    }

    // Check if already referred
    const existingReferral = await prisma.referral.findUnique({
      where: { referredId: userId }
    })

    if (existingReferral) {
      return { error: "Already have a referral" }
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: userId,
        status: "pending"
      }
    })

    // Update the referred user
    await prisma.user.update({
      where: { id: userId },
      data: { referredBy: referrer.id }
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Apply referral error:", error)
    return { error: "Failed to apply referral code" }
  }
}

// Admin: Get all referrals
export async function getAllReferrals() {
  try {
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

    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: "desc" }
    })

    // Get all user info
    const userIds = [...new Set(referrals.flatMap(r => [r.referrerId, r.referredId]))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true }
    })

    const userMap = new Map(users.map(u => [u.id, u.email]))

    return {
      referrals: referrals.map(r => ({
        id: r.id,
        referrerEmail: userMap.get(r.referrerId) || "Unknown",
        referredEmail: userMap.get(r.referredId) || "Unknown",
        bonus: r.bonus.toNumber(),
        status: r.status,
        createdAt: r.createdAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("[v0] Get all referrals error:", error)
    return { error: "Failed to get referrals" }
  }
}

// Admin: Credit referral bonus
export async function creditReferralBonus(referralId: string, bonusAmount: number) {
  try {
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

    const referral = await prisma.referral.findUnique({
      where: { id: referralId }
    })

    if (!referral) {
      return { error: "Referral not found" }
    }

    // Update referral with bonus and mark as credited
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        bonus: bonusAmount,
        status: "credited"
      }
    })

    // Add bonus to referrer's balance
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        balance: {
          increment: bonusAmount
        }
      }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("[v0] Credit bonus error:", error)
    return { error: "Failed to credit bonus" }
  }
}
