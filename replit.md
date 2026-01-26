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
- `client/src/index.css` - Design tokens and color scheme
- `server/routes.ts` - Authentication API endpoints
- `server/storage.ts` - Database storage with bcrypt hashing
- `server/db.ts` - PostgreSQL/Drizzle connection
- `shared/schema.ts` - Database schema definitions

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
  "phone": "string (optional)"
}
```

### GET /api/auth/me
Returns current authenticated user.

### POST /api/auth/logout
Destroys session and logs out user.

## Design System
- **Primary Color:** Dark red (355 85% 40%)
- **Accent Color:** Yellow/Gold (45 95% 50%)
- **Font:** Inter sans-serif
- **Style:** Professional banking aesthetic with clean layouts

## User Flow
1. **Login** (/) - Enter credentials or click "Enroll Now"
2. **Register** (/register) - Create new account with username, email, password
3. **Verification** (/verify) - Choose SMS/call/email verification method (protected)
4. **Dashboard** (/dashboard) - View accounts and balances (protected)
5. **Forgot Password** (/forgot-password) - Recover username or reset password

## Recent Changes
- January 2026: Added real PostgreSQL database storage
- Added bcrypt password hashing for security
- Added session management with express-session
- Added user registration page
- Added authentication guards to protected pages
- Verification page now shows actual user email/phone
- Added forgot password flow with username/password recovery options
- Added verification page with SMS/call/email verification methods
- Added dashboard with account balances and quick actions
- Updated fonts to Open Sans and colors to match Wells Fargo exactly (#d71e28 red, #ffcd41 yellow)
- Added yellow accent bar across all pages for consistency
