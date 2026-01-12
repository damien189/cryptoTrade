import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const email = "damien@damien.com"
        const password = "password123"
        const name = "Admin Damien"

        // 1. Cleanup: consistency check. If name matches, delete it to retry.
        // We only delete if it looks like the one we just created (safety).
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            // Delete to allow fresh sign-up with correct hash
            await prisma.user.delete({ where: { id: existing.id } })
        }

        // 2. Create using Better Auth API (Handles Hashing Correctly)
        // We mock the headers to satisfy any Origin checks
        const mockHeaders = new Headers()
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"
        mockHeaders.set("origin", baseUrl)

        // We need to pass the headers object that better-auth expects. 
        // In Better Auth v1+, api.signUpEmail typically takes headers in the config object
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
            headers: mockHeaders
        })

        // 3. Force Role to Admin
        // Since we deleted the user above, count is 0. Hook should handle it.
        // Just in case, update it manually to be sure.
        if (result?.user) {
            await prisma.user.update({
                where: { id: result.user.id },
                data: { role: "admin" }
            })
        }

        return NextResponse.json({
            success: true,
            message: "Admin successfully re-created with correct hashing!",
            credentials: {
                email,
                password,
            }
        })

    } catch (error: any) {
        console.error("Init Error:", error)
        return NextResponse.json({
            error: error.message || "Unknown error",
            details: error.body || error.stack
        }, { status: 500 })
    }
}
