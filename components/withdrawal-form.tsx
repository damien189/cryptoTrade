"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { requestWithdrawal } from "@/app/actions/withdrawal"
import { useRouter } from "next/navigation"

interface WithdrawalFormProps {
  balance: number | string
}

export function WithdrawalForm({ balance }: WithdrawalFormProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const balanceNum = typeof balance === "string" ? Number.parseFloat(balance) : balance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }
      if (amountNum > balanceNum) {
        throw new Error("Insufficient balance")
      }

      const result = await requestWithdrawal(amountNum)
      if (result.error) {
        throw new Error(result.error)
      }

      setAmount("")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>Enter the amount you want to withdraw</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">Available balance: ${balanceNum.toFixed(2)}</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Request Withdrawal"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Withdrawal requests are reviewed by our team. You will see the status as "Pending" until approved.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
