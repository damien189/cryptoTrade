"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Transaction {
  id: string
  type: string
  symbol: string
  amount: string | number
  price: string | number
  total: string | number
  createdAt?: string
  created_at?: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

function safeFormatDate(dateStr: string | undefined): string {
  if (!dateStr) return "Unknown"
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "Inconnu"
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
  } catch {
    return "Unknown"
  }
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune transaction</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const amount = typeof tx.amount === 'string' ? Number.parseFloat(tx.amount) : tx.amount
              const price = typeof tx.price === 'string' ? Number.parseFloat(tx.price) : tx.price
              const total = typeof tx.total === 'string' ? Number.parseFloat(tx.total) : tx.total
              const dateStr = tx.createdAt || tx.created_at
              
              return (
                <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.type === "buy" ? "default" : "secondary"}>{tx.type === "buy" ? "ACHAT" : "VENTE"}</Badge>
                      <p className="font-medium">{tx.symbol}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {amount.toFixed(8)} @ ${price.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {safeFormatDate(dateStr)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === "buy" ? "text-blue-600" : "text-green-600"}`}>
                      {tx.type === "buy" ? "" : "+"}${total.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

