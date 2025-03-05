# User Management Implementation Guide

This guide explains how to integrate the User Management page into your ATS application.

## 1. Integration Steps

### Step 1: Configure Routes

The User Management page has been added to the routes configuration in `routes/index.tsx`:

```typescript
// Import the lazy-loaded component
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"));

// Add the route with proper authorization
<Route
  path="users/manage"
  element={
    <ProtectedRoute roles={["ADMIN", "HR"]}>
      <UserManagementPage />
    </ProtectedRoute>
  }
/>
```

### Step 2: Add Navigation Link

The User Management link has been added to the management menu in `components/Navbar.tsx`:

```typescript
// Management menu items
const managementItems = [
  // ...other items
  ...(isAdmin || isHR
    ? [
        {
          path: "/users/manage",
          label: "User Management",
          icon: <GroupIcon />,
        },
      ]
    : []),
  // ...other items
];
```

### Step 3: Update User Service

The User Service has been enhanced to include methods for user management and department fetching:

```typescript
// Added to userService.ts
async getDepartments() {
  try {
    console.log("Fetching departments");
    const response = await api.get("/departments");
    console.log("Departments retrieved:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    // Provide fallback departments if API fails
    return [
      { id: 1, name: "Engineering" },
      { id: 2, name: "Marketing" },
      { id: 3, name: "Sales" },
      { id: 4, name: "Human Resources" },
      { id: 5, name: "Finance" }
    ];
  }
}
```

## 2. User Flow

1. **Access**: Users with ADMIN or HR roles can access the User Management page via the navigation menu under "Management" → "User Management".

2. **View Users**: The page displays a table of users with key information and filtering options by role.

3. **Create User**: Click "Add User" to open a dialog for creating a new user with form validation.

4. **Edit User**: Click the edit icon next to a user to update their information.

5. **Delete User**: Click the delete icon to remove a user (with confirmation).

## 3. Customization Options

### Styling

You can customize the appearance of the User Management page by modifying the theme in your application:

```typescript
// Customize colors in theme.ts or theme.js
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change to match your branding
    },
    secondary: {
      main: '#9c27b0', // Change to match your branding
    },
    // Other color customizations
  },
});
```

### Localization

For international applications, add translations for user management labels and messages:

```typescript
// Example translation object (for future implementation)
const translations = {
  en: {
    userManagement: {
      title: "User Management",
      addUser: "Add User",
      // Other labels
    }
  },
  // Other languages
};
```

## 4. Troubleshooting

- **Access Issues**: Ensure users have the correct role (ADMIN or HR) to access the page.
- **Data Loading**: If users aren't loading, check network requests and API endpoints.
- **Form Validation**: If form validation seems too strict or loose, adjust the validation rules in the `validateCreateForm` and `validateUpdateForm` functions.

## 5. Backend Requirements

Make sure your backend supports these endpoints:

- `GET /users` - List all users with optional role filtering
- `GET /users/:id` - Get a specific user
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user
- `GET /departments` - List all departments for assignment

## 6. Future Enhancements

Consider these future improvements to the User Management page:

- User activity logs
- Permission-based role management
- Bulk user actions (import/export)
- Advanced filtering and search options 