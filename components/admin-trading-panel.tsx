"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { executeAdminTrade } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  balance: number
}

interface AdminTradingPanelProps {
  users: User[]
}

const CRYPTO_OPTIONS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "ripple", name: "Ripple", symbol: "XRP" },
]

export function AdminTradingPanel({ users }: AdminTradingPanelProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin")
  const [amount, setAmount] = useState("")
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customPrice, setCustomPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const selectedUserData = users.find(u => u.id === selectedUser)

  const handleTrade = async (type: "buy" | "sell") => {
    if (!selectedUser) {
      setError("Please select a user")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }

      let customPriceNum: number | undefined
      if (useCustomPrice) {
        customPriceNum = Number.parseFloat(customPrice)
        if (isNaN(customPriceNum) || customPriceNum <= 0) {
          throw new Error("Please enter a valid custom price")
        }
      }

      const symbol = CRYPTO_OPTIONS.find((c) => c.id === selectedCrypto)?.symbol || ""
      const result = await executeAdminTrade({
        userId: selectedUser,
        type,
        cryptoId: selectedCrypto,
        symbol,
        amount: amountNum,
        customPrice: customPriceNum,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setAmount("")
      setUseCustomPrice(false)
      setCustomPrice("")
      setSuccess(`Successfully ${type === "buy" ? "bought" : "sold"} ${symbol} for ${selectedUserData?.email}`)
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
        <CardTitle>Execute Trade</CardTitle>
        <p className="text-sm text-muted-foreground">Trade on behalf of a user</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Selection */}
        <div className="space-y-2">
          <Label htmlFor="user-select">Select User</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Choose a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} (${user.balance.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserData && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Selected User Balance</p>
            <p className="text-2xl font-bold">${selectedUserData.balance.toFixed(2)}</p>
          </div>
        )}

        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-crypto">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger id="buy-crypto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-amount">Amount (USD)</Label>
              <Input
                id="buy-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="buy-useCustomPrice"
                className="h-4 w-4 rounded border-gray-300"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
              />
              <Label htmlFor="buy-useCustomPrice">Use Custom Price (OTC)</Label>
            </div>

            {useCustomPrice && (
              <div className="space-y-2">
                <Label htmlFor="buy-customPrice">Custom Price per Unit ($)</Label>
                <Input
                  id="buy-customPrice"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button className="w-full" onClick={() => handleTrade("buy")} disabled={isLoading || !selectedUser}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Processing..." : "Buy for User"}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-crypto">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger id="sell-crypto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount (USD)</Label>
              <Input
                id="sell-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sell-useCustomPrice"
                className="h-4 w-4 rounded border-gray-300"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
              />
              <Label htmlFor="sell-useCustomPrice">Use Custom Price (OTC)</Label>
            </div>

            {useCustomPrice && (
              <div className="space-y-2">
                <Label htmlFor="sell-customPrice">Custom Price per Unit ($)</Label>
                <Input
                  id="sell-customPrice"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button className="w-full" onClick={() => handleTrade("sell")} disabled={isLoading || !selectedUser}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Processing..." : "Sell for User"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
