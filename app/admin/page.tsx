import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminStats } from "@/components/admin-stats"
import { UsersTable } from "@/components/users-table"
import { WithdrawalsTable } from "@/components/withdrawals-table"
import { AdminDashboardClient } from "@/components/admin-dashboard-client"
import { AdminMessages } from "@/components/admin-messages"

// ... imports

export default async function AdminPage() {
  const session = await auth.api.getSession({
      headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  // Verify admin role
  const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
  })

  if (userData?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch admin data
  const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
  })

  const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
  })

  const allWithdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { email: true } } }
  })

  // Fetch all trades with user info
  const allTrades = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: { email: true }
      }
    }
  })

  // Fetch messages
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })

  // Convert Decimals & Map Data
  const mappedUsers = users.map(u => ({
      ...u,
      balance: u.balance.toNumber()
  }))

  const mappedPendingWithdrawals = pendingWithdrawals.map(w => ({
      ...w,
      amount: w.amount.toNumber(),
      createdAt: w.createdAt.toISOString(),
      users: w.user
  }))

  const mappedAllWithdrawals = allWithdrawals.map(w => ({
      ...w,
      amount: w.amount.toNumber(),
      createdAt: w.createdAt.toISOString(),
      users: w.user
  }))

  const mappedTrades = allTrades.map(t => ({
    id: t.id,
    userId: t.userId,
    userEmail: t.user.email,
    type: t.type,
    symbol: t.symbol,
    amount: t.amount.toNumber(),
    price: t.price.toNumber(),
    total: t.total.toNumber(),
    createdAt: t.createdAt.toISOString()
  }))

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={{ email: userData.email, role: "admin" }} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users, trades, and withdrawal requests</p>
        </div>
        <AdminStats users={mappedUsers as any} withdrawals={mappedAllWithdrawals as any} />
        
        {/* Messages Section */}
        <AdminMessages messages={messages} />

        {/* New Admin Features: User Search, Detail View, Trade History */}
        <AdminDashboardClient initialTrades={mappedTrades} />
        
        <div className="space-y-6">
          <WithdrawalsTable 
            withdrawals={mappedPendingWithdrawals as any} 
            title="Demandes de Retrait (En attente)" 
          />
          <WithdrawalsTable 
            withdrawals={mappedAllWithdrawals as any} 
            title="Historique des Retraits (20 derniers)"
          />
          <UsersTable users={mappedUsers as any} />
        </div>
      </main>
    </div>
  )
}
