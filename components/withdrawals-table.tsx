"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { approveWithdrawal, rejectWithdrawal } from "@/app/actions/admin"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Withdrawal {
  id: string
  amount: string
  status: string
  created_at?: string
  createdAt?: string
  users?: {
    email: string
  }
}

interface WithdrawalsTableProps {
  withdrawals: Withdrawal[]
  title?: string
}

export function WithdrawalsTable({ withdrawals, title = "Pending Withdrawals" }: WithdrawalsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    await approveWithdrawal(id)
    setLoadingId(null)
    router.refresh()
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    await rejectWithdrawal(id)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No withdrawals found
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => {
                const dateStr = withdrawal.createdAt || withdrawal.created_at
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">{withdrawal.users?.email || "Unknown"}</TableCell>
                    <TableCell>${Number.parseFloat(withdrawal.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={withdrawal.status === "approved" ? "default" : withdrawal.status === "rejected" ? "destructive" : "secondary"}>
                        {withdrawal.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateStr ? new Date(dateStr).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={loadingId === withdrawal.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={loadingId === withdrawal.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
