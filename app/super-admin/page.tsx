"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { entityStorage, personnelStorage, userStorage, courseStorage, offeringStorage } from "@/lib/storage"
import { Building2, Users, UserCog, BookOpen, Calendar, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function SuperAdminDashboard() {
  const { user, university, isLoading } = useAuth(true)
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeEntities: 0,
    totalPersonnel: 0,
    activePersonnel: 0,
    totalUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalOfferings: 0,
    activeOfferings: 0,
  })

  const [entityBreakdown, setEntityBreakdown] = useState<{ name: string; value: number }[]>([])
  const [userRoleBreakdown, setUserRoleBreakdown] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    if (!user || !university) return

    const entities = entityStorage.getAll(university.id)
    const personnel = personnelStorage.getAll(university.id)
    const users = userStorage.getAll(university.id)
    const courses = courseStorage.getAll(university.id)
    const offerings = offeringStorage.getAll(university.id)

    setStats({
      totalEntities: entities.length,
      activeEntities: entities.filter((e) => e.status === "Active").length,
      totalPersonnel: personnel.length,
      activePersonnel: personnel.filter((p) => p.status === "Active").length,
      totalUsers: users.length,
      totalCourses: courses.length,
      activeCourses: courses.filter((c) => c.status === "Active").length,
      totalOfferings: offerings.length,
      activeOfferings: offerings.filter((o) => o.status === "Active").length,
    })

    // Entity breakdown by type
    const entityTypes = entities.reduce(
      (acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    setEntityBreakdown(Object.entries(entityTypes).map(([name, value]) => ({ name, value })))

    // User role breakdown
    const roleBreakdown = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    setUserRoleBreakdown(Object.entries(roleBreakdown).map(([name, value]) => ({ name, value })))
  }, [user, university])

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--secondary))"]

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics for {university?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntities}</div>
            <p className="text-xs text-muted-foreground">{stats.activeEntities} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">{stats.activePersonnel} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">{stats.activeCourses} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offerings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfferings}</div>
            <p className="text-xs text-muted-foreground">{stats.activeOfferings} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entity Distribution</CardTitle>
            <CardDescription>Breakdown by entity type</CardDescription>
          </CardHeader>
          <CardContent>
            {entityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={entityBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {entityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No entities yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {userRoleBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userRoleBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No users yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
