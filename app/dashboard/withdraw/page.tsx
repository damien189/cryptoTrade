import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { WithdrawalForm } from "@/components/withdrawal-form"
import { WithdrawalHistory } from "@/components/withdrawal-history"

export default async function WithdrawPage() {
  const session = await auth.api.getSession({
      headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  const user = session.user

  const userData = await prisma.user.findUnique({
      where: { id: user.id }
  })

  const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
  })

  const mappedWithdrawals = withdrawals.map(w => ({
      ...w,
      amount: w.amount.toNumber(),
      createdAt: w.createdAt.toISOString()
  }))

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Withdraw Funds</h2>
          <p className="text-muted-foreground">Request a withdrawal from your account balance</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <WithdrawalForm balance={userData?.balance ? userData.balance.toNumber() : 0} />
          <WithdrawalHistory withdrawals={mappedWithdrawals as any} />
        </div>
      </main>
    </div>
  )
}
