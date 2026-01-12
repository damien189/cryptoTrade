"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCryptoChart } from "@/lib/crypto-api"
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CRYPTO_OPTIONS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "ripple", name: "Ripple", symbol: "XRP" },
]

export function CryptoChart() {
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin")
  const [timeframe, setTimeframe] = useState("7")
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)

  useEffect(() => {
    async function fetchChartData() {
      setIsLoading(true)
      try {
        const data = await getCryptoChart(selectedCrypto, Number.parseInt(timeframe))
        if (data?.prices) {
          const formatted = data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp).toLocaleDateString(),
            price: price,
          }))
          setChartData(formatted)

          if (formatted.length > 0) {
            const latest = formatted[formatted.length - 1].price
            const first = formatted[0].price
            setCurrentPrice(latest)
            setPriceChange(((latest - first) / first) * 100)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchChartData, 300000)
    return () => clearInterval(interval)
  }, [selectedCrypto, timeframe])

  const selectedCryptoName = CRYPTO_OPTIONS.find((c) => c.id === selectedCrypto)?.name || ""

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{selectedCryptoName}</CardTitle>
            {!isLoading && (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">${currentPrice.toLocaleString()}</p>
                <span className={`text-sm ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-[180px]">
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
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1">1D</TabsTrigger>
            <TabsTrigger value="7">7D</TabsTrigger>
            <TabsTrigger value="30">30D</TabsTrigger>
            <TabsTrigger value="90">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
              />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
