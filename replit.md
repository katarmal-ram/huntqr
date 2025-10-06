# QR Risk Hunt

## Overview

QR Risk Hunt is a real-time, session-based educational game designed for MBA students to learn risk management and greed psychology. Students form teams and scan QR codes (or enter short codes manually) to receive random point values. The game uses a "Jackpot + Baiting" algorithm that deliberately tempts players with streaks and near-misses, creating an educational simulation of how greed and risk-taking affect decision-making outcomes.

The application supports two primary roles: Admin users who create and manage game sessions, and Player users who join teams and participate in scanning codes. All game data updates in real-time using WebSocket connections, providing instant feedback on scores and leaderboard changes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- File-based organization with clear separation between pages, components, and utilities

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Custom theming supporting both light and dark modes
- Design approach combines gamification elements (inspired by Kahoot) with clean productivity interface (inspired by Linear)

**State Management**
- TanStack Query (React Query) for server state management and caching
- Session-based authentication using Express sessions
- WebSocket connections for real-time updates across all clients
- Local component state for UI interactions

**Key Design Patterns**
- Component composition with separation of concerns (UI components vs. business logic)
- Custom hooks for reusable logic (useWebSocket, useToast, useMobile)
- Type-safe API requests with shared TypeScript schemas between frontend and backend

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- WebSocket (ws library) for real-time bidirectional communication
- Session middleware for player authentication
- Node.js with ES modules

**Game Logic Implementation**
- Jackpot + Baiting algorithm implemented server-side only to prevent client manipulation
- Algorithm generates random scores between -10 and +30 with weighted probabilities:
  - 70% "baiting bias" with small positives/negatives to encourage continued play
  - 5% jackpot trigger (15-30 points) that resets accumulated pool
  - 25% loss correction (-10 to -6) to demonstrate volatility
- Session-specific jackpot pools maintained in memory (Map structure)
- Random seeds stored for replay capability

**API Design**
- RESTful endpoints for session management, code management, and player actions
- Admin-only routes for session control and analytics
- WebSocket broadcast system notifies all clients of state changes (session started/ended, player joined, code scanned)
- Consistent error handling and response formatting

### Data Storage

**Database Technology**
- PostgreSQL database (via Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with validation using Zod

**Database Schema**
- **sessions**: Game session metadata (name, status, timer, jackpot pool)
- **codes**: QR code strings with usage tracking per session
- **teams**: Team information with point totals and color assignments
- **players**: User records linked to teams and sessions
- **scans**: Historical record of all code scans with points and metadata

**Data Access Layer**
- Storage abstraction interface (IStorage) for database operations
- Drizzle relations for efficient joins and queries
- Cascade deletion ensures cleanup when sessions end

### External Dependencies

**Real-time Communication**
- WebSocket (ws library) for server-side WebSocket implementation
- Client automatically reconnects on connection loss
- Message broadcasting to all connected clients filtered by session ID

**Authentication & Sessions**
- Express-session for session management
- Session stored in memory (could be extended to PostgreSQL with connect-pg-simple)
- Player identification via session-based playerId

**UI Libraries**
- Radix UI for accessible, unstyled component primitives
- Recharts for analytics visualization (line charts, team performance)
- html5-qrcode for camera-based QR code scanning
- Embla Carousel for touch-friendly carousels
- Lucide React for consistent iconography

**Development Tools**
- TypeScript for type safety across full stack
- Vite plugins for Replit integration (error overlay, cartographer, dev banner)
- Drizzle Kit for database migrations
- ESBuild for production server bundling

**Hosting & Deployment**
- Designed for Replit deployment
- Environment variables for database connection (DATABASE_URL) and session secrets
- Production build uses bundled server with static asset serving
- WebSocket URL dynamically determined based on protocol (ws/wss)