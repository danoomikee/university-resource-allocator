"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, getCurrentUser } from "@/lib/auth"
import { Building2, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      if (currentUser.mustChangePassword) {
        router.push("/change-password")
      } else if (currentUser.role === "SuperAdmin") {
        router.push("/super-admin")
      } else {
        router.push("/entity-admin")
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = login(username, password)

      if (result.success && result.user) {
        if (result.user.mustChangePassword) {
          router.push("/change-password")
        } else if (result.user.role === "SuperAdmin") {
          router.push("/super-admin")
        } else {
          router.push("/entity-admin")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
            <GraduationCap className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">University Resource System</h1>
          <p className="text-muted-foreground text-pretty">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-sm text-muted-foreground text-center">New university?</p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push("/university/register")}
              >
                Register Your University
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" onClick={() => router.push("/")} className="text-sm text-muted-foreground">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
