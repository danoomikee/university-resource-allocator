"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { universityStorage, userStorage } from "@/lib/storage"
import { hashPassword, generateTempPassword } from "@/lib/auth"
import { Building2, GraduationCap, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UniversityRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    domain: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    adminUsername: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const [copied, setCopied] = useState<"username" | "password" | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate domain from short name
    if (name === "shortName") {
      const domainValue = value.toLowerCase().replace(/[^a-z0-9]/g, "")
      setFormData((prev) => ({ ...prev, domain: domainValue }))
    }
  }

  const copyToClipboard = (text: string, type: "username" | "password") => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (
      !formData.name ||
      !formData.shortName ||
      !formData.domain ||
      !formData.contactEmail ||
      !formData.adminUsername
    ) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.domain.length < 2) {
      setError("Domain must be at least 2 characters")
      return
    }

    if (!/^[a-z0-9]+$/.test(formData.domain)) {
      setError("Domain can only contain lowercase letters and numbers")
      return
    }

    // Check if domain already exists
    if (universityStorage.getByDomain(formData.domain)) {
      setError("This domain is already taken. Please choose a different one.")
      return
    }

    // Check if username already exists
    if (userStorage.getByUsername(formData.adminUsername)) {
      setError("This username is already taken. Please choose a different one.")
      return
    }

    setIsLoading(true)

    try {
      // Create university
      const university = universityStorage.create({
        name: formData.name,
        shortName: formData.shortName,
        domain: formData.domain,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        status: "Active",
      })

      // Generate temporary password
      const tempPassword = generateTempPassword()
      const hashedPassword = hashPassword(tempPassword)

      // Create Super Admin account
      userStorage.create({
        universityId: university.id,
        username: formData.adminUsername,
        password: hashedPassword,
        role: "SuperAdmin",
        personnelId: null,
        assignedEntityId: null,
        mustChangePassword: true,
      })

      // Show credentials
      setCredentials({
        username: formData.adminUsername,
        password: tempPassword,
      })
    } catch (err) {
      setError("An unexpected error occurred during registration")
      setIsLoading(false)
    }
  }

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <GraduationCap className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Registration Successful!</h1>
            <p className="text-muted-foreground text-pretty">Your university has been registered</p>
          </div>

          <Alert className="border-primary bg-primary/5">
            <AlertTitle className="text-lg font-semibold mb-4">Super Admin Credentials</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please save these credentials securely. You will need them to log in and will be required to change your
                password on first login.
              </p>

              <div className="space-y-3 bg-background p-4 rounded-md border border-border">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{credentials.username}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(credentials.username, "username")}
                    >
                      {copied === "username" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{credentials.password}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(credentials.password, "password")}
                    >
                      {copied === "password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Important: You must change this password on your first login for security purposes.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => router.push("/login")}>
              Continue to Login
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Credentials
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
            <GraduationCap className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Register Your University</h1>
          <p className="text-muted-foreground text-pretty">
            Create a new university account and get instant Super Admin access
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>Provide details about your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    University Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Addis Ababa Science and Technology University"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortName">
                    Short Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shortName"
                    name="shortName"
                    placeholder="e.g., ASTU"
                    value={formData.shortName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">
                  Domain Identifier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="domain"
                  name="domain"
                  placeholder="e.g., astu"
                  value={formData.domain}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9]+"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for your university (lowercase letters and numbers only)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="admin@university.edu"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    placeholder="+251 11 123 4567"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="University address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Super Admin Account</h3>
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">
                    Admin Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adminUsername"
                    name="adminUsername"
                    placeholder="Choose a username for the Super Admin"
                    value={formData.adminUsername}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A temporary password will be generated and displayed after registration
                  </p>
                </div>
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register University"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
