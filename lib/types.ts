// Core data types for the university administration system

export type UniversityStatus = "Active" | "Suspended" | "Archived"

export interface University {
  id: string
  name: string
  shortName: string
  domain: string // unique identifier like "astu" or "aau"
  contactEmail: string
  contactPhone: string
  address: string
  status: UniversityStatus
  createdAt: string
  updatedAt: string
}

export type EntityType = "College" | "Department" | "Division" | "Other"

export type EntityStatus = "Active" | "Archived"

export interface Entity {
  id: string
  universityId: string
  name: string
  type: EntityType
  parentEntityId: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type PersonnelStatus = "Active" | "Archived"

export interface Personnel {
  id: string
  universityId: string
  fullName: string
  email: string
  employeeId: string
  status: PersonnelStatus
  createdAt: string
  updatedAt: string
}

export type UserRole = "SuperAdmin" | "EntityAdmin"

export interface UserAccount {
  id: string
  universityId: string
  username: string
  password: string // hashed
  role: UserRole
  personnelId: string | null
  assignedEntityId: string | null
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  universityId: string
  personnelId: string
  entityId: string
  createdAt: string
  updatedAt: string
}

export type CourseStatus = "Active" | "Archived"

export interface Course {
  id: string
  universityId: string
  courseCode: string
  title: string
  creditHours: number
  description: string
  providingEntityId: string
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

export type OfferingStatus = "Active" | "Archived"

export interface Offering {
  id: string
  universityId: string
  name: string
  managingEntityId: string
  academicYear: string
  semester: string
  courseIds: string[]
  status: OfferingStatus
  createdAt: string
  updatedAt: string
}
