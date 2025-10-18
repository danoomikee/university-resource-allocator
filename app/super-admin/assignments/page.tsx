"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { entityStorage, userStorage, entityAssignmentStorage } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Copy, Check } from "lucide-react"
import { generateTempPassword } from "@/lib/auth"
import type { EntityAssignment } from "@/lib/types"

export default function EntityAssignmentsPage() {
  const { user, university, isLoading } = useAuth(true)
  const [assignments, setAssignments] = useState<EntityAssignment[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !university) return

    const allAssignments = entityAssignmentStorage.getAll(university.id)
    const allUsers = userStorage.getAll(university.id)
    const allEntities = entityStorage.getAll(university.id)

    setAssignments(allAssignments)
    setUsers(allUsers)
    setEntities(allEntities)
  }, [user, university])

  const handleAssign = () => {
    if (!selectedUser || !selectedEntity || !university) return

    const tempPassword = generateTempPassword()
    const assignment: EntityAssignment = {
      id: `assign-${Date.now()}`,
      universityId: university.id,
      userId: selectedUser,
      entityId: selectedEntity,
      password: tempPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    entityAssignmentStorage.create(assignment)
    setAssignments([...assignments, assignment])
    setSelectedUser("")
    setSelectedEntity("")
    setIsOpen(false)
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    entityAssignmentStorage.delete(assignmentId)
    setAssignments(assignments.filter((a) => a.id !== assignmentId))
  }

  const handleCopyPassword = (password: string, id: string) => {
    navigator.clipboard.writeText(password)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const user = users.find((u) => u.id === assignment.userId)
    const entity = entities.find((e) => e.id === assignment.entityId)
    const searchLower = searchTerm.toLowerCase()
    return (
      user?.username.toLowerCase().includes(searchLower) ||
      false ||
      entity?.name.toLowerCase().includes(searchLower) ||
      false
    )
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entity Assignments</h1>
          <p className="text-muted-foreground">Assign users to manage entities and generate credentials</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign User to Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign User to Entity</DialogTitle>
              <DialogDescription>Create a new entity assignment with auto-generated credentials</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User Account</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Entity</label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} className="w-full">
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search by username or entity name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
          <CardDescription>Users assigned to manage entities with their credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Temporary Password</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No assignments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const assignedUser = users.find((u) => u.id === assignment.userId)
                    const assignedEntity = entities.find((e) => e.id === assignment.entityId)
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignedUser?.username}</TableCell>
                        <TableCell>{assignedEntity?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{assignment.password}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyPassword(assignment.password, assignment.id)}
                            >
                              {copiedId === assignment.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
