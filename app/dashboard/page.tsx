import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { AssetsList } from "@/components/assets-list"
import { RecentTransactions } from "@/components/recent-transactions"
import { CryptoNewsFeed } from "@/components/crypto-news"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const headersList = await headers()
  
  const session = await auth.api.getSession({
      headers: headersList
  })
  
  if (!session) {
    redirect("/auth/login")
  }

  const user = session.user

  // Fetch user data
  const userData = await prisma.user.findUnique({
      where: { id: user.id }
  })

  // Fetch portfolio
  const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
  })

  // Fetch recent transactions
  const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
  })

  const balance = userData?.balance ? userData.balance.toNumber() : 0
  
  const mappedPortfolios = portfolios.map(p => ({
      ...p,
      amount: p.amount.toNumber(),
      averagePrice: p.averagePrice.toNumber(),
  }))

  const mappedTransactions = transactions.map(t => ({
      ...t,
      amount: t.amount.toNumber(),
      price: t.price.toNumber(),
      total: t.total.toNumber(),
      createdAt: t.createdAt.toISOString()
  }))

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <PortfolioOverview balance={balance} portfolios={mappedPortfolios as any} /> 
        <div className="grid gap-6 lg:grid-cols-2">
          <AssetsList />
          <RecentTransactions transactions={mappedTransactions as any} />
        </div>
        <div className="grid gap-6 lg:grid-cols-1">
          <CryptoNewsFeed />
        </div>
      </main>
    </div>
  )
}

