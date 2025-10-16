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
import { Checkbox } from "@/components/ui/checkbox"
import { offeringStorage, entityStorage, courseStorage } from "@/lib/storage"
import type { Offering, OfferingStatus, Entity, Course } from "@/lib/types"
import { Calendar, Plus, Edit, Archive, Search } from "lucide-react"

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [filteredOfferings, setFilteredOfferings] = useState<Offering[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterEntity, setFilterEntity] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    managingEntityId: "",
    academicYear: "",
    semester: "",
    courseIds: [] as string[],
    status: "Active" as OfferingStatus,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterOfferings()
  }, [offerings, searchQuery, filterStatus, filterEntity])

  const loadData = () => {
    setOfferings(offeringStorage.getAll())
    setEntities(entityStorage.getAll().filter((e) => e.status === "Active"))
    setCourses(courseStorage.getAll().filter((c) => c.status === "Active"))
  }

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

    // Entity filter
    if (filterEntity !== "all") {
      filtered = filtered.filter((o) => o.managingEntityId === filterEntity)
    }

    setFilteredOfferings(filtered)
  }

  const getEntityName = (entityId: string): string => {
    const entity = entities.find((e) => e.id === entityId)
    return entity ? entity.name : "Unknown"
  }

  const getCourseCount = (courseIds: string[]): number => {
    return courseIds.length
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.managingEntityId || !formData.academicYear || !formData.semester) return

    offeringStorage.create({
      name: formData.name,
      managingEntityId: formData.managingEntityId,
      academicYear: formData.academicYear,
      semester: formData.semester,
      courseIds: formData.courseIds,
      status: formData.status,
    })

    loadData()
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (
      !selectedOffering ||
      !formData.name.trim() ||
      !formData.managingEntityId ||
      !formData.academicYear ||
      !formData.semester
    )
      return

    offeringStorage.update(selectedOffering.id, {
      name: formData.name,
      managingEntityId: formData.managingEntityId,
      academicYear: formData.academicYear,
      semester: formData.semester,
      courseIds: formData.courseIds,
      status: formData.status,
    })

    loadData()
    setIsEditDialogOpen(false)
    setSelectedOffering(null)
    resetForm()
  }

  const handleArchive = (offering: Offering) => {
    if (confirm(`Are you sure you want to archive "${offering.name}"?`)) {
      offeringStorage.archive(offering.id)
      loadData()
    }
  }

  const openEditDialog = (offering: Offering) => {
    setSelectedOffering(offering)
    setFormData({
      name: offering.name,
      managingEntityId: offering.managingEntityId,
      academicYear: offering.academicYear,
      semester: offering.semester,
      courseIds: offering.courseIds,
      status: offering.status,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      managingEntityId: "",
      academicYear: "",
      semester: "",
      courseIds: [],
      status: "Active",
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offerings</h1>
          <p className="text-muted-foreground">Manage academic offerings</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Offering
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
                  placeholder="Search offerings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterEntity">Managing Entity</Label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger id="filterEntity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
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

      {/* Offerings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Offerings ({filteredOfferings.length})</CardTitle>
          <CardDescription>View and manage all academic offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOfferings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offerings found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first offering</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Offering
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Managing Entity</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-muted-foreground">
                        {getEntityName(offering.managingEntityId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCourseCount(offering.courseIds)} courses</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offering.status === "Active" ? "default" : "secondary"}>
                          {offering.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(offering)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {offering.status === "Active" && (
                            <Button variant="ghost" size="sm" onClick={() => handleArchive(offering)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Offering</DialogTitle>
            <DialogDescription>Create a new academic offering</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science Program 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managingEntity">Managing Entity *</Label>
              <Select
                value={formData.managingEntityId}
                onValueChange={(value) => setFormData({ ...formData, managingEntityId: value })}
              >
                <SelectTrigger id="managingEntity">
                  <SelectValue placeholder="Select managing entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Courses</Label>
              <Card>
                <CardContent className="pt-4 max-h-60 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No courses available</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={formData.courseIds.includes(course.id)}
                            onCheckedChange={() => toggleCourse(course.id)}
                          />
                          <label
                            htmlFor={`course-${course.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {course.courseCode} - {course.title} ({course.creditHours} credits)
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">{formData.courseIds.length} courses selected</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as OfferingStatus })}
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
            <Button
              onClick={handleCreate}
              disabled={
                !formData.name.trim() || !formData.managingEntityId || !formData.academicYear || !formData.semester
              }
            >
              Create Offering
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offering</DialogTitle>
            <DialogDescription>Update offering information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
                placeholder="e.g., Computer Science Program 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editAcademicYear">Academic Year *</Label>
                <Input
                  id="editAcademicYear"
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSemester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger id="editSemester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editManagingEntity">Managing Entity *</Label>
              <Select
                value={formData.managingEntityId}
                onValueChange={(value) => setFormData({ ...formData, managingEntityId: value })}
              >
                <SelectTrigger id="editManagingEntity">
                  <SelectValue placeholder="Select managing entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Courses</Label>
              <Card>
                <CardContent className="pt-4 max-h-60 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No courses available</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-course-${course.id}`}
                            checked={formData.courseIds.includes(course.id)}
                            onCheckedChange={() => toggleCourse(course.id)}
                          />
                          <label
                            htmlFor={`edit-course-${course.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {course.courseCode} - {course.title} ({course.creditHours} credits)
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">{formData.courseIds.length} courses selected</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as OfferingStatus })}
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
            <Button
              onClick={handleEdit}
              disabled={
                !formData.name.trim() || !formData.managingEntityId || !formData.academicYear || !formData.semester
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
