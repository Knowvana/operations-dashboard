# Multi-Tenant Firebase Database Schema

## Overview
This document describes the multi-tenant database architecture for Zen-Ops Enterprise SaaS platform.

## Database Structure

```
firebase-root/
├── tenants/                          # Root collection for all tenants
│   ├── {tenantId}/                   # Individual tenant document
│   │   ├── config/                   # Tenant configuration subcollection
│   │   │   └── app/                  # App configuration document
│   │   │       ├── appName: string
│   │   │       ├── appVersion: string
│   │   │       ├── appLogo: string
│   │   │       ├── company: string
│   │   │       ├── description: string
│   │   │       ├── modules: array
│   │   │       ├── features: array
│   │   │       ├── support: object
│   │   │       ├── buildDate: string
│   │   │       ├── license: string
│   │   │       ├── createdAt: timestamp
│   │   │       └── updatedAt: timestamp
│   │   │
│   │   ├── tasks/                    # Tenant-specific tasks (ops monitor)
│   │   │   └── {taskId}/
│   │   │       ├── taskId: string
│   │   │       ├── taskName: string
│   │   │       ├── category: string
│   │   │       ├── cron_schedule: string
│   │   │       ├── AddedByProcess: string
│   │   │       ├── AddedByUser: string
│   │   │       └── createdAt: timestamp
│   │   │
│   │   ├── roster/                   # Tenant-specific roster data
│   │   │   ├── employees/
│   │   │   ├── shifts/
│   │   │   └── schedules/
│   │   │
│   │   ├── users/                    # Tenant users
│   │   │   └── {userId}/
│   │   │       ├── email: string
│   │   │       ├── displayName: string
│   │   │       ├── role: string
│   │   │       ├── permissions: array
│   │   │       └── createdAt: timestamp
│   │   │
│   │   └── metadata/                 # Tenant metadata (root level fields)
│   │       ├── tenantName: string
│   │       ├── status: string (active/suspended/trial)
│   │       ├── plan: string (free/pro/enterprise)
│   │       ├── createdAt: timestamp
│   │       ├── updatedAt: timestamp
│   │       ├── owner: string (userId)
│   │       └── domain: string (custom domain)
│
└── system/                           # System-level collections
    ├── defaults/                     # Default configurations
    │   └── appConfig/                # Default app config template
    │
    └── tenantIndex/                  # Tenant lookup index
        └── {domain}/                 # Map custom domains to tenantIds
            └── tenantId: string
```

## Data Models

### Tenant Document
```typescript
interface Tenant {
  tenantId: string;
  tenantName: string;
  status: 'active' | 'suspended' | 'trial';
  plan: 'free' | 'pro' | 'enterprise';
  owner: string;
  domain?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### App Configuration
```typescript
interface AppConfig {
  appName: string;
  appVersion: string;
  appLogo: string;
  company: string;
  description: string;
  modules: Module[];
  features: string[];
  support: {
    email: string;
    documentation: string;
    website: string;
  };
  buildDate: string;
  license: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check tenant access
    function isTenantUser(tenantId) {
      return request.auth != null && 
             exists(/databases/$(database)/documents/tenants/$(tenantId)/users/$(request.auth.uid));
    }
    
    // Tenant data access
    match /tenants/{tenantId} {
      // Only authenticated users of this tenant can read
      allow read: if isTenantUser(tenantId);
      
      // Tenant config
      match /config/{document=**} {
        allow read: if isTenantUser(tenantId);
        allow write: if isTenantUser(tenantId); // Add role check for admin
      }
      
      // Tenant tasks
      match /tasks/{taskId} {
        allow read, write: if isTenantUser(tenantId);
      }
      
      // Tenant roster
      match /roster/{document=**} {
        allow read, write: if isTenantUser(tenantId);
      }
      
      // Tenant users
      match /users/{userId} {
        allow read: if isTenantUser(tenantId);
        allow write: if isTenantUser(tenantId); // Add role check for admin
      }
    }
    
    // System defaults (read-only for all authenticated users)
    match /system/defaults/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only via admin SDK
    }
  }
}
```

## Tenant Isolation

Each tenant's data is completely isolated:
- Separate subcollections per tenant
- Security rules enforce tenant boundaries
- No cross-tenant data access
- Each tenant has independent tasks, roster, users

## Scalability Considerations

1. **Tenant Sharding**: For large deployments, consider sharding tenants across multiple Firestore instances
2. **Indexing**: Create composite indexes for common queries within tenant scope
3. **Caching**: Implement tenant config caching to reduce reads
4. **Backup**: Tenant-level backup and restore capabilities

## Migration Path

1. Create tenant for existing data
2. Migrate localStorage config to Firebase
3. Move tasks collection under tenant scope
4. Add tenant context to all queries
5. Implement tenant switcher for multi-tenant users
