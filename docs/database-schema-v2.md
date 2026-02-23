# Knowvana Multi-Tenant Database Architecture v2

## Overview
This document describes the hierarchical multi-tenant database architecture for Knowvana platform with application-level admins.

## Database Structure

```
Knowvana/                                    # Root organization container
├── ApplicationAdmins/                       # Global application administrators
│   └── {adminId}/                          # Admin user document
│       ├── email: string
│       ├── displayName: string
│       ├── role: string (super_admin/admin)
│       ├── permissions: array
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── Tenants/                                # All customer tenants
│   └── {tenantId}/                         # Individual tenant
│       ├── metadata/                       # Tenant information
│       │   └── info/
│       │       ├── tenantName: string
│       │       ├── status: string (active/suspended/trial)
│       │       ├── plan: string (free/pro/enterprise)
│       │       ├── owner: string (adminId)
│       │       ├── domain: string
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       ├── config/                         # Tenant configuration
│       │   └── app/
│       │       ├── appName: string
│       │       ├── appVersion: string
│       │       ├── appLogo: string
│       │       ├── company: string
│       │       ├── description: string
│       │       ├── modules: array
│       │       ├── features: array
│       │       ├── support: object
│       │       ├── buildDate: string
│       │       ├── license: string
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       ├── tasks/                          # Tenant-specific tasks
│       │   └── {taskId}/
│       │       ├── taskId: string
│       │       ├── taskName: string
│       │       ├── category: string
│       │       ├── cron_schedule: string
│       │       ├── AddedByProcess: string
│       │       ├── AddedByUser: string
│       │       └── createdAt: timestamp
│       │
│       └── roster/                         # Tenant-specific roster
│           ├── employees/
│           ├── shifts/
│           └── schedules/
│
└── TenantUsers/                            # All tenant users (cross-tenant lookup)
    └── {userId}/
        ├── email: string
        ├── displayName: string
        ├── tenants: map                    # Map of tenantId to role
        │   └── {tenantId}: {
        │       role: string (admin/manager/user/viewer)
        │       status: string (active/inactive/suspended)
        │       permissions: array
        │       joinedAt: timestamp
        │   }
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

## Hierarchy

```
Knowvana (Organization Root)
    │
    ├── ApplicationAdmins (Platform Owners)
    │   ├── Super Admin (Full access to everything)
    │   └── Admin (Manage tenants and users)
    │
    ├── Tenants (Customer Organizations)
    │   ├── Tenant A
    │   │   ├── Config
    │   │   ├── Tasks
    │   │   └── Roster
    │   └── Tenant B
    │       ├── Config
    │       ├── Tasks
    │       └── Roster
    │
    └── TenantUsers (All Users)
        ├── User 1 (Access to Tenant A)
        ├── User 2 (Access to Tenant A & B)
        └── User 3 (Access to Tenant B)
```

## Access Levels

### 1. Application Admins (Knowvana Level)
- **Super Admin**: Full platform access
  - Manage all tenants
  - Manage all tenant users
  - View all data across tenants
  - System configuration
  
- **Admin**: Limited platform access
  - Manage tenants
  - Manage tenant users
  - View tenant data

### 2. Tenant Users (Tenant Level)
- **Tenant Admin**: Full tenant access
  - Manage tenant configuration
  - Manage tenant users
  - Full access to tenant data
  
- **Manager**: Limited tenant access
  - Manage operations
  - View all data
  - Limited configuration
  
- **User**: Standard access
  - Use features
  - View assigned data
  
- **Viewer**: Read-only access
  - View data only

## Data Models

### Application Admin
```typescript
interface ApplicationAdmin {
  adminId: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Tenant
```typescript
interface Tenant {
  tenantId: string;
  metadata: {
    tenantName: string;
    status: 'active' | 'suspended' | 'trial';
    plan: 'free' | 'pro' | 'enterprise';
    owner: string; // adminId
    domain?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  config: AppConfig;
}
```

### Tenant User
```typescript
interface TenantUser {
  userId: string;
  email: string;
  displayName: string;
  tenants: {
    [tenantId: string]: {
      role: 'admin' | 'manager' | 'user' | 'viewer';
      status: 'active' | 'inactive' | 'suspended';
      permissions: string[];
      joinedAt: Timestamp;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check if user is application admin
    function isApplicationAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/Knowvana/ApplicationAdmins/$(request.auth.uid));
    }
    
    // Helper: Check if user has access to tenant
    function hasTenantAccess(tenantId) {
      return request.auth != null && 
             exists(/databases/$(database)/documents/Knowvana/TenantUsers/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/Knowvana/TenantUsers/$(request.auth.uid)).data.tenants[tenantId] != null;
    }
    
    // Application Admins (read-only for checking, write via admin SDK)
    match /Knowvana/ApplicationAdmins/{adminId} {
      allow read: if isApplicationAdmin();
      allow write: if false; // Only via admin SDK
    }
    
    // Tenants
    match /Knowvana/Tenants/{tenantId}/{document=**} {
      allow read: if isApplicationAdmin() || hasTenantAccess(tenantId);
      allow write: if isApplicationAdmin() || hasTenantAccess(tenantId);
    }
    
    // Tenant Users
    match /Knowvana/TenantUsers/{userId} {
      allow read: if isApplicationAdmin() || request.auth.uid == userId;
      allow write: if isApplicationAdmin();
    }
  }
}
```

## Migration from Old Schema

1. Move `systemAdmins` → `Knowvana/ApplicationAdmins`
2. Move `tenants` → `Knowvana/Tenants`
3. Move tenant-specific users → `Knowvana/TenantUsers` with tenant mapping
4. Update all service references to new paths

## Benefits

1. **Clear Hierarchy**: Knowvana → ApplicationAdmins, Tenants, TenantUsers
2. **Separation of Concerns**: Platform admins separate from tenant users
3. **Cross-Tenant Users**: Users can belong to multiple tenants
4. **Scalable**: Easy to add more organizational levels
5. **Secure**: Clear access control at each level
