"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { executeAdminTrade } from "@/app/actions/admin"
import { toast } from "sonner"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { getAllMarketAssets, type CryptoPrice } from "@/lib/crypto-api"
import { cn } from "@/lib/utils"

interface AdminTradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userEmail: string
  userBalance: number
  onTradeComplete: () => void
}

export function AdminTradeDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  userBalance,
  onTradeComplete,
}: AdminTradeDialogProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [cryptoId, setCryptoId] = useState("")
  const [amount, setAmount] = useState("")
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customPrice, setCustomPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [assets, setAssets] = useState<CryptoPrice[]>([])
  const [isAssetsLoading, setIsAssetsLoading] = useState(true)
  const [openCombobox, setOpenCombobox] = useState(false)

  useEffect(() => {
    async function loadAssets() {
      setIsAssetsLoading(true)
      try {
        const allAssets = await getAllMarketAssets()
        setAssets(allAssets)
      } catch (error) {
        console.error("Failed to load assets", error)
        toast.error("Failed to load assets list")
      } finally {
        setIsAssetsLoading(false)
      }
    }
    if (open) {
      loadAssets()
    }
  }, [open])

  const selectedCrypto = assets.find((c) => c.id === cryptoId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cryptoId || !amount) {
      toast.error("Please fill in all fields")
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    let customPriceNum: number | undefined
    if (useCustomPrice) {
      customPriceNum = parseFloat(customPrice)
      if (isNaN(customPriceNum) || customPriceNum <= 0) {
        toast.error("Please enter a valid custom price")
        return
      }
    }

    setIsLoading(true)
    try {
      const result = await executeAdminTrade({
        userId,
        type: tradeType,
        cryptoId,
        symbol: selectedCrypto!.symbol,
        amount: amountNum,
        customPrice: customPriceNum,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Trade executed successfully for ${userEmail}`)
        onOpenChange(false)
        onTradeComplete()
        // Reset form
        setTradeType("buy")
        setCryptoId("")
        setAmount("")
        setUseCustomPrice(false)
        setCustomPrice("")
      }
    } catch (error) {
      console.error("Trade error:", error)
      toast.error("Failed to execute trade")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Trade for User</DialogTitle>
          <DialogDescription>
            Execute a trade on behalf of <strong>{userEmail}</strong>
            <br />
            Current balance: <strong>${userBalance.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Trade Type</Label>
              <Select
                value={tradeType}
                onValueChange={(value) => setTradeType(value as "buy" | "sell")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="crypto">Asset (Crypto, Stock, Commodity)</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {cryptoId
                      ? assets.find((asset) => asset.id === cryptoId)?.name
                      : isAssetsLoading ? "Loading assets..." : "Select asset..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-0">
                  <Command>
                    <CommandInput placeholder="Search asset..." />
                    <CommandList>
                      <CommandEmpty>No asset found.</CommandEmpty>
                      <CommandGroup>
                        {assets.map((asset) => (
                          <CommandItem
                            key={asset.id}
                            value={asset.name}
                            onSelect={() => {
                              setCryptoId(asset.id)
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cryptoId === asset.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {asset.name} ({asset.symbol.toUpperCase()})
                            <span className="ml-auto text-xs text-muted-foreground capitalize">
                              {asset.type || 'crypto'}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount in USD"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="useCustomPrice"
                className="h-4 w-4 rounded border-gray-300"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
              />
              <Label htmlFor="useCustomPrice">Use Custom Price (Over-the-Counter)</Label>
            </div>

            {useCustomPrice && (
              <div className="grid gap-2">
                <Label htmlFor="customPrice">Custom Price per Unit ($)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  placeholder="Enter custom price per coin"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  min="0"
                  step="0.000001"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Execute Trade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
