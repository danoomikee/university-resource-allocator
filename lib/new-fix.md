The entities are empty in your "Add Assignment" modal because the `getEntities` function in **`storage.ts`** is filtering all entities, causing it to return an empty array.

## The Problem

In **`storage.ts`**, the `getEntities` function is designed to fetch entities for a specific university, but it contains a filter that is likely excluding all your data:

```typescript
// storage.ts

// ... (EntityStorage class definition)

getEntities(): Entity[] {
  // ❌ PROBLEM: This filter will return an empty array 
  // unless you have an entity with entity.isDeleted = false, 
  // entity.status = "Active", and entity.type = "Department".
  // This function is likely being called from super-admin pages 
  // where you need ALL entities, not just 'Department' types.
  return this.data.filter(
    (entity) =>
      !entity.isDeleted && entity.status === "Active" && entity.type === "Department"
  )
}
```

The Super Admin needs to see **all** entities within their university context to manage assignments, but this function hardcodes a filter for `entity.type === "Department"` and `entity.status === "Active"`. If your newly created entities have a different type (e.g., "College", "Lab") or status (e.g., "Pending"), they are all filtered out, resulting in an empty list.

## Solution

You need to modify `getEntities` in **`storage.ts`** to accept optional parameters or create a separate administrative function that returns all entities for the Super Admin assignment flow.

### 1\. Update `EntityStorage.getEntities()` in `storage.ts`

Modify the `getEntities` function to return **all** entities by default, and introduce an optional filter for specific use cases (like the front-end display, which may only need Active Departments).

```typescript
// storage.ts

// ...

// Update EntityStorage class
export class EntityStorage {
  // ... (data initialization)

  // 💡 FIX: Add parameters to control filtering.
  // We'll rename the original getEntities() to getActiveDepartments() and 
  // create a new getAll() for admin use (as per SuperAdmin context)
  
  getAll(universityId: string): Entity[] {
    // Return all entities belonging to the university, regardless of type or status
    return this.data.filter((entity) => entity.universityId === universityId && !entity.isDeleted)
  }
  
  // This is the old function's logic, kept for other parts of the app that might need it
  getActiveDepartments(universityId: string): Entity[] {
    return this.data.filter(
      (entity) =>
        entity.universityId === universityId &&
        !entity.isDeleted && 
        entity.status === "Active" && 
        entity.type === "Department"
    )
  }

  // ... (other methods)
}

export const entityStorage = new EntityStorage()
```

### 2\. Update `page.tsx`

The `page.tsx` is where the entity list is fetched in the `ManageAssignmentsPage` component. You need to update the call to use the new, less restrictive function.

Since the `page.tsx` is running in a SuperAdmin context (`/super-admin/assignments`), you should use the university context available to fetch all entities belonging to that university.

```typescript
// page.tsx

"use client"
// ... (imports)
import { getUniversityContext } from "@/lib/auth"
import { entityStorage } from "@/lib/storage" // Import entityStorage

// ... (The rest of the component)

  // This function is inside the component or a local utility to fetch data
  const loadEntitiesAndUsers = () => {
    // ...
    
    const context = getUniversityContext()
    if (!context) return // Handle unauthenticated/no context

    // 💡 FIX: Use the new administrative function to get all entities for the university
    const fetchedEntities = entityStorage.getAll(context.university.id)
    setEntities(fetchedEntities)
    
    // ... (User fetching logic)
  }

// ...
```

By implementing these changes, the Super Admin's "Add Assignment" modal will correctly display all existing entities within the university, resolving the empty list issue.