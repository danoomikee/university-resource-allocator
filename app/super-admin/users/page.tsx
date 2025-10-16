"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userStorage, personnelStorage, entityStorage } from "@/lib/storage"
import { generateUsername, generateTempPassword, hashPassword } from "@/lib/auth"
import type { UserAccount, UserRole, Personnel, Entity } from "@/lib/types"
import { UserCog, Plus, Edit, Search, Copy, CheckCircle } from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string>("")
  const [copiedPassword, setCopiedPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    role: "EntityAdmin" as UserRole,
    personnelId: "",
    assignedEntityId: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filterRole])

  const loadData = () => {
    setUsers(userStorage.getAll())
    setPersonnel(personnelStorage.getAll().filter((p) => p.status === "Active"))
    setEntities(entityStorage.getAll().filter((e) => e.status === "Active"))
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole)
    }

    setFilteredUsers(filtered)
  }

  const getPersonnelName = (personnelId: string | null): string => {
    if (!personnelId) return "N/A"
    const person = personnel.find((p) => p.id === personnelId)
    return person ? person.fullName : "Unknown"
  }

  const getEntityName = (entityId: string | null): string => {
    if (!entityId) return "N/A"
    const entity = entities.find((e) => e.id === entityId)
    return entity ? entity.name : "Unknown"
  }

  const handleCreate = () => {
    if (!formData.username.trim()) return

    const tempPassword = generateTempPassword()
    const hashedPassword = hashPassword(tempPassword)

    userStorage.create({
      username: formData.username,
      password: hashedPassword,
      role: formData.role,
      personnelId: formData.personnelId || null,
      assignedEntityId: formData.assignedEntityId || null,
      mustChangePassword: true,
    })

    setGeneratedPassword(tempPassword)
    loadData()
    // Keep dialog open to show password
  }

  const handleEdit = () => {
    if (!selectedUser || !formData.username.trim()) return

    userStorage.update(selectedUser.id, {
      username: formData.username,
      role: formData.role,
      personnelId: formData.personnelId || null,
      assignedEntityId: formData.assignedEntityId || null,
    })

    loadData()
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    resetForm()
  }

  const openEditDialog = (user: UserAccount) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      role: user.role,
      personnelId: user.personnelId || "",
      assignedEntityId: user.assignedEntityId || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      username: "",
      role: "EntityAdmin",
      personnelId: "",
      assignedEntityId: "",
    })
    setGeneratedPassword("")
    setCopiedPassword(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  const handlePersonnelChange = (personnelId: string) => {
    setFormData({ ...formData, personnelId })

    // Auto-generate username if personnel is selected
    if (personnelId) {
      const person = personnel.find((p) => p.id === personnelId)
      if (person) {
        const username = generateUsername(person.fullName, person.employeeId)
        setFormData((prev) => ({ ...prev, username, personnelId }))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Accounts</h1>
          <p className="text-muted-foreground">Manage system user accounts</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
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
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterRole">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger id="filterRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                  <SelectItem value="EntityAdmin">Entity Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>View and manage all user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating a user account</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Assigned Entity</TableHead>
                    <TableHead>Must Change Password</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "SuperAdmin" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getPersonnelName(user.personnelId)}</TableCell>
                      <TableCell className="text-muted-foreground">{getEntityName(user.assignedEntityId)}</TableCell>
                      <TableCell>
                        <Badge variant={user.mustChangePassword ? "destructive" : "outline"}>
                          {user.mustChangePassword ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          {!generatedPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                    <SelectItem value="EntityAdmin">Entity Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personnel">Personnel</Label>
                <Select value={formData.personnelId} onValueChange={handlePersonnelChange}>
                  <SelectTrigger id="personnel">
                    <SelectValue placeholder="Select personnel (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.fullName} ({person.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              {formData.role === "EntityAdmin" && (
                <div className="space-y-2">
                  <Label htmlFor="assignedEntity">Assigned Entity</Label>
                  <Select
                    value={formData.assignedEntityId}
                    onValueChange={(value) => setFormData({ ...formData, assignedEntityId: value })}
                  >
                    <SelectTrigger id="assignedEntity">
                      <SelectValue placeholder="Select entity (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name} ({entity.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>User account created successfully!</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input value={generatedPassword} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={copyPassword}>
                    {copiedPassword ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save this password! The user will be required to change it on first login.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {!generatedPassword ? (
              <>
                <Button variant="outline" onClick={closeCreateDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.username.trim()}>
                  Create User
                </Button>
              </>
            ) : (
              <Button onClick={closeCreateDialog} className="w-full">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editUsername">Username *</Label>
              <Input
                id="editUsername"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger id="editRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                  <SelectItem value="EntityAdmin">Entity Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPersonnel">Personnel</Label>
              <Select
                value={formData.personnelId}
                onValueChange={(value) => setFormData({ ...formData, personnelId: value })}
              >
                <SelectTrigger id="editPersonnel">
                  <SelectValue placeholder="Select personnel (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.fullName} ({person.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === "EntityAdmin" && (
              <div className="space-y-2">
                <Label htmlFor="editAssignedEntity">Assigned Entity</Label>
                <Select
                  value={formData.assignedEntityId}
                  onValueChange={(value) => setFormData({ ...formData, assignedEntityId: value })}
                >
                  <SelectTrigger id="editAssignedEntity">
                    <SelectValue placeholder="Select entity (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.username.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
