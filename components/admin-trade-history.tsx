"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { History } from "lucide-react"

interface Trade {
  id: string
  userId: string
  userEmail: string
  type: string
  symbol: string
  amount: number
  price: number
  total: number
  createdAt: string
}

interface AdminTradeHistoryProps {
  trades: Trade[]
}

export function AdminTradeHistory({ trades }: AdminTradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          All Trade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No trades have been executed yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === "buy" ? "default" : "destructive"}>
                      {trade.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{trade.symbol}</TableCell>
                  <TableCell className="text-right">
                    {trade.amount.toFixed(8)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${trade.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${trade.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(trade.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
