import { prisma } from "../lib/prisma"

async function main() {
  const users = await prisma.user.findMany({
    include: {
      sessions: true
    }
  })
  
  console.log("Users and Sessions:")
  console.dir(users, { depth: null })
  
  if (users.length === 0) {
      console.log("No users found.")
  } else {
      users.forEach(u => {
          if (u.sessions.length === 0) {
              console.log(`User ${u.email} has NO active sessions.`)
          } else {
              console.log(`User ${u.email} has ${u.sessions.length} active sessions.`)
          }
      })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
