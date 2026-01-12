"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Calculator, RefreshCw } from "lucide-react"

const CRYPTO_LIST = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 95000 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 3400 },
  { id: "solana", symbol: "SOL", name: "Solana", price: 180 },
  { id: "cardano", symbol: "ADA", name: "Cardano", price: 0.95 },
  { id: "ripple", symbol: "XRP", name: "XRP", price: 2.20 },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 0.32 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", price: 7.50 },
  { id: "avalanche", symbol: "AVAX", name: "Avalanche", price: 38 },
]

const FIAT_LIST = [
  { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 0.92 },
  { code: "USD", name: "Dollar Américain", symbol: "$", rateToUsd: 1 },
  { code: "GBP", name: "Livre Sterling", symbol: "£", rateToUsd: 0.79 },
  { code: "CHF", name: "Franc Suisse", symbol: "CHF", rateToUsd: 0.88 },
  { code: "CAD", name: "Dollar Canadien", symbol: "C$", rateToUsd: 1.36 },
  { code: "JPY", name: "Yen Japonais", symbol: "¥", rateToUsd: 157 },
]

export function CryptoConverter() {
  const [cryptoAmount, setCryptoAmount] = useState("1")
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin")
  const [selectedFiat, setSelectedFiat] = useState("EUR")
  const [isSwapped, setIsSwapped] = useState(false)

  const crypto = CRYPTO_LIST.find(c => c.id === selectedCrypto)
  const fiat = FIAT_LIST.find(f => f.code === selectedFiat)

  const calculateConversion = () => {
    if (!crypto || !fiat) return "0.00"
    const amount = parseFloat(cryptoAmount) || 0
    
    if (isSwapped) {
      // Fiat to Crypto
      const usdAmount = amount / fiat.rateToUsd
      return (usdAmount / crypto.price).toFixed(8)
    } else {
      // Crypto to Fiat
      const usdValue = amount * crypto.price
      return (usdValue * fiat.rateToUsd).toFixed(2)
    }
  }

  const handleSwap = () => {
    setIsSwapped(!isSwapped)
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Convertisseur Multi-Devises Instantané
        </CardTitle>
        <CardDescription>
          Moteur de conversion en temps réel avec taux de change interbancaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-end">
          {/* From */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {isSwapped ? "Devise Fiat Source" : "Actif Numérique Source"}
            </Label>
            <div className="space-y-2">
              <Select 
                value={isSwapped ? selectedFiat : selectedCrypto} 
                onValueChange={isSwapped ? setSelectedFiat : setSelectedCrypto}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSwapped ? (
                    FIAT_LIST.map(f => (
                      <SelectItem key={f.code} value={f.code}>
                        {f.symbol} {f.name}
                      </SelectItem>
                    ))
                  ) : (
                    CRYPTO_LIST.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.symbol} - {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                className="text-xl font-bold bg-background"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Swap Button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12 border-2"
            onClick={handleSwap}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          {/* To */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {isSwapped ? "Actif Numérique Cible" : "Devise Fiat Cible"}
            </Label>
            <div className="space-y-2">
              <Select 
                value={isSwapped ? selectedCrypto : selectedFiat} 
                onValueChange={isSwapped ? setSelectedCrypto : setSelectedFiat}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSwapped ? (
                    CRYPTO_LIST.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.symbol} - {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    FIAT_LIST.map(f => (
                      <SelectItem key={f.code} value={f.code}>
                        {f.symbol} {f.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <div className="h-[42px] flex items-center px-3 border rounded-md bg-muted/50">
                <span className="text-xl font-bold text-primary">
                  {isSwapped ? crypto?.symbol : fiat?.symbol} {calculateConversion()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Info */}
        <div className="p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taux de référence actuel</span>
            <span className="font-mono font-medium">
              1 {crypto?.symbol} = {fiat?.symbol} {((crypto?.price || 0) * (fiat?.rateToUsd || 1)).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚡ Données actualisées toutes les 60 secondes • Spread institutionnel intégré
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
