import { EntityAssignment, Course, Entity, Offering, Personnel, University, UserAccount } from "./types"

const STORAGE_KEYS = {
  UNIVERSITIES: "astu_universities",
  ENTITIES: "astu_entities",
  PERSONNEL: "astu_personnel",
  USERS: "astu_users",
  ENTITY_ASSIGNMENTS: "astu_entity_assignments",
  COURSES: "astu_courses",
  OFFERINGS: "astu_offerings",
  CURRENT_USER: "astu_current_user",
} as const

// Helper to safely access localStorage
const getFromStorage = <T>(key: string): T[] => {\
  if (typeof window === 'undefined') return []
  try {\
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {\
    return []
  }
}

const saveToStorage = <T>(key: string, data: T[]): void => {\
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// University storage operations
export const universityStorage = {\
  getAll: (): University[] => getFromStorage<University>(STORAGE_KEYS.UNIVERSITIES),

  getById: (id: string): University | undefined => {\
    return universityStorage.getAll().find((u) => u.id === id)
  },

  getByDomain: (domain: string): University | undefined => {\
    return universityStorage.getAll().find((u) => u.domain.toLowerCase() === domain.toLowerCase())
  },
\
  create: (university: Omit<University, 'id' | 'createdAt' | 'updatedAt'>): University => {\
    const universities = universityStorage.getAll()
    const newUniversity: University = {
      ...university,\
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    universities.push(newUniversity)
    saveToStorage(STORAGE_KEYS.UNIVERSITIES, universities)
    return newUniversity
  },

  update: (id: string, updates: Partial<University>): University | null => {\
    const universities = universityStorage.getAll()
    const index = universities.findIndex((u) => u.id === id)
    if (index === -1) return null

    universities[index] = {
      ...universities[index],\
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.UNIVERSITIES, universities)
    return universities[index]
  },
}

// Entity operations
export const entityStorage = {\
  getAll: (universityId?: string): Entity[] => {\
    const entities = getFromStorage<Entity>(STORAGE_KEYS.ENTITIES)
    return universityId ? entities.filter((e) => e.universityId === universityId) : entities
  },

  getById: (id: string): Entity | undefined => {\
    return getFromStorage<Entity>(STORAGE_KEYS.ENTITIES).find((e) => e.id === id)
  },

  getByParentId: (parentId: string | null, universityId: string): Entity[] => {\
    return entityStorage.getAll(universityId).filter((e) => e.parentEntityId === parentId)
  },
\
  create: (entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity => {\
    const entities = getFromStorage<Entity>(STORAGE_KEYS.ENTITIES)
    const newEntity: Entity = {
      ...entity,\
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    entities.push(newEntity)
    saveToStorage(STORAGE_KEYS.ENTITIES, entities)
    return newEntity
  },

  update: (id: string, updates: Partial<Entity>): Entity | null => {\
    const entities = getFromStorage<Entity>(STORAGE_KEYS.ENTITIES)
    const index = entities.findIndex((e) => e.id === id)
    if (index === -1) return null

    entities[index] = {
      ...entities[index],\
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.ENTITIES, entities)
    return entities[index]
  },

  archive: (id: string): boolean => {\
    return !!entityStorage.update(id, { status: 'Archived' })
  },
}

// Personnel operations - now entity-level
export const personnelStorage = {\
  getAll: (entityId?: string, universityId?: string): Personnel[] => {\
    const personnel = getFromStorage<Personnel>(STORAGE_KEYS.PERSONNEL)
    let filtered = personnel
    if (universityId) {
      filtered = filtered.filter((p) => p.universityId === universityId)
    }
    if (entityId) {
      filtered = filtered.filter((p) => p.entityId === entityId)
    }
    return filtered
  },

  getById: (id: string): Personnel | undefined => {\
    return getFromStorage<Personnel>(STORAGE_KEYS.PERSONNEL).find((p) => p.id === id)
  },
\
  create: (personnel: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Personnel => {\
    const allPersonnel = getFromStorage<Personnel>(STORAGE_KEYS.PERSONNEL)
    const newPersonnel: Personnel = {
      ...personnel,\
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    allPersonnel.push(newPersonnel)
    saveToStorage(STORAGE_KEYS.PERSONNEL, allPersonnel)
    return newPersonnel
  },

  update: (id: string, updates: Partial<Personnel>): Personnel | null => {\
    const allPersonnel = getFromStorage<Personnel>(STORAGE_KEYS.PERSONNEL)
    const index = allPersonnel.findIndex((p) => p.id === id)
    if (index === -1) return null

    allPersonnel[index] = {
      ...allPersonnel[index],\
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.PERSONNEL, allPersonnel)
    return allPersonnel[index]
  },

  archive: (id: string): boolean => {
    return !!personnelStorage.update(id, { status: 'Archived' })
  },
}

// User account operations - no passwords here
export const userStorage = {
  getAll: (universityId?: string): UserAccount[] => {
    const users = getFromStorage<UserAccount>(STORAGE_KEYS.USERS)
    return universityId ? users.filter((u) => u.universityId === universityId) : users
  },

  getById: (id: string): UserAccount | undefined => {
    return getFromStorage<UserAccount>(STORAGE_KEYS.USERS).find((u) => u.id === id)
  },

  getByUsername: (username: string): UserAccount | undefined => {
    return getFromStorage<UserAccount>(STORAGE_KEYS.USERS).find((u) => u.username === username)
  },

  create: (user: Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>): UserAccount => {
    const users = getFromStorage<UserAccount>(STORAGE_KEYS.USERS)
    const newUser: UserAccount = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveToStorage(STORAGE_KEYS.USERS, users)
    return newUser
  },

  update: (id: string, updates: Partial<UserAccount>): UserAccount | null => {
    const users = getFromStorage<UserAccount>(STORAGE_KEYS.USERS)
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.USERS, users)
    return users[index]
  },
}

export const entityAssignmentStorage = {
  getAll: (universityId?: string): EntityAssignment[] => {
    const assignments = getFromStorage<EntityAssignment>(STORAGE_KEYS.ENTITY_ASSIGNMENTS)
    return universityId ? assignments.filter((a) => a.universityId === universityId) : assignments
  },

  getById: (id: string): EntityAssignment | undefined => {
    return getFromStorage<EntityAssignment>(STORAGE_KEYS.ENTITY_ASSIGNMENTS).find((a) => a.id === id)
  },

  getByUserId: (userId: string, universityId: string): EntityAssignment[] => {
    return entityAssignmentStorage.getAll(universityId).filter((a) => a.userId === userId)
  },

  getByEntityId: (entityId: string, universityId: string): EntityAssignment[] => {
    return entityAssignmentStorage.getAll(universityId).filter((a) => a.entityId === entityId)
  },

  getByUserAndEntity: (userId: string, entityId: string, universityId: string): EntityAssignment | undefined => {
    return entityAssignmentStorage.getAll(universityId).find((a) => a.userId === userId && a.entityId === entityId)
  },

  create: (assignment: Omit<EntityAssignment, 'id' | 'createdAt' | 'updatedAt'>): EntityAssignment => {
    const assignments = getFromStorage<EntityAssignment>(STORAGE_KEYS.ENTITY_ASSIGNMENTS)
    const newAssignment: EntityAssignment = {
      ...assignment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    assignments.push(newAssignment)
    saveToStorage(STORAGE_KEYS.ENTITY_ASSIGNMENTS, assignments)
    return newAssignment
  },

  update: (id: string, updates: Partial<EntityAssignment>): EntityAssignment | null => {
    const assignments = getFromStorage<EntityAssignment>(STORAGE_KEYS.ENTITY_ASSIGNMENTS)
    const index = assignments.findIndex((a) => a.id === id)
    if (index === -1) return null

    assignments[index] = {
      ...assignments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.ENTITY_ASSIGNMENTS, assignments)
    return assignments[index]
  },

  delete: (id: string): boolean => {
    const assignments = getFromStorage<EntityAssignment>(STORAGE_KEYS.ENTITY_ASSIGNMENTS)
    const filtered = assignments.filter((a) => a.id !== id)
    if (filtered.length === assignments.length) return false
    saveToStorage(STORAGE_KEYS.ENTITY_ASSIGNMENTS, filtered)
    return true
  },
}

export const assignmentStorage = entityAssignmentStorage

// Course operations - now entity-level
export const courseStorage = {
  getAll: (entityId?: string, universityId?: string): Course[] => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES)
    let filtered = courses
    if (universityId) {
      filtered = filtered.filter((c) => c.universityId === universityId)
    }
    if (entityId) {
      filtered = filtered.filter((c) => c.entityId === entityId)
    }
    return filtered
  },

  getById: (id: string): Course | undefined => {
    return getFromStorage<Course>(STORAGE_KEYS.COURSES).find((c) => c.id === id)
  },

  create: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES)
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    courses.push(newCourse)
    saveToStorage(STORAGE_KEYS.COURSES, courses)
    return newCourse
  },

  update: (id: string, updates: Partial<Course>): Course | null => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES)
    const index = courses.findIndex((c) => c.id === id)
    if (index === -1) return null

    courses[index] = {
      ...courses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.COURSES, courses)
    return courses[index]
  },

  archive: (id: string): boolean => {
    return !!courseStorage.update(id, { status: 'Archived' })
  },
}

// Offering operations - now entity-level
export const offeringStorage = {
  getAll: (entityId?: string, universityId?: string): Offering[] => {
    const offerings = getFromStorage<Offering>(STORAGE_KEYS.OFFERINGS)
    let filtered = offerings
    if (universityId) {
      filtered = filtered.filter((o) => o.universityId === universityId)
    }
    if (entityId) {
      filtered = filtered.filter((o) => o.entityId === entityId)
    }
    return filtered
  },

  getById: (id: string): Offering | undefined => {
    return getFromStorage<Offering>(STORAGE_KEYS.OFFERINGS).find((o) => o.id === id)
  },

  create: (offering: Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>): Offering => {
    const offerings = getFromStorage<Offering>(STORAGE_KEYS.OFFERINGS)
    const newOffering: Offering = {
      ...offering,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    offerings.push(newOffering)
    saveToStorage(STORAGE_KEYS.OFFERINGS, offerings)
    return newOffering
  },

  update: (id: string, updates: Partial<Offering>): Offering | null => {
    const offerings = getFromStorage<Offering>(STORAGE_KEYS.OFFERINGS)
    const index = offerings.findIndex((o) => o.id === id)
    if (index === -1) return null

    offerings[index] = {
      ...offerings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveToStorage(STORAGE_KEYS.OFFERINGS, offerings)
    return offerings[index]
  },

  archive: (id: string): boolean => {
    return !!offeringStorage.update(id, { status: 'Archived' })
  },
}

export const sessionStorage = {
  getCurrentUser: (): UserAccount | null => {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setCurrentUser: (user: UserAccount | null): void => {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  },

  clearCurrentUser: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  getCurrentEntity: (): Entity | null => {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem('astu_current_entity')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setCurrentEntity: (entity: Entity | null): void => {
    if (typeof window === 'undefined') return
    if (entity) {
      localStorage.setItem('astu_current_entity', JSON.stringify(entity))
    } else {
      localStorage.removeItem('astu_current_entity')
    }
  },

  getCurrentAssignment: (): EntityAssignment | null => {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem('astu_current_assignment')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setCurrentAssignment: (assignment: EntityAssignment | null): void => {
    if (typeof window === 'undefined') return
    if (assignment) {
      localStorage.setItem('astu_current_assignment', JSON.stringify(assignment))
    } else {
      localStorage.removeItem('astu_current_assignment')
    }
  },
}
