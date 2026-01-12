import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { CryptoConverter } from "@/components/crypto-converter"
import { CryptoTaxCalculator } from "@/components/crypto-tax-calculator"
import { Wrench, Zap, Shield } from "lucide-react"

export default async function ToolsPage() {
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

  if (!userData) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={{ email: userData.email, role: userData.role }} />
      <main className="flex-1 space-y-8 p-6 md:p-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Outils Professionnels</h2>
              <p className="text-muted-foreground">Suite d'outils avancés pour investisseurs avertis</p>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
            <Zap className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-semibold">Temps Réel</p>
              <p className="text-xs text-muted-foreground">Données actualisées en continu</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-semibold">Conformité Fiscale</p>
              <p className="text-xs text-muted-foreground">Réglementations européennes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
            <Wrench className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-semibold">Grade Institutionnel</p>
              <p className="text-xs text-muted-foreground">Précision professionnelle</p>
            </div>
          </div>
        </div>

        {/* Converter */}
        <CryptoConverter />

        {/* Tax Calculator */}
        <CryptoTaxCalculator />

        {/* Disclaimer */}
        <div className="p-4 rounded-lg bg-muted/30 border text-center">
          <p className="text-xs text-muted-foreground">
            ⚠️ Les informations fournies sont à titre indicatif uniquement et ne constituent pas des conseils financiers, 
            fiscaux ou juridiques. Consultez un professionnel qualifié pour toute décision d'investissement.
          </p>
        </div>
      </main>
    </div>
  )
}
