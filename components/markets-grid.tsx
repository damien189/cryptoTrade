"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCryptoChart, getAllMarketAssets, type CryptoPrice } from "@/lib/crypto-api"
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Loader2, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface MiniChartData {
  price: number
}

interface MarketCardProps {
  asset: CryptoPrice
}

function MarketCard({ asset }: MarketCardProps) {
  const [chartData, setChartData] = useState<MiniChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock chart data based on price trend
  const generateMockChart = (basePrice: number, isPositive: boolean): MiniChartData[] => {
    const data: MiniChartData[] = []
    let price = basePrice * 0.95
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.45) * (basePrice * 0.02)
      price = price + change + (isPositive ? basePrice * 0.001 : -basePrice * 0.0005)
      data.push({ price: Math.max(price, basePrice * 0.8) })
    }
    return data
  }

  useEffect(() => {
    async function fetchChart() {
      try {
        const data = await getCryptoChart(asset.id, 7)
        if (data?.prices && data.prices.length > 0) {
          const sampleRate = Math.max(1, Math.floor(data.prices.length / 50))
          const sampled = data.prices
            .filter((_, i) => i % sampleRate === 0)
            .map(([, price]) => ({ price }))
          setChartData(sampled)
        } else {
          // Use mock data if API returns empty
          const basePrice = asset.current_price || 1000
          const isPositive = asset.price_change_percentage_24h >= 0
          setChartData(generateMockChart(basePrice, isPositive))
        }
      } catch (error) {
        console.error(`Error fetching chart for ${asset.id}:`, error)
        // Fallback to mock chart data
        const basePrice = asset.current_price || 1000
        const isPositive = asset.price_change_percentage_24h >= 0
        setChartData(generateMockChart(basePrice, isPositive))
      } finally {
        setIsLoading(false)
      }
    }

    fetchChart()
  }, [asset.id, asset.current_price, asset.price_change_percentage_24h])


  const isPositive = asset.price_change_percentage_24h >= 0
  const chartColor = isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {asset.image && (
              <img
                src={asset.image}
                alt={asset.name}
                className="h-10 w-10 rounded-full object-contain bg-white/5 p-0.5"
              />
            )}
            <div>
              <CardTitle className="text-lg">{asset.name}</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{asset.symbol.toUpperCase()}</p>
                {asset.type && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 uppercase">
                    {asset.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              ${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-[120px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Prix"]}
                labelFormatter={() => ""}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>Vol: ${(asset.total_volume / 1e9).toFixed(2)}B</span>
          <span>Cap: ${(asset.market_cap / 1e9).toFixed(2)}B</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketsGrid() {
  const [assets, setAssets] = useState<CryptoPrice[]>([])
  const [filteredAssets, setFilteredAssets] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchAssets() {
      try {
        const data = await getAllMarketAssets()
        setAssets(data)
        setFilteredAssets(data)
      } catch (error) {
        console.error("Error fetching assets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
    const interval = setInterval(fetchAssets, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let result = assets

    // Filter by type
    if (activeTab !== "all") {
      result = result.filter(asset => asset.type === activeTab || (!asset.type && activeTab === 'crypto')) // Default to crypto if no type
    }

    // Filter by search
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(term) || 
        asset.symbol.toLowerCase().includes(term)
      )
    }

    setFilteredAssets(result)
  }, [search, activeTab, assets])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="crypto">Cryptos</TabsTrigger>
            <TabsTrigger value="stock">Actions</TabsTrigger>
            <TabsTrigger value="commodity">Matières Prem.</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un actif..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredAssets.length === 0 ? (
         <div className="text-center py-20 text-muted-foreground">
           Aucun actif trouvé correspondant à votre recherche.
         </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <Link key={asset.id} href={`/dashboard/crypto/${asset.symbol}`}>
              <MarketCard asset={asset} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
