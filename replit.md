# BEAVERNET System

## Overview

BEAVERNET is a full-stack web application built with a modern tech stack featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM. The application appears to be a service management dashboard with multiple integrated services like BeaverPatch (CAD system), BeaverLaw (Animal Controls), BeaverCRM (Customer Management), and others.

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
- Services include: BeaverPatch, BeaverLaw, BeaverCRM, BeaverDoc, BeaverPay, BeaverMonitor, BeaverDMV

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
- January 07, 2025. Implemented comprehensive Frontline Dispatch Interface for BeaverPatch:
  - Added incident management data models (incidents, units, incident_units tables)
  - Built full-featured incident entry form with geolocation support
  - Created interactive dispatch map with real-time unit and incident visualization
  - Implemented unit assignment system with drag-and-drop functionality
  - Added filtering and search capabilities for incident dashboard
  - Real-time status tracking for emergency response units
  - Complete API backend for incident and unit CRUD operations
- January 07, 2025. Implemented BeaverLaw Animal Controls system at /BeaverLaw route:
  - Added comprehensive animal registration database schema (animals, enforcement_reports tables)
  - Built full-featured animal registration form with owner information and health tracking
  - Created enforcement report system for municipal tickets and violations
  - Implemented tabbed interface with Registry, Enforcement, Laws, and First Aid sections
  - Added search and filtering capabilities for animals and reports
  - Complete API backend for animal and enforcement report CRUD operations
  - Updated dashboard navigation to include BeaverLaw with "Click to Open" functionality
- January 07, 2025. Implemented BeaverCRM Customer Management system at /BeaverCRM route:
  - Added comprehensive customer database schema (customers table) with auto-generated customer IDs
  - Built full-featured customer registration form with complete identity, contact, and professional information
  - Created split-pane interface with customer directory and detailed customer view
  - Implemented comprehensive search functionality across all customer fields
  - Added tabbed detail view with Identity, Contact, Professional, and Notes sections
  - Real-time customer search and filtering capabilities
  - Complete customer CRUD operations with form validation
  - Sample customer data initialization with diverse customer profiles
  - Updated dashboard to replace BeavernetCRM with BeaverCRM on port 5002
- January 07, 2025. Removed BeaverScanner from dashboard:
  - Removed BeaverScanner service from dashboard services array
  - Updated documentation to reflect removal of license plate recognition service
  - Cleaned up service references in overview and service lists

## User Preferences

Preferred communication style: Simple, everyday language.