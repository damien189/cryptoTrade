"use server"
import { prisma } from "@/lib/prisma"

export async function checkRegistrationStatus() {
    console.log("Checking registration status...");
    try {
        const count = await prisma.user.count();
        console.log("User count result:", count);
        return { allowed: count === 0 };
    } catch (error) {
        console.error("Error checking registration status:", error);
        return { allowed: false, error: "Database error" };
    }
}
