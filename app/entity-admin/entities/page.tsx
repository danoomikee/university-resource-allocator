"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { entityStorage } from "@/lib/storage"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Archive } from "lucide-react"
import type { Entity } from "@/lib/types"

export default function EntityAdminEntitiesPage() {
  const { user, university, isLoading } = useAuth(true)
  const [entities, setEntities] = useState<Entity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [formData, setFormData] = useState({ name: "", type: "Department", description: "" })

  useEffect(() => {
    if (!user || !university || !user.assignedEntityId) return

    // Get sub-entities of the assigned entity
    const allEntities = entityStorage.getAll(university.id)
    const subEntities = allEntities.filter((e) => e.parentEntityId === user.assignedEntityId)
    setEntities(subEntities)
  }, [user, university])

  const handleCreateOrUpdate = () => {
    if (!formData.name || !university || !user?.assignedEntityId) return

    if (editingEntity) {
      const updated = { ...editingEntity, ...formData, updatedAt: new Date().toISOString() }
      entityStorage.update(updated)
      setEntities(entities.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      const newEntity: Entity = {
        id: `entity-${Date.now()}`,
        universityId: university.id,
        name: formData.name,
        type: formData.type as any,
        description: formData.description,
        parentEntityId: user.assignedEntityId,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      entityStorage.create(newEntity)
      setEntities([...entities, newEntity])
    }

    setFormData({ name: "", type: "Department", description: "" })
    setEditingEntity(null)
    setIsOpen(false)
  }

  const handleArchive = (entityId: string) => {
    const entity = entities.find((e) => e.id === entityId)
    if (entity) {
      const updated = { ...entity, status: "Archived" as const, updatedAt: new Date().toISOString() }
      entityStorage.update(updated)
      setEntities(entities.map((e) => (e.id === updated.id ? updated : e)))
    }
  }

  const filteredEntities = entities.filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sub-Entities</h1>
          <p className="text-muted-foreground">Create and manage sub-entities within your entity</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingEntity(null)
                setFormData({ name: "", type: "Department", description: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntity ? "Edit Sub-Entity" : "Create Sub-Entity"}</DialogTitle>
              <DialogDescription>Create a new sub-entity under your entity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Entity name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="Division">Division</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <Button onClick={handleCreateOrUpdate} className="w-full">
                {editingEntity ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search entities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardHeader>
          <CardTitle>Sub-Entities</CardTitle>
          <CardDescription>Entities managed under your entity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No sub-entities yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.type}</TableCell>
                      <TableCell>
                        <Badge variant={entity.status === "Active" ? "default" : "secondary"}>{entity.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(entity.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEntity(entity)
                              setFormData({ name: entity.name, type: entity.type, description: entity.description })
                              setIsOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {entity.status === "Active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(entity.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
