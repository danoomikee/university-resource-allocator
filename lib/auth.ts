// Authentication utilities
import { userStorage, sessionStorage, universityStorage } from "./storage"
import type { UserAccount, University } from "./types"

// Simple hash function for demo purposes (in production, use bcrypt or similar)
export const hashPassword = (password: string): string => {
  return btoa(password) // Base64 encoding for demo
}

export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash
}

// Generate username from personnel info
export const generateUsername = (fullName: string, employeeId: string): string => {
  const namePart = fullName.toLowerCase().replace(/\s+/g, ".")
  return `${namePart}.${employeeId}`
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

// Login function
export const login = (username: string, password: string): { success: boolean; user?: UserAccount; error?: string } => {
  const user = userStorage.getByUsername(username)

  if (!user) {
    return { success: false, error: "Invalid username or password" }
  }

  if (!verifyPassword(password, user.password)) {
    return { success: false, error: "Invalid username or password" }
  }

  sessionStorage.setCurrentUser(user)
  return { success: true, user }
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

// Change password
export const changePassword = (userId: string, newPassword: string): boolean => {
  const hashedPassword = hashPassword(newPassword)
  const updated = userStorage.update(userId, {
    password: hashedPassword,
    mustChangePassword: false,
  })

  if (updated) {
    sessionStorage.setCurrentUser(updated)
    return true
  }

  return false
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
