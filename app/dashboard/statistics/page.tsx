import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatisticsContent } from "@/components/statistics-content"

export default async function StatisticsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true }
  })

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      <main className="flex-1 space-y-6 md:p-10">
        <StatisticsContent />
      </main>
    </div>
  )
}

