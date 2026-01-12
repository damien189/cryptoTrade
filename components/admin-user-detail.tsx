"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Wallet, TrendingUp, Calendar, Lock } from "lucide-react"
import { useState } from "react"
import { AdminTradeDialog } from "@/components/admin-trade-dialog"

interface Portfolio {
  id: string
  symbol: string
  amount: number
  averagePrice: number
}

interface Transaction {
  id: string
  type: string
  symbol: string
  amount: number
  price: number
  total: number
  createdAt: string
}

interface UserDetail {
  id: string
  email: string
  name: string | null
  role: string
  balance: number
  createdAt: string
  portfolios: Portfolio[]
  transactions: Transaction[]
}

interface AdminUserDetailProps {
  user: UserDetail
  onTradeComplete: () => void
}

export function AdminUserDetail({ user, onTradeComplete }: AdminUserDetailProps) {
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)

  const totalPortfolioValue = user.portfolios.reduce(
    (acc, p) => acc + p.amount * p.averagePrice,
    0
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{user.email}</CardTitle>
              <CardDescription>
                User ID: {user.id.slice(0, 8)}...
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <Button onClick={() => setIsTradeDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Trade
              </Button>
              <Button variant="outline" onClick={() => setIsPasswordResetOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Reset Pass
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">${user.balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Portfolio Holdings */}
          <div>
            <h3 className="mb-3 font-semibold">Portfolio Holdings</h3>
            {user.portfolios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No holdings</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.portfolios.map((portfolio) => (
                    <TableRow key={portfolio.id}>
                      <TableCell className="font-medium">{portfolio.symbol}</TableCell>
                      <TableCell className="text-right">
                        {portfolio.amount.toFixed(8)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${portfolio.averagePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${(portfolio.amount * portfolio.averagePrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Separator />

          {/* Recent Transactions */}
          <div>
            <h3 className="mb-3 font-semibold">Recent Transactions</h3>
            {user.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Badge variant={tx.type === "buy" ? "default" : "destructive"}>
                          {tx.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{tx.symbol}</TableCell>
                      <TableCell className="text-right">
                        {tx.amount.toFixed(8)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${tx.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${tx.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <AdminTradeDialog
        open={isTradeDialogOpen}
        onOpenChange={setIsTradeDialogOpen}
        userId={user.id}
        userEmail={user.email}
        userBalance={user.balance}
        onTradeComplete={onTradeComplete}
      />
      <AdminPasswordResetDialog
        open={isPasswordResetOpen}
        onOpenChange={setIsPasswordResetOpen}
        userId={user.id}
        userEmail={user.email}
      />
    </>
  )
}

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminResetUserPassword } from "@/app/actions/admin"
import { toast } from "sonner"


function AdminPasswordResetDialog({
  open,
  onOpenChange,
  userId,
  userEmail
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const result = await adminResetUserPassword(userId, password)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset successfully")
      onOpenChange(false)
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new temporary password for <b>{userEmail}</b>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-admin-password">New Password</Label>
            <Input
              id="new-admin-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
