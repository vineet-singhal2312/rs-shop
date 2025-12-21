# Authentication Implementation Guide

## Overview
The Shop Management System now includes a complete authentication system with:
- Login page with username/password
- Token-based authentication stored in localStorage
- Protected API routes
- Automatic logout functionality

## Database Setup

### 1. Run the Migration
Execute the SQL in `migration_add_users.sql` against your Supabase database:

```sql
-- This will create the users table and add a default admin user
```

### 2. Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change this password after first login!

## How It Works

### Authentication Flow
1. User visits any protected page
2. Layout component checks for `auth_token` in localStorage
3. If no token, user is redirected to `/login`
4. User enters credentials
5. Backend verifies password using bcrypt
6. If valid, server generates token and returns it
7. Frontend stores token in localStorage
8. All subsequent API requests include token in Authorization header

### Token Format
- Base64 encoded string containing: `username:timestamp`
- Valid for 24 hours
- Stored in localStorage as `auth_token`

### Protected Routes
All API endpoints are now protected:
- `/api/items` (GET, POST)
- `/api/items/[id]` (PUT, DELETE)
- `/api/manufacturers` (GET, POST)
- `/api/manufacturers/[id]` (PUT, DELETE)

### Frontend Changes
1. **Layout Component**: 
   - Checks authentication on mount
   - Shows username in header
   - Provides logout button (desktop & mobile)

2. **Login Page** (`/login`):
   - Beautiful gradient design
   - Mobile-optimized
   - Error handling
   - Loading states

3. **API Requests**:
   - Use `authFetch()` utility instead of `fetch()`
   - Automatically includes Authorization header
   - Example:
     ```typescript
     import { authFetch } from '@/lib/authFetch'
     
     const res = await authFetch('/api/items')
     ```

## Updating Frontend Pages

To update existing pages to use authenticated requests, replace:
```typescript
const res = await fetch('/api/items')
```

With:
```typescript
import { authFetch } from '@/lib/authFetch'
const res = await authFetch('/api/items')
```

## Adding New Users

To add a new user, you need to:

1. Generate a password hash:
```bash
node generate-hash.js
# Enter your desired password when prompted
```

2. Insert into database:
```sql
INSERT INTO users (username, password_hash) 
VALUES ('newuser', 'generated_hash_here');
```

## Security Notes

1. **Token Expiration**: Tokens expire after 24 hours
2. **Password Hashing**: Uses bcrypt with 10 rounds
3. **localStorage**: Tokens stored client-side (consider httpOnly cookies for production)
4. **HTTPS**: Always use HTTPS in production
5. **Password Policy**: Implement strong password requirements in production

## Troubleshooting

### "Unauthorized" errors
- Check if token exists in localStorage
- Verify token hasn't expired (24 hours)
- Ensure API routes are using `withAuth()` middleware

### Login not working
- Verify database migration ran successfully
- Check password hash matches in database
- Look at browser console for errors

### Infinite redirect loop
- Clear localStorage
- Check if `/login` page is accessible
- Verify Layout component logic

## Files Modified/Created

### New Files
- `src/pages/login.tsx` - Login page
- `src/pages/login.module.css` - Login styles
- `src/pages/api/auth/login.ts` - Login API endpoint
- `src/lib/auth.ts` - Authentication utilities
- `src/lib/authFetch.ts` - Authenticated fetch utility
- `migration_add_users.sql` - Database migration
- `generate-hash.js` - Password hash generator

### Modified Files
- `src/components/Layout.tsx` - Auth check & logout
- `src/components/Layout.module.css` - Logout button styles
- `src/pages/api/items/index.ts` - Protected with auth
- `src/pages/api/items/[id].ts` - Protected with auth
- `src/pages/api/manufacturers/index.ts` - Protected with auth
- `src/pages/api/manufacturers/[id].ts` - Protected with auth

## Next Steps

1. ✅ Run database migration
2. ⚠️ Update all frontend fetch calls to use `authFetch()`
3. ⚠️ Change default admin password
4. 🔄 Test login/logout flow
5. 🔄 Test API protection
6. 🚀 Deploy!
