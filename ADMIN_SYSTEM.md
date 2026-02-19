# Admin/User Role System - Implementation Guide

## ✅ System Overview

A complete role-based access control (RBAC) system has been implemented with two roles:
- **User** - Default role for all new signups
- **Admin** - Full access including user management capabilities

## Database Changes

### Schema Update
The `users` table now includes a `role` field:
```typescript
role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user")
```

### Migration
Migration has been applied successfully:
- Migration file: `migrations/0001_uneven_devos.sql`
- All existing users have been assigned the "user" role by default

## Files Created/Modified

### 1. Core Utilities
**`src/lib/auth-utils.ts`**
- `getCurrentUser()` - Get current user with role
- `isAdmin()` - Check if user is admin
- `requireAdmin()` - Redirect if not admin (for pages)
- `checkAdminAccess()` - Check admin access (for API routes)
- `hasRole()` - Check specific role

### 2. API Endpoints
**`src/app/api/admin/users/route.ts`**
- `GET /api/admin/users` - List all users (admin only)
  - Supports pagination (`?page=1&limit=10`)
  - Supports search (`?search=john`)
  - Supports role filter (`?role=admin`)

**`src/app/api/admin/users/[userId]/route.ts`**
- `PATCH /api/admin/users/[userId]` - Update user role (admin only)
- `DELETE /api/admin/users/[userId]` - Delete user (admin only)

### 3. Admin Dashboard
**`src/app/dashboard/admin/page.tsx`**
- Complete user management interface
- Search and filter users
- Change user roles (user ↔ admin)
- Delete users (with confirmation)
- Pagination for large user lists
- Responsive design

### 4. Navigation
**`src/components/layout/app-sidebar.tsx`**
- Dynamically shows "Admin" section for admin users only
- Uses shield icon for admin menu items
- Automatically checks user role on component mount

### 5. Helper Script
**`promote-to-admin.ts`**
- Command-line script to promote users to admin
- Usage: `npx tsx promote-to-admin.ts user@example.com`

## Usage Guide

### Promoting Your First Admin

1. **Create a user account** (if you haven't already)
   - Sign up through the normal flow at `/auth/sign-up`

2. **Promote to admin** using the script:
   ```bash
   npx tsx promote-to-admin.ts your-email@example.com
   ```

3. **Verify admin access**:
   - Log out and log back in
   - You should now see the "Admin" section in the sidebar
   - Click "User Management" to access the admin dashboard

### Admin Dashboard Features

1. **User List**
   - View all users with their details
   - See role, email verification status, join date
   - Pagination for large user bases

2. **Search & Filter**
   - Search by name or email
   - Filter by role (All, Users, Admins)

3. **Role Management**
   - Change any user's role with a dropdown
   - Cannot change your own role (safety feature)
   - Instant update with confirmation toast

4. **User Deletion**
   - Delete users with confirmation dialog
   - Cannot delete yourself (safety feature)
   - Cascading delete removes all user data

### Security Features

✅ **Admin-only routes protected**
- Non-admin users get redirected to dashboard
- 403 Forbidden for API access attempts

✅ **Self-modification prevention**
- Admins cannot change their own role
- Admins cannot delete their own account

✅ **Cascading deletes**
- When a user is deleted, all associated data is removed:
  - Calendar events
  - Chat conversations and messages
  - Sessions
  - Accounts

✅ **Role validation**
- Only "user" and "admin" roles accepted
- Invalid role attempts return 400 error

## API Examples

### List Users (Admin)
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Cookie: better-auth.session_token=..."
```

### Search Users (Admin)
```bash
curl -X GET "http://localhost:3000/api/admin/users?search=john&role=user" \
  -H "Cookie: better-auth.session_token=..."
```

### Change User Role (Admin)
```bash
curl -X PATCH "http://localhost:3000/api/admin/users/USER_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"role": "admin"}'
```

### Delete User (Admin)
```bash
curl -X DELETE "http://localhost:3000/api/admin/users/USER_ID" \
  -H "Cookie: better-auth.session_token=..."
```

## Code Examples

### Check if current user is admin (Server Component)
```typescript
import { headers } from "next/headers";
import { isAdmin } from "@/lib/auth-utils";

export default async function MyPage() {
  const headersList = await headers();
  const userIsAdmin = await isAdmin(headersList);

  if (userIsAdmin) {
    return <AdminContent />;
  }

  return <UserContent />;
}
```

### Require admin access (Server Component)
```typescript
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminOnlyPage() {
  const headersList = await headers();
  const admin = await requireAdmin(headersList); // Redirects if not admin

  return <h1>Welcome Admin {admin.name}</h1>;
}
```

### Protect API route (API Route)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const accessCheck = await checkAdminAccess(req.headers);

  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.message },
      { status: accessCheck.status }
    );
  }

  // Admin-only logic here
  const admin = accessCheck.user;
  // ...
}
```

## Future Enhancements

### Possible Additions:
1. **More Granular Roles**
   - Add "moderator", "editor", etc.
   - Create a permissions table for fine-grained control

2. **Activity Logging**
   - Log admin actions (role changes, deletions)
   - Audit trail for compliance

3. **Bulk Operations**
   - Bulk role assignment
   - Bulk user deletion

4. **User Impersonation**
   - Allow admins to impersonate users for support

5. **Email Notifications**
   - Notify users when their role changes
   - Notify admins of new signups

## Troubleshooting

### "Access denied: Admin privileges required"
- Make sure you've promoted your account to admin
- Log out and log back in after promotion
- Check database: `SELECT email, role FROM users;`

### Admin section not showing in sidebar
- Clear browser cache
- Check browser console for errors
- Verify `/api/admin/users` returns 200 (not 403)

### Cannot promote user to admin
- Verify the email exists in database
- Check `.env.local` has correct `DATABASE_URL`
- Run: `npx tsx promote-to-admin.ts email@example.com`

## Testing Checklist

- [ ] Create a test user account
- [ ] Promote user to admin via script
- [ ] Log in and verify admin section appears
- [ ] Access admin dashboard
- [ ] Search for users
- [ ] Filter by role
- [ ] Change a user's role
- [ ] Try to change own role (should fail)
- [ ] Delete a test user
- [ ] Try to delete own account (should fail)
- [ ] Log in as regular user, verify no admin access
- [ ] Try to access `/dashboard/admin` as regular user (should redirect)

## Summary

The admin system is now fully functional with:
✅ Database role field added
✅ Utilities for role checking
✅ Protected API endpoints
✅ Full-featured admin dashboard
✅ Dynamic sidebar navigation
✅ Promotion script for initial setup
✅ Security safeguards in place

All users created before this implementation have been assigned the "user" role. Use the `promote-to-admin.ts` script to create your first admin user.
