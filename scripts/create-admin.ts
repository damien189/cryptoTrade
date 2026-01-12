import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4] || "Admin User"

    if (!email || !password) {
        console.log("Usage: npx tsx scripts/create-admin.ts <email> <password> [name]")
        process.exit(1)
    }

    console.log(`Creating admin user: ${email}...`)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        console.log("User already exists. Updating role to admin...")
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: "admin" }
        })
        console.log("Role updated successfully.")
        return
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10)

    // Use a transaction to create User + Account
    await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                name,
                role: "admin",
                emailVerified: true,
                image: null
            }
        })

        await tx.account.create({
            data: {
                id: crypto.randomUUID(),
                userId: user.id,
                accountId: user.id, // Usually handled by auth provider, but for credential it's often the user id or email
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        console.log(`Admin user created with ID: ${user.id}`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
