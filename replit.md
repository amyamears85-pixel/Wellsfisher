# Wells Fargo - Online Banking Login Page

## Overview
A professional banking-style login page with a clean, authentic design similar to the Wells Fargo banking website. Features a fully functional authentication system with form validation and user-friendly error handling.

## Test Credentials
- **Username:** demo
- **Password:** demo123

## Project Architecture

### Frontend (client/)
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Forms:** react-hook-form with zod validation
- **State:** TanStack React Query for server state

### Backend (server/)
- **Framework:** Express.js
- **Storage:** In-memory storage (MemStorage)
- **Validation:** Zod schemas

### Key Files
- `client/src/pages/login.tsx` - Main login page component
- `client/src/index.css` - Design tokens and color scheme
- `server/routes.ts` - Authentication API endpoints
- `server/storage.ts` - User storage with seeded demo user

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
Creates a new user account.

## Design System
- **Primary Color:** Dark red (355 85% 40%)
- **Accent Color:** Yellow/Gold (45 95% 50%)
- **Font:** Inter sans-serif
- **Style:** Professional banking aesthetic with clean layouts

## Recent Changes
- January 2024: Initial implementation of banking login page
- Added responsive header with mobile navigation
- Implemented login form with validation
- Created backend authentication with demo user
- Added comprehensive footer with links
