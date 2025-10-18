# University Resource Allocator - System Architecture

## Overview

The University Resource Allocator is a multi-tenant platform that enables universities to independently manage their organizational structure, personnel, courses, and offerings through a hierarchical entity management system with clear separation of duties between SuperAdmins and Entity Managers.

## Core Principles

### 1. Multi-Tenancy
- Each university operates as an independent tenant with complete data isolation
- All data is segregated by `universityId` at the storage layer
- Universities cannot access or modify other universities' data

### 2. Separation of Duties
The system enforces strict separation between SuperAdmin and Entity Admin responsibilities:

#### SuperAdmin Responsibilities
- **Entity Management**: Create, update, and archive organizational entities (Colleges, Departments, Divisions)
- **Hierarchical Structure**: Establish parent-child relationships between entities
- **User Account Management**: Create user accounts and assign them to manage entities
- **Entity Assignment**: Assign users to manage specific entities with auto-generated credentials
- **NOT Responsible For**: Personnel management, course creation, offering management

#### Entity Admin Responsibilities
- **Personnel Management**: Add and manage personnel within their assigned entity
- **Course Creation**: Create and manage courses offered by their entity
- **Offering Management**: Create and manage course offerings (collections of courses)
- **Child Entity Management**: Create and manage child entities (if applicable)
- **Hierarchical Assignment**: Assign users to manage child entities
- **NOT Responsible For**: University-level configuration, other entities' data

### 3. Credential Management
- **User Accounts**: Created without passwords at the SuperAdmin level
- **Entity Assignments**: Passwords are generated when a user is assigned to manage an entity
- **Password Rotation**: When a manager is changed, a new password is generated
- **First Login**: Users must change their temporary password on first login
- **Security**: Passwords are hashed using bcrypt (production) or Base64 (demo)

## Data Model

### Core Entities

#### University
\`\`\`typescript
interface University {
  id: string
  name: string
  shortName: string
  domain: string // unique identifier
  contactEmail: string
  contactPhone: string
  address: string
  status: "Active" | "Suspended" | "Archived"
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Entity
\`\`\`typescript
interface Entity {
  id: string
  universityId: string
  name: string
  type: "College" | "Department" | "Division" | "Other"
  parentEntityId: string | null // for hierarchical relationships
  status: "Active" | "Archived"
  createdAt: string
  updatedAt: string
}
\`\`\`

#### UserAccount
\`\`\`typescript
interface UserAccount {
  id: string
  universityId: string
  username: string
  role: "SuperAdmin" | "EntityAdmin"
  createdAt: string
  updatedAt: string
}
\`\`\`

#### EntityAssignment
\`\`\`typescript
interface EntityAssignment {
  id: string
  universityId: string
  userId: string
  entityId: string
  password: string // hashed
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Personnel (Entity-Level)
\`\`\`typescript
interface Personnel {
  id: string
  entityId: string // belongs to entity, not university
  universityId: string
  fullName: string
  email: string
  employeeId: string
  status: "Active" | "Archived"
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Course (Entity-Level)
\`\`\`typescript
interface Course {
  id: string
  universityId: string
  entityId: string // belongs to entity
  courseCode: string
  title: string
  creditHours: number
  description: string
  status: "Active" | "Archived"
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Offering (Entity-Level)
\`\`\`typescript
interface Offering {
  id: string
  universityId: string
  entityId: string // belongs to entity
  name: string
  academicYear: string
  semester: string
  courseIds: string[]
  status: "Active" | "Archived"
  createdAt: string
  updatedAt: string
}
\`\`\`

## Authentication Flow

### SuperAdmin Login
1. User enters username and password
2. System verifies credentials against UserAccount
3. User is authenticated as SuperAdmin
4. Access to entity and user management dashboards

### Entity Admin Login
1. User enters username, password, and selects entity
2. System verifies credentials against EntityAssignment for that entity
3. User is authenticated as EntityAdmin for that entity
4. Access to entity-specific personnel, courses, and offerings management

### Password Management
1. **Initial Creation**: SuperAdmin creates user account (no password)
2. **Entity Assignment**: When assigning user to entity, system generates temporary password
3. **First Login**: User must change temporary password
4. **Manager Change**: When reassigning entity to different user, new password is generated

## Dashboard Structure

### SuperAdmin Dashboard
- **Overview**: Entity count, user count, entity assignments
- **Entities**: Create, edit, archive entities; manage hierarchy
- **Users**: Create user accounts, manage roles
- **Entity Assignments**: Assign users to entities, manage credentials

### Entity Admin Dashboard
- **Overview**: Personnel count, courses, offerings
- **Personnel**: Add, edit, archive personnel within entity
- **Courses**: Create, edit, archive courses
- **Offerings**: Create, edit, archive course offerings
- **Child Entities**: Manage child entities (if applicable)

## Data Isolation & Security

### Tenant Isolation
- All queries filter by `universityId`
- Storage layer enforces university-level data segregation
- Cross-university data access is impossible at the storage level

### Role-Based Access Control
- SuperAdmins can only manage their university's entities and users
- Entity Admins can only manage their assigned entity and child entities
- Authentication middleware validates user role and university context

### Credential Security
- Passwords are hashed before storage
- Entity assignments include password rotation capability
- Temporary passwords expire after first login
- Password changes are logged in audit trail (future enhancement)

## Workflow Examples

### Scenario 1: University Registration & Initial Setup
1. University registers through registration page
2. System creates University record
3. System creates SuperAdmin user account
4. SuperAdmin receives temporary credentials
5. SuperAdmin logs in and changes password
6. SuperAdmin creates organizational entities
7. SuperAdmin creates user accounts for entity managers
8. SuperAdmin assigns users to entities (passwords generated)
9. Entity managers log in and manage their entities

### Scenario 2: Adding New Entity Manager
1. SuperAdmin creates new user account
2. SuperAdmin assigns user to entity (password generated)
3. System sends credentials to entity manager
4. Entity manager logs in and changes password
5. Entity manager can now manage assigned entity

### Scenario 3: Changing Entity Manager
1. SuperAdmin removes old assignment
2. SuperAdmin creates new assignment for different user
3. New password is generated for new manager
4. Old manager loses access to entity
5. New manager receives credentials and logs in

## Storage Implementation

The system uses localStorage for demo purposes. In production, this should be replaced with:
- PostgreSQL or similar relational database
- Proper indexing on `universityId` for performance
- Row-Level Security (RLS) policies for tenant isolation
- Audit logging for compliance

## Future Enhancements

1. **Audit Logging**: Track all user actions and data changes
2. **Advanced Permissions**: Fine-grained permission management
3. **Resource Management**: Room and resource allocation
4. **Reporting**: Advanced analytics and reporting
5. **API Integration**: Third-party integrations
6. **SSO**: Single Sign-On integration
7. **Two-Factor Authentication**: Enhanced security
