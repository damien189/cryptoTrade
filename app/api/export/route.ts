import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build date filter
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.lte = new Date(endDate)
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        ...dateFilter
      },
      orderBy: { createdAt: "desc" }
    })

    // Get user info for report header
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, balance: true }
    })

    if (format === "csv") {
      // Generate CSV
      const csvHeader = "Date,Type,Symbol,Amount,Price (USD),Total (USD)\n"
      const csvRows = transactions.map(t => 
        `${t.createdAt.toISOString()},${t.type.toUpperCase()},${t.symbol},${t.amount.toNumber().toFixed(8)},${t.price.toNumber().toFixed(2)},${t.total.toNumber().toFixed(2)}`
      ).join("\n")

      const csvContent = csvHeader + csvRows

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="transactions_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    } else {
      // Generate PDF-friendly JSON (client will render as PDF)
      const totalBuys = transactions
        .filter(t => t.type === "buy")
        .reduce((sum, t) => sum + t.total.toNumber(), 0)
      
      const totalSells = transactions
        .filter(t => t.type === "sell")
        .reduce((sum, t) => sum + t.total.toNumber(), 0)

      const report = {
        generatedAt: new Date().toISOString(),
        user: {
          email: user?.email,
          name: user?.name,
          currentBalance: user?.balance.toNumber()
        },
        summary: {
          totalTransactions: transactions.length,
          totalBuyVolume: totalBuys,
          totalSellVolume: totalSells,
          netFlow: totalSells - totalBuys
        },
        transactions: transactions.map(t => ({
          date: t.createdAt.toISOString(),
          type: t.type,
          symbol: t.symbol,
          amount: t.amount.toNumber(),
          price: t.price.toNumber(),
          total: t.total.toNumber()
        }))
      }

      return NextResponse.json(report)
    }
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
