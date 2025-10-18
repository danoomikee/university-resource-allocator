// Authentication utilities - redesigned for entity-based login
import { userStorage, entityAssignmentStorage, sessionStorage, universityStorage, entityStorage } from "./storage"
import type { UserAccount, University, EntityAssignment, Entity } from "./types"

export const hashPassword = (password: string): string => {
  return btoa(password)
}

export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash
}

export const generateUsername = (fullName: string, userId: string): string => {
  const namePart = fullName.toLowerCase().replace(/\s+/g, ".")
  return `${namePart}.${userId.substring(0, 6)}`
}

export const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const login = (
  username: string,
  password: string,
): {
  success: boolean
  user?: UserAccount
  entity?: Entity
  assignment?: EntityAssignment
  university?: University
  error?: string
} => {
  console.log("[v0] Login attempt:", { username })

  const user = userStorage.getByUsername(username)
  if (!user) {
    console.log("[v0] User not found:", username)
    return { success: false, error: "Invalid username or password" }
  }

  console.log("[v0] User found:", user)

  // SuperAdmin login - no entity required
  if (user.role === "SuperAdmin") {
    console.log("[v0] SuperAdmin login detected")
    const university = universityStorage.getById(user.universityId)
    if (!university) {
      return { success: false, error: "University not found" }
    }

    sessionStorage.setCurrentUser(user)
    sessionStorage.setCurrentEntity(null)
    console.log("[v0] SuperAdmin login successful")
    return { success: true, user, university }
  }

  // EntityAdmin login - automatically find their assigned entity
  console.log("[v0] EntityAdmin login - finding assigned entity")
  const assignment = entityAssignmentStorage.getByUserId(user.id, user.universityId)
  if (!assignment) {
    console.log("[v0] No entity assignment found for user")
    return { success: false, error: "User is not assigned to any entity" }
  }

  console.log("[v0] Assignment found, verifying password")
  if (!verifyPassword(password, assignment.password)) {
    console.log("[v0] Password verification failed")
    return { success: false, error: "Invalid username or password" }
  }

  const entity = entityStorage.getById(assignment.entityId)
  if (!entity) {
    console.log("[v0] Entity not found")
    return { success: false, error: "Entity not found" }
  }

  const university = universityStorage.getById(user.universityId)
  if (!university) {
    console.log("[v0] University not found")
    return { success: false, error: "University not found" }
  }

  sessionStorage.setCurrentUser(user)
  sessionStorage.setCurrentEntity(entity)
  sessionStorage.setCurrentAssignment(assignment)
  console.log("[v0] EntityAdmin login successful")
  return { success: true, user, entity, assignment, university }
}

export const logout = (): void => {
  sessionStorage.clearCurrentUser()
  sessionStorage.clearCurrentEntity()
  sessionStorage.clearCurrentAssignment()
}

export const getCurrentUser = (): UserAccount | null => {
  return sessionStorage.getCurrentUser()
}

export const getCurrentEntity = (): Entity | null => {
  return sessionStorage.getCurrentEntity()
}

export const getCurrentAssignment = (): EntityAssignment | null => {
  return sessionStorage.getCurrentAssignment()
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === "SuperAdmin"
}

export const isEntityAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === "EntityAdmin"
}

export const changePassword = (
  userId: string,
  entityId: string,
  universityId: string,
  oldPassword: string,
  newPassword: string,
): { success: boolean; error?: string } => {
  console.log("[v0] Changing password for user:", userId)

  const assignment = entityAssignmentStorage.getByUserAndEntity(userId, entityId, universityId)
  if (!assignment) {
    console.log("[v0] Assignment not found")
    return { success: false, error: "Assignment not found" }
  }

  // Verify old password
  if (!verifyPassword(oldPassword, assignment.password)) {
    console.log("[v0] Old password verification failed")
    return { success: false, error: "Current password is incorrect" }
  }

  const hashedPassword = hashPassword(newPassword)
  const updated = entityAssignmentStorage.update(assignment.id, {
    password: hashedPassword,
    mustChangePassword: false,
  })

  if (!updated) {
    console.log("[v0] Failed to update password")
    return { success: false, error: "Failed to update password" }
  }

  console.log("[v0] Password changed successfully")
  return { success: true }
}

export const getUserAssignedEntities = (userId: string, universityId: string): Entity[] => {
  const assignment = entityAssignmentStorage.getByUserId(userId, universityId)
  if (!assignment) return []
  const entity = entityStorage.getById(assignment.entityId)
  return entity ? [entity] : []
}

export const getEntityManagers = (
  entityId: string,
  universityId: string,
): (UserAccount & { assignment: EntityAssignment })[] => {
  const assignments = entityAssignmentStorage.getByEntityId(entityId, universityId)
  return assignments
    .map((a) => {
      const user = userStorage.getById(a.userId)
      return user ? { ...user, assignment: a } : null
    })
    .filter((item): item is UserAccount & { assignment: EntityAssignment } => item !== null)
}

export const getEntityManager = (
  entityId: string,
  universityId: string,
): (UserAccount & { assignment: EntityAssignment }) | null => {
  const assignment = entityAssignmentStorage.getByEntityId(entityId, universityId)
  if (!assignment) return null

  const user = userStorage.getById(assignment.userId)
  return user ? { ...user, assignment } : null
}

export const getCurrentUniversity = (): University | null => {
  const user = getCurrentUser()
  if (!user) return null
  return universityStorage.getById(user.universityId) || null
}

export const getUniversityContext = (): { user: UserAccount; university: University } | null => {
  const user = getCurrentUser()
  if (!user) return null

  const university = universityStorage.getById(user.universityId)
  if (!university) return null

  return { user, university }
}

export const belongsToUniversity = (userId: string, universityId: string): boolean => {
  const user = userStorage.getById(userId)
  return user?.universityId === universityId
}
