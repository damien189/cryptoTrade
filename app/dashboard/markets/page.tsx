import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { MarketsGrid } from "@/components/markets-grid"

export default async function MarketsPage() {
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
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={userData} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Marchés Mondiaux</h2>
          <p className="text-muted-foreground">
            Cours en direct des Cryptos, Actions et Matières Premières
          </p>
        </div>
        <MarketsGrid />
      </main>
    </div>
  )
}
