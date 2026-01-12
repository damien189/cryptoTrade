import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExportButton } from "@/components/export-button"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, History } from "lucide-react"

export default async function TransactionsPage() {
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

  // Fetch all transactions with pagination (latest 100 for now)
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  })

  // Calculate summary stats
  const totalBuys = transactions
    .filter(t => t.type === "buy")
    .reduce((sum, t) => sum + t.total.toNumber(), 0)
  
  const totalSells = transactions
    .filter(t => t.type === "sell")
    .reduce((sum, t) => sum + t.total.toNumber(), 0)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader user={{ email: userData.email, role: userData.role }} />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Transaction History</h2>
            <p className="text-muted-foreground">View and export your trading history</p>
          </div>
          <ExportButton />
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                Total Invested (Bought)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">${totalBuys.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Total Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${totalSells.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className={`text-2xl font-bold ${totalSells - totalBuys >= 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  {totalSells - totalBuys >= 0 ? "+" : ""}${(totalSells - totalBuys).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalSells - totalBuys >= 0 ? "Profit Realized" : "Net Invested"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Symbol</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="text-sm">{tx.createdAt.toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                          </p>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={tx.type === "buy" ? "default" : "secondary"}>
                            {tx.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 font-medium">{tx.symbol}</td>
                        <td className="py-3 px-2 text-right font-mono text-sm">
                          {tx.amount.toNumber().toFixed(8)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          ${tx.price.toNumber().toLocaleString()}
                        </td>
                        <td className={`py-3 px-2 text-right font-medium ${tx.type === "buy" ? "text-blue-600" : "text-green-600"}`}>
                          {tx.type === "buy" ? "" : "+"}${tx.total.toNumber().toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
