# Stress Congress 2026

## Overview

Stress Congress 2026 is a production-level mobile event platform for a real medical conference scheduled for March 3, 2026. The application is built as a cross-platform React Native app using Expo, with a Node.js/Express backend. It serves two distinct user roles (attendees and staff) with role-based navigation and features, including QR code-based check-in, agenda management, speaker directory, and company partnerships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React Native with Expo SDK 54 targeting iOS, Android, and Web
- **Navigation**: React Navigation v7 with a hybrid structure:
  - Root stack navigator handles auth flow (Login vs Main)
  - Drawer navigator serves as primary navigation for authenticated users
  - Role-based menu items (attendee sees Home/Agenda/Speakers/QR Code, staff sees Dashboard/Scan QR/Search/Stats)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: StyleSheet API with a centralized theme system supporting light/dark modes
- **Key Libraries**:
  - expo-camera for QR scanning
  - expo-secure-store for token storage (native) / localStorage (web)
  - react-native-reanimated for animations
  - react-native-qrcode-svg for QR code generation

### Backend Architecture

- **Framework**: Express.js running on Node.js
- **Authentication**: JWT-based authentication with whitelist-only login (no public registration)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Session Flow**: Email lookup → password creation (first login) or password validation → JWT token issued

### Data Storage

- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Key Tables**:
  - `users` - attendees and staff with QR codes and check-in status
  - `sessions` - conference agenda items
  - `speakers` - speaker profiles
  - `companies` - partner company directory
  - `notifications` - announcements and alerts
  - `saved_sessions` - user bookmarks

### Authentication Flow

1. User enters email on login screen
2. Backend checks whitelist (users table)
3. If no password set → prompt to create password
4. If password exists → prompt to enter password
5. On success → JWT token stored in SecureStore/localStorage
6. Token included in Authorization header for all API requests

### Build and Deployment

- **Development**: Expo development server + Express server run concurrently
- **Production**: Expo static build outputs to `dist/`, Express serves both API and static assets
- **Scripts**:
  - `expo:dev` - Start Expo development server
  - `server:dev` - Start Express development server
  - `db:push` - Push schema changes to database

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### Authentication
- JWT tokens for session management (jsonwebtoken package)
- bcryptjs for password hashing

### Mobile/Native Features
- expo-camera - QR code scanning for staff check-in
- expo-secure-store - Secure credential storage on native platforms
- expo-haptics - Haptic feedback for interactions

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT signing secret (falls back to default in development)
- `EXPO_PUBLIC_DOMAIN` - API server domain for client requests
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` - Replit-specific CORS configuration