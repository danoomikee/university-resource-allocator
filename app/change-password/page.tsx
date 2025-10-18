"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword, getCurrentUser, getCurrentAssignment, isEntityAdmin } from "@/lib/auth"
import { Building2 } from "lucide-react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (!isEntityAdmin()) {
      // SuperAdmins don't have entity assignments, redirect them
      router.push("/super-admin")
      return
    }

    const assignment = getCurrentAssignment()
    if (!assignment?.mustChangePassword) {
      // Already changed password, redirect to dashboard
      router.push("/entity-admin")
    }
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        setError("Session expired. Please login again.")
        router.push("/login")
        return
      }

      const assignment = getCurrentAssignment()
      if (!assignment) {
        setError("No entity assignment found. Please contact administrator.")
        return
      }

      const result = changePassword(
        currentUser.id,
        assignment.entityId,
        currentUser.universityId,
        oldPassword,
        newPassword,
      )

      if (result.success) {
        console.log("[v0] Password changed successfully")
        router.push("/entity-admin")
      } else {
        setError(result.error || "Failed to change password")
      }
    } catch (err) {
      console.error("[v0] Error changing password:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
          <p className="text-muted-foreground text-pretty">You must change your password before continuing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
