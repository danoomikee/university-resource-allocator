"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { entityStorage, courseStorage, offeringStorage, assignmentStorage } from "@/lib/storage"
import { Building2, Users, BookOpen, Calendar, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function EntityAdminDashboard() {
  const { user, university, isLoading } = useAuth(true)
  const [entityName, setEntityName] = useState<string>("")
  const [stats, setStats] = useState({
    assignedPersonnel: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalOfferings: 0,
    activeOfferings: 0,
  })
  const [courseData, setCourseData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    if (!user || !university || !user.assignedEntityId) return

    // Get entity info
    const entity = entityStorage.getById(user.assignedEntityId)
    if (entity) {
      setEntityName(entity.name)
    }

    const assignment = assignmentStorage.getByEntityId(user.assignedEntityId, university.id)
    const courses = courseStorage.getByProvidingEntityId(user.assignedEntityId, university.id)
    const offerings = offeringStorage.getByManagingEntityId(user.assignedEntityId, university.id)

    setStats({
      assignedPersonnel: assignment ? 1 : 0,
      totalCourses: courses.length,
      activeCourses: courses.filter((c) => c.status === "Active").length,
      totalOfferings: offerings.length,
      activeOfferings: offerings.filter((o) => o.status === "Active").length,
    })

    // Course data for chart
    const activeCourses = courses.filter((c) => c.status === "Active")
    const courseChartData = activeCourses.slice(0, 5).map((course) => ({
      name: course.courseCode,
      value: course.creditHours,
    }))
    setCourseData(courseChartData)
  }, [user, university])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user?.assignedEntityId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Entity administration overview</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not assigned to any entity. Please contact your Super Admin to assign you to an entity.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Managing {entityName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entityName}</div>
            <p className="text-xs text-muted-foreground">Your assigned entity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedPersonnel}</div>
            <p className="text-xs text-muted-foreground">Assigned to entity</p>
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
      </div>

      {/* Course Credit Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Course Credit Hours</CardTitle>
          <CardDescription>Credit hours for active courses</CardDescription>
        </CardHeader>
        <CardContent>
          {courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No course data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
