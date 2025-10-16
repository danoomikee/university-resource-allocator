"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { personnelStorage, assignmentStorage } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import type { Personnel } from "@/lib/types"
import { Users, AlertCircle } from "lucide-react"

export default function EntityAdminPersonnelPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [personnel, setPersonnel] = useState<Personnel[]>([])

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

    // Get personnel assigned to this entity
    const assignments = assignmentStorage.getAll().filter((a) => a.entityId === user.assignedEntityId)
    const personnelIds = assignments.map((a) => a.personnelId)
    const assignedPersonnel = personnelStorage.getAll().filter((p) => personnelIds.includes(p.id))

    setPersonnel(assignedPersonnel)
  }, [router])

  if (!currentUser?.assignedEntityId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
          <p className="text-muted-foreground">View assigned personnel</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
        <p className="text-muted-foreground">View personnel assigned to your entity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Personnel ({personnel.length})</CardTitle>
          <CardDescription>Staff members assigned to your entity</CardDescription>
        </CardHeader>
        <CardContent>
          {personnel.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No personnel assigned</h3>
              <p className="text-muted-foreground">Contact your Super Admin to assign personnel to your entity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personnel.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{person.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{person.employeeId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.status === "Active" ? "default" : "secondary"}>{person.status}</Badge>
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
