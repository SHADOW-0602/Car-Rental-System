# Admin Setup Guide

## Secure Admin Configuration

**No hardcoded credentials are present in the codebase.** All admin credentials are managed through environment variables for security.

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your admin credentials in `backend/.env`:
   ```env
   # Admin Configuration
   ADMIN_NAME=Your Admin Name
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_SECRET_KEY=YOUR_UNIQUE_SECRET_KEY_2024
   ```

## Automatic Setup

The system will automatically create the admin account when the server starts if:
- Environment variables are properly configured
- No admin account exists in the database

## Manual Setup (Alternative)

If environment variables are not set, you can create an admin manually:

1. Check if setup is required:
   ```bash
   GET /api/setup/check
   ```

2. Create admin (only works if no admin exists):
   ```bash
   POST /api/setup/admin
   {
     "name": "Admin Name",
     "email": "admin@domain.com", 
     "password": "SecurePassword123!",
     "secretKey": "UniqueSecretKey2024"
   }
   ```

## Security Features

- **No hardcoded credentials** in source code
- **Environment-based configuration** for production security
- **Automatic admin creation** on first startup
- **Password strength validation** (minimum 8 characters)
- **Unique email enforcement** across all user types
- **Bcrypt hashing** for all passwords and secret keys
- **Emergency reset capability** with special token

## Login Process

1. Use the email and password from your environment variables
2. System will detect admin credentials and prompt for secret key
3. Enter the secret key from your environment variables
4. Complete admin login

## Emergency Admin Reset

If you need to reset admin credentials:

1. Set `ADMIN_RESET_TOKEN` in environment variables
2. Use the reset endpoint:
   ```bash
   POST /api/setup/reset-admin
   {
     "resetToken": "your_reset_token",
     "newAdminData": {
       "name": "New Admin",
       "email": "newadmin@domain.com",
       "password": "NewPassword123!",
       "secretKey": "NewSecretKey2024"
     }
   }
   ```

## Production Deployment

1. **Never commit** `.env` files to version control
2. **Set environment variables** in your deployment platform
3. **Use strong passwords** and unique secret keys
4. **Rotate credentials** regularly
5. **Monitor admin access** logs

## Test Data (Development Only)

For development environments, you can enable test data creation:

```env
CREATE_TEST_DATA=true
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=testpass123
TEST_DRIVER_EMAIL=testdriver@example.com
TEST_DRIVER_PASSWORD=driverpass123
```

## File Locations

- Setup service: `backend/services/setupService.js`
- Admin setup controller: `backend/controllers/adminSetupController.js`
- Setup routes: `backend/routes/setupRoutes.js`
- Environment example: `backend/.env.example`