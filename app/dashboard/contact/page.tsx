"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitContactMessage } from "@/app/actions/contact"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const initialSubject = searchParams.get("subject") || ""
  const initialMessage = searchParams.get("message") || ""

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await submitContactMessage(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.push("/dashboard")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 container max-w-2xl mx-auto py-10 px-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Contactez-nous</CardTitle>
            <CardDescription>
              Envoyez-nous un message pour toute demande d'investissement ou de support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  defaultValue={initialSubject} 
                  required 
                  placeholder="Ex: Investissement Bitcoin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea 
                  id="content" 
                  name="content" 
                  defaultValue={initialMessage} 
                  required 
                  className="min-h-[150px]"
                  placeholder="Votre message ici..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
