# HR System Test Scripts

This directory contains scripts for testing and managing the HR system's functionality, particularly around hiring goals and department growth plans.

## Available Scripts

### Generate Migration

This script generates a Prisma migration for the schema changes related to department growth plans, activity logs, and strategic priorities.

```bash
npx ts-node -r tsconfig-paths/register src/scripts/generate-migration.ts
```

The script will:
1. Generate a migration file for the schema changes
2. Display the SQL that will be applied
3. Ask if you want to apply the migration immediately

### Test Hiring Goals

This script tests the functionality of the hiring goals and department growth plans:

```bash
npx ts-node -r tsconfig-paths/register src/scripts/test-hiring-goals.ts
```

The script will:
1. Test database connection
2. Retrieve and display company settings
3. Retrieve and display departments
4. Test retrieving hiring goals
5. Test archiving expired goals
6. Test retrieving growth plans
7. Create a test growth plan if none exists
8. Retrieve and display activity logs

## Implementation Details

### Schema Changes

The main schema changes implemented are:

1. **DepartmentGrowthPlan** - A new model to track department growth plans including headcount targets, justification, and strategic priorities
2. **ActivityLog** - A new model to track user activities in the system
3. **CompanySettings** - Added `strategicPriorities` field to store company-wide strategic priorities

### Functionality

The implemented functionality includes:

1. **Growth Plan Management** - Create, update, and track department growth plans
2. **Activity Logging** - Log and retrieve user activities
3. **Hiring Goal Archiving** - Archive expired hiring goals with improved error handling
4. **Strategic Priorities** - Track and align hiring goals with company strategic priorities

## Troubleshooting

If you encounter any issues while running the scripts:

1. **Database Connection Issues**
   - Check that your database is running
   - Verify your database connection settings in .env

2. **Missing Dependencies**
   - Run `npm install` to ensure all dependencies are installed

3. **Schema Issues**
   - If schema-related errors occur, try running the migration script again
   - For persistent issues, check the Prisma schema file for errors

## Running in Production

Before deploying to production:

1. Always test the migration in a staging environment first
2. Back up your production database before applying migrations
3. Consider using Prisma's deployment guides for production migrations 