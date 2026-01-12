"use server"
import { prisma } from "@/lib/prisma"

export async function checkRegistrationStatus() {
    const count = await prisma.user.count()
    return { allowed: count === 0 }
}
