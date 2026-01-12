"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface Withdrawal {
  id: string
  amount: string | number
  status: string
  createdAt?: string
  created_at?: string
}

interface WithdrawalHistoryProps {
  withdrawals: Withdrawal[]
}

export function WithdrawalHistory({ withdrawals }: WithdrawalHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            EN ATTENTE
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            APPROUVÉ
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            REFUSÉ
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Retraits</CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune demande de retrait</p>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => {
              const dateStr = withdrawal.createdAt || withdrawal.created_at
              const amount = typeof withdrawal.amount === 'string' 
                ? Number.parseFloat(withdrawal.amount) 
                : withdrawal.amount
              return (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">${amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {dateStr ? formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr }) : "Date inconnue"}
                    </p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

