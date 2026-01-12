"use client"

import type React from "react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
        }, {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: async () => {
            console.log("Login successful via callback, redirecting...")
          },
          onError: (ctx) => {
            console.error("Login error via callback:", ctx.error)
          }
        })
        
        console.log("Sign in response:", { data, signInError })
        
        if (signInError) {
          console.error("Login error:", signInError)
          setError(signInError.message || "Failed to sign in")
          setIsLoading(false)
          return
        }
        
        if (data) {
          console.log("Login successful, redirecting to dashboard...")
          // Force a hard navigation to ensure cookies are sent and page state resets
          window.location.href = "/dashboard"
        } else {
          setError("Login failed - no session returned")
          setIsLoading(false)
        }
    } catch (err) {
        console.error("Unexpected login error:", err)
        setError("An unexpected error occurred")
        setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="trader@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
