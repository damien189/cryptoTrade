import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { UserSettingsForm } from "@/components/user-settings-form"

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!userData) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader user={{ email: userData.email, role: userData.role }} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="max-w-2xl">
          <UserSettingsForm user={{ name: userData.name, email: userData.email }} />
        </div>
      </main>
    </div>
  )
}
