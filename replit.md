# BEAVERNET System

## Overview

BEAVERNET is a full-stack web application built with a modern tech stack featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM. The application appears to be a service management dashboard with multiple integrated services like BeaverPatch (CAD system), BeaverLaw (Animal Controls), BeaverScanner (License plate recognition), and others.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Session-based authentication with custom auth context

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with tsx

### UI/UX Design System
- **Component Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Design System**: "New York" style variant from shadcn/ui
- **Color Scheme**: Dark theme with orange accent (#F59E0B - "beaver-orange")
- **Icons**: Lucide React icons

## Key Components

### Authentication System
- HTTP Basic Authentication implemented on backend
- Custom authentication hook (`useAuth`) with session storage
- Protected and public route components
- Login/logout functionality with credentials (remiguillette/MC44rg99qc@)
- Session persistence across browser refreshes
- All API requests include Basic Auth headers automatically

### Database Schema
- **Users Table**: Basic user management with username/password
- **Drizzle Configuration**: PostgreSQL dialect with migrations support
- **Type Safety**: Generated TypeScript types from database schema

### Service Management Dashboard
- Service card components for displaying different BEAVERNET services
- Each service has its own port configuration and icon representation
- Services include: BeaverPatch, BeaverLaw, BeaverScanner, BeavernetCRM, BeaverDoc, BeaverPay

### Storage Layer
- Interface-based storage design (`IStorage`) for modularity
- In-memory storage implementation for development
- Designed to be easily swapped with database-backed storage

## Data Flow

1. **Authentication Flow**: User logs in → Session created → Protected routes accessible
2. **Service Navigation**: Dashboard displays service cards → User clicks service → Navigation to service-specific functionality
3. **API Communication**: Frontend uses React Query → Express API routes → Storage layer → Database operations
4. **State Management**: Server state via React Query, local state via React hooks

## External Dependencies

### Production Dependencies
- **Database**: Neon Database (@neondatabase/serverless)
- **UI Components**: Comprehensive Radix UI component suite
- **Utilities**: date-fns for date handling, clsx for conditional styling
- **Development Tools**: Drizzle Kit for database migrations

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Vite Plugins**: Runtime error overlay and cartographer for development
- **Build Process**: ESBuild for server-side bundling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations managed via `db:push` command

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Storage**: PostgreSQL-backed session management
- **Static Assets**: Express serves built frontend assets in production

### Development vs Production
- **Development**: Vite dev server with HMR, tsx for server hot reload
- **Production**: Static file serving with Express, bundled server code

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Changed authentication from client-side to HTTP Basic Authentication on backend
- July 07, 2025. Added BeaverPatch dedicated page at /BeaverPatch route with CAD system interface

## User Preferences

Preferred communication style: Simple, everyday language.