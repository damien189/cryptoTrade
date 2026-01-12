"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getOrCreateReferralCode } from "@/app/actions/referral"
import { Copy, Check, Users, Gift, Share2 } from "lucide-react"

interface ReferralCardProps {
  initialCode?: string | null
}

export function ReferralCard({ initialCode }: ReferralCardProps) {
  const [code, setCode] = useState(initialCode || "")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialCode)

  useEffect(() => {
    if (!initialCode) {
      loadCode()
    }
  }, [initialCode])

  const loadCode = async () => {
    setIsLoading(true)
    const result = await getOrCreateReferralCode()
    if (result.code) {
      setCode(result.code)
    }
    setIsLoading(false)
  }

  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/auth/signup?ref=${code}`
    : ""

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Share your referral code and earn rewards when friends sign up
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Generating code...</div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex gap-2">
                <Input 
                  value={code} 
                  readOnly 
                  className="font-mono text-lg font-bold tracking-widest text-center bg-background"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(code)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Link</label>
              <div className="flex gap-2">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="text-sm bg-background"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(referralLink)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Share with friends to earn bonuses</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
