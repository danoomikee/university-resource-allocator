# Implementation Guide - University Resource Allocator

## Getting Started

### 1. University Registration
- Navigate to the landing page
- Click "Register Your University"
- Fill in university details (name, domain, contact info)
- System automatically creates SuperAdmin account
- SuperAdmin receives temporary credentials

### 2. SuperAdmin Initial Setup

#### Step 1: Create Organizational Entities
1. Log in as SuperAdmin
2. Navigate to "Entities" section
3. Create top-level entities (e.g., College of Engineering)
4. Create child entities (e.g., Department of Computer Science)
5. Establish hierarchical relationships

#### Step 2: Create User Accounts
1. Navigate to "Users" section
2. Click "Add User"
3. Enter username and select role (SuperAdmin or EntityAdmin)
4. User account is created without password

#### Step 3: Assign Users to Entities
1. Navigate to "Entity Assignments" section
2. Select user and entity
3. System generates temporary password
4. Share credentials with entity manager

### 3. Entity Admin Operations

#### Managing Personnel
1. Log in as Entity Admin
2. Navigate to "Personnel" section
3. Add personnel with full name, email, employee ID
4. Personnel are scoped to the entity

#### Creating Courses
1. Navigate to "Courses" section
2. Click "Add Course"
3. Enter course code, title, credit hours, description
4. Courses are scoped to the entity

#### Creating Offerings
1. Navigate to "Offerings" section
2. Click "Add Offering"
3. Select courses to include
4. Specify academic year and semester
5. Offerings are scoped to the entity

#### Managing Child Entities
1. Navigate to "Child Entities" section
2. Create sub-entities within your entity
3. Assign managers to child entities
4. Child entity managers can manage their own entities

## Key Features

### Multi-Tenancy
- Complete data isolation between universities
- Each university operates independently
- No cross-university data access

### Hierarchical Entity Management
- Create unlimited levels of entity hierarchy
- Assign managers at each level
- Child entities inherit parent context

### Secure Credential Management
- Passwords generated only at entity assignment
- Temporary passwords expire after first login
- Password rotation on manager change
- Hashed password storage

### Role-Based Access Control
- SuperAdmin: University-level management
- EntityAdmin: Entity-level management
- Automatic role enforcement

## API Endpoints (Future)

### Authentication
- `POST /api/auth/register` - University registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Entities
- `GET /api/entities` - List entities
- `POST /api/entities` - Create entity
- `PUT /api/entities/:id` - Update entity
- `DELETE /api/entities/:id` - Archive entity

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Entity Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `DELETE /api/assignments/:id` - Remove assignment

### Personnel
- `GET /api/personnel` - List personnel
- `POST /api/personnel` - Create personnel
- `PUT /api/personnel/:id` - Update personnel

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course

### Offerings
- `GET /api/offerings` - List offerings
- `POST /api/offerings` - Create offering
- `PUT /api/offerings/:id` - Update offering

## Database Schema (Production)

\`\`\`sql
-- Universities
CREATE TABLE universities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  domain VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Entities
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  parent_entity_id UUID REFERENCES entities(id),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_university_id (university_id),
  INDEX idx_parent_entity_id (parent_entity_id)
);

-- User Accounts
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  username VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_university_id (university_id)
);

-- Entity Assignments
CREATE TABLE entity_assignments (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  user_id UUID NOT NULL REFERENCES user_accounts(id),
  entity_id UUID NOT NULL REFERENCES entities(id),
  password VARCHAR(255) NOT NULL,
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE KEY unique_user_entity (user_id, entity_id),
  INDEX idx_university_id (university_id),
  INDEX idx_user_id (user_id),
  INDEX idx_entity_id (entity_id)
);

-- Personnel
CREATE TABLE personnel (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES entities(id),
  university_id UUID NOT NULL REFERENCES universities(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  employee_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_entity_id (entity_id),
  INDEX idx_university_id (university_id)
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  entity_id UUID NOT NULL REFERENCES entities(id),
  course_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  credit_hours INT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_entity_id (entity_id),
  INDEX idx_university_id (university_id)
);

-- Offerings
CREATE TABLE offerings (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  entity_id UUID NOT NULL REFERENCES entities(id),
  name VARCHAR(255) NOT NULL,
  academic_year VARCHAR(50),
  semester VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_entity_id (entity_id),
  INDEX idx_university_id (university_id)
);

-- Offering Courses (junction table)
CREATE TABLE offering_courses (
  offering_id UUID NOT NULL REFERENCES offerings(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  PRIMARY KEY (offering_id, course_id)
);
\`\`\`

## Security Considerations

1. **Data Isolation**: All queries must include `universityId` filter
2. **Authentication**: Verify user role and university context on every request
3. **Authorization**: Check entity assignment before allowing entity operations
4. **Password Security**: Use bcrypt or similar for production
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure CORS properly for API endpoints
7. **Rate Limiting**: Implement rate limiting on authentication endpoints
8. **Audit Logging**: Log all administrative actions

## Troubleshooting

### User Cannot Log In
1. Verify user account exists
2. Check entity assignment exists (for EntityAdmin)
3. Verify password is correct
4. Check user status is Active

### Missing Data
1. Verify university context is correct
2. Check data is scoped to correct entity
3. Verify user has permission to access data

### Performance Issues
1. Add indexes on frequently queried columns
2. Implement pagination for large datasets
3. Cache frequently accessed data
4. Monitor database query performance
