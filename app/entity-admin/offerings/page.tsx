"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { offeringStorage } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { Offering } from "@/lib/types"
import { Calendar, AlertCircle, Search } from "lucide-react"

export default function EntityAdminOfferingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [filteredOfferings, setFilteredOfferings] = useState<Offering[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "EntityAdmin") {
      router.push("/")
      return
    }

    setCurrentUser(user)

    if (!user.assignedEntityId) {
      return
    }

    // Get offerings managed by this entity
    const entityOfferings = offeringStorage.getByManagingEntityId(user.assignedEntityId)
    setOfferings(entityOfferings)
  }, [router])

  useEffect(() => {
    filterOfferings()
  }, [offerings, searchQuery, filterStatus])

  const filterOfferings = () => {
    let filtered = [...offerings]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.academicYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.semester.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus)
    }

    setFilteredOfferings(filtered)
  }

  const getCourseCount = (courseIds: string[]): number => {
    return courseIds.length
  }

  if (!currentUser?.assignedEntityId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offerings</h1>
          <p className="text-muted-foreground">View offerings managed by your entity</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Offerings</h1>
        <p className="text-muted-foreground">View offerings managed by your entity</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search offerings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offerings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Offerings ({filteredOfferings.length})</CardTitle>
          <CardDescription>Offerings managed by your entity</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOfferings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offerings found</h3>
              <p className="text-muted-foreground">Contact your Super Admin to add offerings to your entity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfferings.map((offering) => (
                    <TableRow key={offering.id}>
                      <TableCell className="font-medium">{offering.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{offering.academicYear}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{offering.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCourseCount(offering.courseIds)} courses</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offering.status === "Active" ? "default" : "secondary"}>
                          {offering.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
