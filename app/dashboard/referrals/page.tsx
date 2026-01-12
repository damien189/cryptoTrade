import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { ReferralCard } from "@/components/referral-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Clock, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function ReferralsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/auth/login")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true, referralCode: true }
  })

  if (!userData) {
    redirect("/auth/login")
  }

  // Get user's referrals
  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    orderBy: { createdAt: "desc" }
  })

  // Get referred user details
  const referredUserIds = referrals.map(r => r.referredId)
  const referredUsers = await prisma.user.findMany({
    where: { id: { in: referredUserIds } },
    select: { id: true, email: true, createdAt: true }
  })

  const userMap = new Map(referredUsers.map(u => [u.id, u]))

  const totalEarned = referrals.reduce((sum, r) => sum + r.bonus.toNumber(), 0)
  const pendingCount = referrals.filter(r => r.status === "pending").length

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={{ email: userData.email, role: userData.role }} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Referral Program</h2>
          <p className="text-muted-foreground">Invite friends and earn rewards</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{referrals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${totalEarned.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Referral Card */}
          <ReferralCard initialCode={userData.referralCode} />

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No referrals yet. Share your code to start earning!
                </p>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => {
                    const referredUser = userMap.get(referral.referredId)
                    return (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">
                            {referredUser?.email?.split("@")[0] || "User"}***
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDistanceToNow(referral.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          {referral.status === "credited" ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              +${referral.bonus.toNumber().toFixed(2)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
