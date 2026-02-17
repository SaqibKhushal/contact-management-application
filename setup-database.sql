-- ============================================
-- Contact Management Application - Database Setup
-- ============================================

-- Step 1: Create the database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ContactManagementDB')
BEGIN
    CREATE DATABASE ContactManagementDB;
    PRINT 'Database ContactManagementDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database ContactManagementDB already exists.';
END
GO

-- Switch to the new database
USE ContactManagementDB;
GO

-- Step 2: Create SQL Server login (server-level)
-- This creates a login at the SQL Server instance level
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'contactapp_user')
BEGIN
    CREATE LOGIN contactapp_user WITH PASSWORD = 'Contact@123';
    PRINT 'Login contactapp_user created successfully.';
END
ELSE
BEGIN
    PRINT 'Login contactapp_user already exists.';
END
GO

-- Step 3: Create database user (database-level)
-- This creates a user in the ContactManagementDB database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'contactapp_user')
BEGIN
    CREATE USER contactapp_user FOR LOGIN contactapp_user;
    PRINT 'User contactapp_user created in ContactManagementDB.';
END
ELSE
BEGIN
    PRINT 'User contactapp_user already exists in ContactManagementDB.';
END
GO

-- Step 4: Grant permissions to the user
-- Grant db_owner role for full access (or use more restrictive roles in production)
ALTER ROLE db_owner ADD MEMBER contactapp_user;
PRINT 'Permissions granted to contactapp_user.';
GO

-- Verify the setup
PRINT '============================================';
PRINT 'Database setup completed!';
PRINT 'Database Name: ContactManagementDB';
PRINT 'Username: contactapp_user';
PRINT 'Password: Contact@123';
PRINT '============================================';
GO

-- Optional: Show existing tables (will be empty initially)
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
