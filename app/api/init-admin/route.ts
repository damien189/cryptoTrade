import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Safety Check: Only run if DB is empty
        const count = await prisma.user.count()
        if (count > 0) {
            return NextResponse.json({
                error: "Setup BLOCKED: Users already exist.",
                message: "To reset, you must clear your database in Supabase first."
            }, { status: 400 })
        }

        // 2. Define Admin Credentials
        const email = "damien@damien.com"
        const password = "password123"
        const name = "Admin Damien"

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. Create User & Account using Transaction
        const newUser = await prisma.$transaction(async (tx) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    email,
                    name,
                    role: "admin",
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    // Initialize default balance logic if any (optional)
                }
            })

            // Create Credential Account
            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    accountId: user.id, // For credentials, we can use user ID as provider key
                    providerId: "credential",
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })

            return user
        })

        return NextResponse.json({
            success: true,
            message: "Admin successfully created!",
            credentials: {
                email: email,
                password: password,
                note: "Please login immediately and change your password."
            }
        })

    } catch (error: any) {
        console.error("Init Error:", error)
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
    }
}
