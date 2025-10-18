"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { login, getCurrentUser } from "@/lib/auth"
import { Building2, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("")
  const [userRole, setUserRole] = useState<"SuperAdmin" | "EntityAdmin" | null>(null)
  const [availableEntities, setAvailableEntities] = useState<any[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"credentials" | "entity">("credentials")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      if (currentUser.role === "SuperAdmin") {
        router.push("/super-admin")
      } else {
        router.push("/entity-admin")
      }
    }
  }, [router])

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Attempting login with username:", username)

      const superAdminResult = login(username, password)

      if (superAdminResult.success && superAdminResult.user?.role === "SuperAdmin") {
        console.log("[v0] SuperAdmin login successful")
        router.push("/super-admin")
        return
      }

      if (superAdminResult.error?.includes("Entity")) {
        // User exists but is EntityAdmin - need to select entity
        setUserRole("EntityAdmin")
        setStep("entity")
        setError("")
      } else {
        setError(superAdminResult.error || "Login failed")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEntitySelect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedEntity) {
      setError("Please select an entity")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Attempting EntityAdmin login with entity:", selectedEntity)

      const result = login(username, password, selectedEntity)

      if (result.success && result.user) {
        console.log("[v0] EntityAdmin login successful")
        router.push("/entity-admin")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      console.error("[v0] Entity login error:", err)
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
            <CardDescription>
              {step === "credentials" ? "Enter your credentials" : "Select your entity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
            ) : (
              <form onSubmit={handleEntitySelect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="entity">Select Entity</Label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger id="entity">
                      <SelectValue placeholder="Choose an entity to manage" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setStep("credentials")
                      setSelectedEntity("")
                      setError("")
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading || !selectedEntity}>
                    {isLoading ? "Signing in..." : "Continue"}
                  </Button>
                </div>
              </form>
            )}

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
