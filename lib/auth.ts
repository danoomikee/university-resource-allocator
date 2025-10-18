// Authentication utilities
import { userStorage, entityAssignmentStorage, sessionStorage, universityStorage, entityStorage } from "./storage"
import type { UserAccount, University, EntityAssignment, Entity } from "./types"

// Simple hash function for demo purposes (in production, use bcrypt or similar)
export const hashPassword = (password: string): string => {
  return btoa(password) // Base64 encoding for demo
}

export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash
}

// Generate username from user info
export const generateUsername = (fullName: string, userId: string): string => {
  const namePart = fullName.toLowerCase().replace(/\s+/g, ".")
  return `${namePart}.${userId.substring(0, 6)}`
}

// Generate temporary password
export const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Login function with entity assignment support
export const login = (
  username: string,
  password: string,
  entityId?: string,
): { success: boolean; user?: UserAccount; entity?: Entity; assignment?: EntityAssignment; error?: string } => {
  const user = userStorage.getByUsername(username)

  if (!user) {
    return { success: false, error: "Invalid username or password" }
  }

  // If entityId is provided, verify the entity assignment
  if (entityId) {
    const assignment = entityAssignmentStorage.getByUserAndEntity(user.id, entityId, user.universityId)
    if (!assignment) {
      return { success: false, error: "User is not assigned to this entity" }
    }

    if (!verifyPassword(password, assignment.password)) {
      return { success: false, error: "Invalid username or password" }
    }

    const entity = entityStorage.getById(entityId)
    if (!entity) {
      return { success: false, error: "Entity not found" }
    }

    sessionStorage.setCurrentUser(user)
    return { success: true, user, entity, assignment }
  }

  // For SuperAdmin login (no entity assignment needed)
  if (user.role === "SuperAdmin") {
    sessionStorage.setCurrentUser(user)
    return { success: true, user }
  }

  return { success: false, error: "Entity assignment required for EntityAdmin login" }
}

// Logout function
export const logout = (): void => {
  sessionStorage.clearCurrentUser()
}

// Get current user
export const getCurrentUser = (): UserAccount | null => {
  return sessionStorage.getCurrentUser()
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// Users need to change password for their entity assignment, not their user account
export const changePassword = (
  userId: string,
  entityId: string,
  universityId: string,
  newPassword: string,
): boolean => {
  const hashedPassword = hashPassword(newPassword)
  const assignment = entityAssignmentStorage.getByUserAndEntity(userId, entityId, universityId)
  if (!assignment) return false

  const updated = entityAssignmentStorage.update(assignment.id, {
    password: hashedPassword,
    mustChangePassword: false,
  })

  return updated !== null
}

export const getCurrentUserAssignment = (): EntityAssignment | null => {
  const user = getCurrentUser()
  if (!user) return null

  // Get the first entity assignment for the user
  const assignments = entityAssignmentStorage.getByUserId(user.id, user.universityId)
  return assignments.length > 0 ? assignments[0] : null
}

export const getCurrentUniversity = (): University | null => {
  const user = getCurrentUser()
  if (!user) return null
  return universityStorage.getById(user.universityId) || null
}

export const belongsToUniversity = (userId: string, universityId: string): boolean => {
  const user = userStorage.getById(userId)
  return user?.universityId === universityId
}

export const getUniversityContext = (): { user: UserAccount; university: University } | null => {
  const user = getCurrentUser()
  if (!user) return null

  const university = universityStorage.getById(user.universityId)
  if (!university) return null

  return { user, university }
}

export const getUserAssignedEntities = (userId: string, universityId: string): Entity[] => {
  const assignments = entityAssignmentStorage.getByUserId(userId, universityId)
  return assignments.map((a) => entityStorage.getById(a.entityId)).filter((e): e is Entity => e !== undefined)
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
