"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, GraduationCap, Shield, Users, BookOpen, Calendar } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Building2 className="h-14 w-14 text-primary" />
              <GraduationCap className="h-14 w-14 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              University Resource Administration System
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              A comprehensive multi-tenant platform for managing university entities, personnel, courses, and academic
              offerings. Secure, scalable, and tailored for institutional excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => router.push("/university/register")} className="text-base">
                Register Your University
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")} className="text-base">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything your institution needs to manage resources efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-Tenant Security</CardTitle>
              <CardDescription>
                Complete data isolation ensures each university's information remains private and secure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Hierarchical Entities</CardTitle>
              <CardDescription>
                Manage colleges, departments, and divisions with flexible organizational structures
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Personnel Management</CardTitle>
              <CardDescription>
                Track faculty and staff with automated credential generation and role assignments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Course Catalog</CardTitle>
              <CardDescription>
                Maintain comprehensive course information with credit hours and provider tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Academic Offerings</CardTitle>
              <CardDescription>
                Create and manage semester-based course offerings with entity associations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Super Admin and Entity Admin roles with appropriate permissions and dashboards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our streamlined onboarding process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Register University</h3>
              <p className="text-muted-foreground text-sm">
                Provide your institution details and create a unique domain identifier
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Super Admin Access</h3>
              <p className="text-muted-foreground text-sm">
                Receive automatically generated credentials for your university's Super Admin account
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Configure & Manage</h3>
              <p className="text-muted-foreground text-sm">
                Set up entities, add personnel, create courses, and manage your institution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            University Resource Administration System - Secure Multi-Tenant Platform
          </p>
        </div>
      </div>
    </div>
  )
}
