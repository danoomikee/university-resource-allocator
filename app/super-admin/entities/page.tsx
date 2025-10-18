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
import { entityStorage, userStorage, entityAssignmentStorage } from "@/lib/storage"
import type { Entity, EntityType, EntityStatus, UserAccount } from "@/lib/types"
import { Building2, Plus, Edit, Archive, Search } from "lucide-react"
import { getCurrentUniversity, generateTempPassword, hashPassword } from "@/lib/auth"

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("College")
  const [filterStatus, setFilterStatus] = useState<string>("Active")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "College" as EntityType,
    parentEntityId: "",
    managerId: "",
    status: "Active" as EntityStatus,
  })

  const [users, setUsers] = useState<UserAccount[]>([])

  useEffect(() => {
    loadEntities()
    loadUsers()
  }, [])

  useEffect(() => {
    filterEntities()
  }, [entities, searchQuery, filterType, filterStatus])

  const loadUsers = () => {
    const allUsers = userStorage.getAll()
    setUsers(allUsers.filter((u) => u.role === "EntityAdmin"))
  }

  const loadEntities = () => {
    const allEntities = entityStorage.getAll()
    setEntities(allEntities)
  }

  const filterEntities = () => {
    let filtered = [...entities]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((entity) => entity.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((entity) => entity.type === filterType)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((entity) => entity.status === filterStatus)
    }

    setFilteredEntities(filtered)
  }

  const getParentEntityName = (parentId: string | null): string => {
    if (!parentId) return "None"
    const parent = entities.find((e) => e.id === parentId)
    return parent ? parent.name : "Unknown"
  }

  const getManagerName = (managerId: string): string => {
    const user = userStorage.getById(managerId)
    return user ? user.username : "Unknown"
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.managerId) {
      alert("Please fill in all required fields including selecting a manager")
      return
    }

    const university = getCurrentUniversity()
    if (!university) {
      alert("University context not found")
      return
    }

    const newEntity = entityStorage.create({
      name: formData.name,
      type: formData.type,
      parentEntityId: formData.parentEntityId || null,
      managerId: formData.managerId,
      status: formData.status,
      universityId: university.id,
    })

    const tempPassword = generateTempPassword()
    entityAssignmentStorage.create({
      userId: formData.managerId,
      entityId: newEntity.id,
      password: hashPassword(tempPassword),
      mustChangePassword: true,
      universityId: university.id,
    })

    const managerUser = userStorage.getById(formData.managerId)
    alert(
      `Entity created successfully!\n\nTemporary password for ${managerUser?.username}:\n${tempPassword}\n\nShare this with the manager. They must change it on first login.`,
    )

    loadEntities()
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedEntity || !formData.name.trim()) return

    entityStorage.update(selectedEntity.id, {
      name: formData.name,
      type: formData.type,
      parentEntityId: formData.parentEntityId || null,
      status: formData.status,
    })

    loadEntities()
    setIsEditDialogOpen(false)
    setSelectedEntity(null)
    resetForm()
  }

  const handleArchive = (entity: Entity) => {
    if (confirm(`Are you sure you want to archive "${entity.name}"?`)) {
      entityStorage.archive(entity.id)
      loadEntities()
    }
  }

  const openEditDialog = (entity: Entity) => {
    setSelectedEntity(entity)
    setFormData({
      name: entity.name,
      type: entity.type,
      parentEntityId: entity.parentEntityId || "",
      managerId: entity.managerId,
      status: entity.status,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "College",
      parentEntityId: "",
      managerId: "",
      status: "Active",
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entities</h1>
          <p className="text-muted-foreground">Manage organizational entities and assign managers</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterType">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filterType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Division">Division</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Entities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Entities ({filteredEntities.length})</CardTitle>
          <CardDescription>View and manage all organizational entities</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entities found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first entity</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Parent Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getManagerName(entity.managerId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getParentEntityName(entity.parentEntityId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entity.status === "Active" ? "default" : "secondary"}>{entity.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(entity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {entity.status === "Active" && (
                            <Button variant="ghost" size="sm" onClick={() => handleArchive(entity)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Entity</DialogTitle>
            <DialogDescription>Create a new organizational entity and assign a manager</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter entity name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as EntityType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Division">Division</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager *</Label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => setFormData({ ...formData, managerId: value })}
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Select entity manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEntity">Parent Entity</Label>
              <Select
                value={formData.parentEntityId || "none"}
                onValueChange={(value) => setFormData({ ...formData, parentEntityId: value === "none" ? "" : value })}
              >
                <SelectTrigger id="parentEntity">
                  <SelectValue placeholder="Select parent entity (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {entities
                    .filter((e) => e.status === "Active")
                    .map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as EntityStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name.trim() || !formData.managerId}>
              Create Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
            <DialogDescription>Update entity information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
                placeholder="Enter entity name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editType">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as EntityType })}
              >
                <SelectTrigger id="editType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Division">Division</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editParentEntity">Parent Entity</Label>
              <Select
                value={formData.parentEntityId || "none"}
                onValueChange={(value) => setFormData({ ...formData, parentEntityId: value === "none" ? "" : value })}
              >
                <SelectTrigger id="editParentEntity">
                  <SelectValue placeholder="Select parent entity (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {entities
                    .filter((e) => e.status === "Active" && e.id !== selectedEntity?.id)
                    .map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as EntityStatus })}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
