"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { executeTrade } from "@/app/actions/trade"
import { useRouter } from "next/navigation"

interface TradingPanelProps {
  userId: string
  balance: number | string
}

const CRYPTO_OPTIONS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "ripple", name: "Ripple", symbol: "XRP" },
]

export function TradingPanel({ userId, balance }: TradingPanelProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const balanceNum = typeof balance === "string" ? Number.parseFloat(balance) : balance

  const handleTrade = async (type: "buy" | "sell") => {
    setIsLoading(true)
    setError(null)

    try {
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }

      const symbol = CRYPTO_OPTIONS.find((c) => c.id === selectedCrypto)?.symbol || ""
      const result = await executeTrade({
        userId,
        type,
        cryptoId: selectedCrypto,
        symbol,
        amount: amountNum,
      })

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
        <CardTitle>Trade</CardTitle>
        <p className="text-sm text-muted-foreground">Balance: ${balanceNum.toFixed(2)}</p>
      </CardHeader>
      <CardContent>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={() => handleTrade("buy")} disabled={isLoading}>
              {isLoading ? "Processing..." : "Buy"}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={() => handleTrade("sell")} disabled={isLoading}>
              {isLoading ? "Processing..." : "Sell"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
