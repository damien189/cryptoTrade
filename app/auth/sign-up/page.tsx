"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { checkRegistrationStatus } from "@/app/actions/auth-check"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkRegistrationStatus()
      .then((status) => {
        console.log("Status received:", status);
        if (status.error) {
          console.error("Server action returned error:", status.error);
          // If DB check fails, we allow the USER to see the form.
          // The backend hook will still block if users actually exist.
          setIsAllowed(true);
        } else {
          setIsAllowed(status.allowed);
        }
      })
      .catch((err) => {
        console.error("Failed to check status:", err);
        // Fail Open: Allow user to try if the check completely crashes
        setIsAllowed(true);
      })
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      }, {
        onRequest: () => setIsLoading(true),
        onSuccess: () => router.push("/dashboard"),
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err?.message || "An unexpected error occurred.");
      setIsLoading(false)
    }
  }

  if (isAllowed === null) {
    return <div className="flex h-screen items-center justify-center">Checking registration status...</div>
  }

  if (!isAllowed) {
    // If there was a specific error (like DB connection), show that instead of "Closed"
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Registration Closed</CardTitle>
            <CardDescription>
              Public registration is currently disabled. Only the administrator could have created the first account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Admin Account</CardTitle>
            <CardDescription>
              This is the <b>First User Claim</b>. You will be the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
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
                  {isLoading ? "Creating Account..." : "Create Admin Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
