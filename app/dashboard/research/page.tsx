import { DashboardHeader } from "@/components/dashboard-header"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AssetResearch } from "@/components/asset-research"

export default async function ResearchPage() {
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

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={userData ? { email: userData.email, role: userData.role } : null} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Centre de Recherche</h2>
          <p className="text-muted-foreground">Analyses détaillées et opportunités d'investissement</p>
        </div>
        <AssetResearch />
      </main>
    </div>
  )
}
