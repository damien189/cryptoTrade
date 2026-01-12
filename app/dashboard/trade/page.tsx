import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { CryptoChart } from "@/components/crypto-chart"
import { AdminTradingPanel } from "@/components/admin-trading-panel"

export default async function TradePage() {
  const session = await auth.api.getSession({
      headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  // Verify admin role - only admins can access trade page
  const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
  })

  if (userData?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all users for admin to select
  const users = await prisma.user.findMany({
    where: { role: "user" },
    select: { id: true, email: true, name: true, balance: true }
  })

  const mappedUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    balance: u.balance.toNumber()
  }))

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Execute Trade</h2>
          <p className="text-muted-foreground">Execute trades on behalf of users</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div>
            <AdminTradingPanel users={mappedUsers} />
          </div>
        </div>
      </main>
    </div>
  )
}
