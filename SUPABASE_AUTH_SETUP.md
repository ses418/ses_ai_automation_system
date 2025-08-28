# Supabase Authentication Setup Guide

This guide explains how to set up and use Supabase Authentication with your team members management system.

## 🚀 Overview

Your project now uses **Supabase Authentication** instead of custom authentication, providing:
- **Secure user management** with built-in security features
- **Row Level Security (RLS)** policies that respect user authentication
- **Automatic session management** with secure tokens
- **Password reset and email verification** out of the box

## 🔐 Database Security Features

### Row Level Security (RLS) Policies

The following RLS policies have been implemented:

#### Team Members Table
- **Users can read their own profile** and **admins can read all profiles**
- **Only admins can insert new team members**
- **Users can update their own profile**, **admins can update all**
- **Only admins can delete team members**

#### Auth Credentials Table
- **Users can only access their own credentials**

#### User Sessions Table
- **Users can only access their own sessions**

### Secure Views and Functions

- **`secure_team_members_view`**: A view that automatically filters data based on user permissions
- **`create_team_member_with_auth`**: Secure function for creating new team members
- **`get_current_user_profile`**: Function to get the current user's profile
- **`validate_team_member_login`**: Function to validate login credentials

## 🛠️ Frontend Integration

### Authentication Service

The `AuthService` class provides these methods:

```typescript
// Initialize authentication state
await AuthService.initialize();

// Sign up new users
const result = await AuthService.signUp({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword',
  department: 'Engineering',
  role: 'Developer'
});

// Sign in existing users
const result = await AuthService.signIn({
  email: 'john@example.com',
  password: 'securepassword'
});

// Sign out
await AuthService.signOut();

// Get current user
const user = AuthService.getCurrentUser();

// Check permissions
const isAdmin = AuthService.isAdmin();
const isActive = AuthService.isActive();
```

### Team Members Service

The `TeamMembersService` now works with authentication:

```typescript
// Get all team members (admin only)
const members = await TeamMembersService.getTeamMembers();

// Get current user's profile
const profile = await TeamMembersService.getCurrentUserProfile();

// Create new team member (admin only)
const newMember = await TeamMembersService.createTeamMember({
  name: 'Jane Smith',
  email: 'jane@example.com',
  department: 'Marketing',
  role: 'Manager'
});
```

## 🔧 Setup Instructions

### 1. Supabase Project Configuration

1. **Enable Authentication** in your Supabase dashboard
2. **Configure Email Templates** for signup and password reset
3. **Set up Site URL** in Authentication settings

### 2. Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Functions

The following database functions have been created:

```sql
-- Create team member with authentication
create_team_member_with_auth(
  p_name, p_email, p_password_hash, p_phone, 
  p_department, p_role, p_location, p_status, 
  p_dashboard_access, p_is_admin
)

-- Get current user profile
get_current_user_profile()

-- Validate login credentials
validate_team_member_login(p_email, p_password_hash)
```

## 🔒 Security Features

### User Roles and Permissions

- **Regular Users**: Can view and edit their own profile
- **Admins**: Can manage all team members, create/delete users
- **Pending Users**: Cannot access the system until approved by admin

### Data Access Control

- **Own Profile**: Users can always access their own data
- **Admin Access**: Admins can access all data
- **Department Isolation**: Users can only see data they're authorized to access

### Session Management

- **Secure Tokens**: Supabase handles JWT tokens automatically
- **Automatic Expiry**: Sessions expire automatically
- **Multi-device Support**: Users can be signed in on multiple devices

## 📱 Usage Examples

### User Registration Flow

```typescript
// 1. User signs up
const signupResult = await AuthService.signUp({
  name: 'New User',
  email: 'newuser@company.com',
  password: 'password123',
  department: 'Sales',
  role: 'Representative'
});

if (signupResult.error) {
  console.error('Signup failed:', signupResult.error);
} else {
  console.log('User created:', signupResult.user);
  // User will need admin approval to become active
}
```

### User Login Flow

```typescript
// 1. User signs in
const loginResult = await AuthService.signIn({
  email: 'user@company.com',
  password: 'password123'
});

if (loginResult.error) {
  console.error('Login failed:', loginResult.error);
} else {
  console.log('User logged in:', loginResult.user);
  
  // Check permissions
  if (AuthService.isAdmin()) {
    console.log('User is admin');
  }
  
  if (AuthService.isActive()) {
    console.log('User account is active');
  }
}
```

### Admin Operations

```typescript
// Only admins can perform these operations
if (AuthService.isAdmin()) {
  // Get all team members
  const allMembers = await TeamMembersService.getTeamMembers();
  
  // Create new team member
  const newMember = await TeamMembersService.createTeamMember({
    name: 'John Doe',
    email: 'john@company.com',
    department: 'Engineering',
    role: 'Developer'
  });
  
  // Update member status
  await TeamMembersService.updateTeamMemberStatus(
    newMember.id, 
    'active'
  );
}
```

## 🚨 Important Notes

### User Status Management

- **New users start with 'pending' status**
- **Only admins can change user status to 'active'**
- **Inactive users cannot sign in**

### Password Management

- **Passwords are managed by Supabase Auth**
- **Password reset emails are sent automatically**
- **Password policies can be configured in Supabase dashboard**

### Data Synchronization

- **Team member profiles are linked to Supabase Auth users**
- **User ID in team_members table matches Supabase Auth user ID**
- **Profile updates are automatically synchronized**

## 🔍 Troubleshooting

### Common Issues

1. **"RLS Policy Error"**: Ensure user is authenticated and has proper permissions
2. **"User not found"**: Check if team member profile exists for the auth user
3. **"Permission denied"**: Verify user has admin role for admin operations

### Debug Steps

1. **Check authentication state**: `AuthService.isAuthenticated()`
2. **Verify user role**: `AuthService.isAdmin()`
3. **Check user status**: `AuthService.isActive()`
4. **Review RLS policies**: Check database policies are correctly applied

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎯 Next Steps

1. **Test the authentication flow** with existing team members
2. **Configure email templates** in Supabase dashboard
3. **Set up password policies** if needed
4. **Test admin operations** with admin users
5. **Implement user approval workflow** for new registrations

---

For any questions or issues, refer to the Supabase documentation or check the console logs for detailed error messages.
