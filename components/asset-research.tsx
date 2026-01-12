"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllMarketAssets, type CryptoPrice } from "@/lib/crypto-api"
import { Search, TrendingUp, ArrowRight, Star, BarChart3, Zap } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function AssetResearch() {
  const router = useRouter()
  const [assets, setAssets] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await getAllMarketAssets()
        setAssets(data)
      } catch (error) {
        console.error("Failed to load assets", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAssets()
  }, [])

  const handleSelect = (asset: CryptoPrice) => {
    setOpen(false)
    router.push(`/dashboard/crypto/${asset.id}`)
  }

  const [showAll, setShowAll] = useState(false)

  const featuredAssets = showAll 
    ? assets 
    : assets
      .filter(a => a.price_change_percentage_24h > 2)
      .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8md:p-12 border">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Badge className="mb-4" variant="secondary">
            <Zap className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
            Intelligence Artificielle de Trading
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Découvrez Votre Prochain Investissement
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Analysez les tendances, explorez l'historique et prenez des décisions éclairées avec nos outils professionnels.
          </p>

          <div className="relative mx-auto max-w-xl">
             <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full h-14 justify-between px-4 text-base shadow-lg border-primary/20"
                >
                  <span className="flex items-center text-muted-foreground">
                    <Search className="mr-2 h-5 w-5" />
                    {searchQuery || "Rechercher un actif (ex: Bitcoin, Apple, Or...)"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Chercher..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun actif trouvé.</CommandEmpty>
                    <CommandGroup heading="Actifs Disponibles">
                      {assets.map((asset) => (
                        <CommandItem
                          key={asset.id}
                          value={asset.name}
                          onSelect={() => handleSelect(asset)}
                        >
                          <div className="flex items-center w-full">
                            <img src={asset.image} alt={asset.name} className="h-6 w-6 mr-3 rounded-full" />
                            <span className="font-semibold">{asset.name}</span>
                            <span className="ml-2 text-muted-foreground text-xs uppercase">{asset.symbol}</span>
                            <span className={cn(
                              "ml-auto text-sm font-medium",
                              asset.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {asset.price_change_percentage_24h > 0 ? "+" : ""}
                              {asset.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Featured / Trending */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
            {showAll ? "Tous les Actifs" : "Opportunités du Moment"}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Voir moins" : "Voir tout"} <ArrowRight className={cn("ml-1 h-4 w-4 transition-transform", showAll && "rotate-90")} />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {isLoading ? (
             Array(3).fill(0).map((_, i) => (
               <Card key={i} className="animate-pulse">
                 <CardHeader className="h-24 bg-muted/50" />
                 <CardContent className="h-32" />
               </Card>
             ))
          ) : (
            featuredAssets.map((asset) => (
              <Card 
                key={asset.id} 
                className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                onClick={() => router.push(`/dashboard/crypto/${asset.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <img src={asset.image} alt={asset.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <CardTitle className="text-base font-bold">{asset.name}</CardTitle>
                      <CardDescription className="uppercase font-semibold text-xs">{asset.symbol}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                    Strong Buy
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 flex items-baseline justify-between">
                    <div className="text-2xl font-bold">
                      ${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{asset.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 line-clamp-2">
                     Analystes prévoient une croissance continue pour {asset.name} grâce à des indicateurs techniques favorables.
                  </p>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                     <span className="flex items-center"><BarChart3 className="h-3 w-3 mr-1" /> Vol: ${(asset.total_volume / 1e9).toFixed(1)}B</span>
                     <span className="flex items-center"><Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" /> 4.9/5</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      
      {/* Educational / "Why Invest" preview */}
      <section className="grid gap-6 md:grid-cols-2">
         <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardHeader>
               <CardTitle>Pourquoi diversifier ?</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-sm">
                  Investir dans un mélange d'actions de la technologie (Tech), de matières premières (Or, Pétrole) et de crypto-monnaies réduit votre risque global et maximise vos chances de rendements élevés. Notre plateforme vous donne accès à tous ces marchés en un clic.
               </p>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-purple-500/5 to-transparent">
             <CardHeader>
               <CardTitle>Analyse Technique Simplifiée</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-sm">
                  Ne devinez pas. Utilisez nos graphiques avancés et nos indicateurs "Strong Buy" basés sur l'intelligence artificielle pour identifier les meilleurs points d'entrée. 
               </p>
            </CardContent>
         </Card>
      </section>
    </div>
  )
}
