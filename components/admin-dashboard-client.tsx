"use client"

import { useState, useEffect } from "react"
import { AdminUserSearch } from "@/components/admin-user-search"
import { AdminUserDetail } from "@/components/admin-user-detail"
import { AdminTradeHistory } from "@/components/admin-trade-history"
import { getUserDetails, getAllTrades } from "@/app/actions/admin"

interface UserResult {
  id: string
  email: string
  name: string | null
  role: string
  balance: number
  createdAt: string
}

interface UserDetail {
  id: string
  email: string
  name: string | null
  role: string
  balance: number
  createdAt: string
  portfolios: Array<{
    id: string
    symbol: string
    amount: number
    averagePrice: number
  }>
  transactions: Array<{
    id: string
    type: string
    symbol: string
    amount: number
    price: number
    total: number
    createdAt: string
  }>
}

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

interface AdminDashboardClientProps {
  initialTrades: Trade[]
}

export function AdminDashboardClient({ initialTrades }: AdminDashboardClientProps) {
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const handleSelectUser = async (user: UserResult) => {
    setIsLoadingUser(true)
    try {
      const result = await getUserDetails(user.id)
      if (result.user) {
        setSelectedUser(result.user)
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleTradeComplete = async () => {
    // Refresh user details
    if (selectedUser) {
      const result = await getUserDetails(selectedUser.id)
      if (result.user) {
        setSelectedUser(result.user)
      }
    }
    // Refresh trade history
    const tradesResult = await getAllTrades()
    if (tradesResult.trades) {
      setTrades(tradesResult.trades)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Search Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminUserSearch onSelectUser={handleSelectUser} />
        
        {isLoadingUser && (
          <div className="flex items-center justify-center rounded-lg border p-8">
            <p className="text-muted-foreground">Loading user details...</p>
          </div>
        )}
      </div>

      {/* Selected User Detail */}
      {selectedUser && !isLoadingUser && (
        <AdminUserDetail user={selectedUser} onTradeComplete={handleTradeComplete} />
      )}

      {/* Trade History */}
      <AdminTradeHistory trades={trades} />
    </div>
  )
}
