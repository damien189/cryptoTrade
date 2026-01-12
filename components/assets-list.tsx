"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCryptoPrices } from "@/lib/crypto-api"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface CryptoAsset {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  image: string
}

export function AssetsList() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAssets() {
      try {
        const data = await getCryptoPrices()
        setAssets(data)
      } catch (error) {
        console.error("[v0] Error fetching assets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
    // Refresh every minute
    const interval = setInterval(fetchAssets, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Principales Cryptomonnaies</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement des actifs...</p>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={asset.image || "/placeholder.svg"} alt={asset.name} className="h-8 w-8 rounded-full" />
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${asset.current_price.toLocaleString()}</p>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      asset.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {asset.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard/markets">Voir tous les actifs</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
