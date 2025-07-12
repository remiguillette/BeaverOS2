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
- January 07, 2025. Implemented BeaverPaws Animal Controls system at /BeaverPaws route:
  - Added comprehensive animal registration database schema (animals, enforcement_reports tables)
  - Built full-featured animal registration form with owner information and health tracking
  - Created enforcement report system for municipal tickets and violations
  - Implemented tabbed interface with Registry, Enforcement, Laws, and First Aid sections
  - Added search and filtering capabilities for animals and reports
  - Complete API backend for animal and enforcement report CRUD operations
  - Updated dashboard navigation to include BeaverPaws with "Click to Open" functionality
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
- January 07, 2025. Implemented BeaverDoc Legal Document Traceability System at /BeaverDoc route:
  - Added comprehensive legal document traceability system with PDF processing capabilities
  - Built tabbed interface with Documents, Upload, Security, and Audit Log sections
  - Implemented secure document features including unique identifiers (UID), traceability tokens, and SHA-256 hashing
  - Created document library with sample documents showing security metadata and status tracking
  - Added PDF upload functionality with file selection and processing workflow
  - Implemented security features display with cryptographic fingerprints and metadata enrichment
  - Created audit log system for complete document action traceability
  - Updated dashboard navigation to include functional BeaverDoc link
  - System designed for legal compliance with embedded security identifiers and timestamps
- January 07, 2025. Implemented BeaverPay Payment Management System at /BeaverPay route:
  - Added comprehensive payment management database schema (invoices, payments, pos_transactions tables)
  - Built full-featured payment dashboard with statistics cards and recent activity overview
  - Created invoice management system with creation, tracking, and status monitoring
  - Implemented payment processing interface with PayPal and Google Pay integration placeholders
  - Added POS (Point of Sale) system for retail transactions with receipt generation
  - Built tabbed interface with Dashboard, Invoices, Payments, and POS Sales sections
  - Added search and filtering capabilities across all payment-related data
  - Implemented comprehensive form validation for invoice and POS transaction creation
  - Added sample payment data including invoices, payments, and POS transactions
  - Complete API backend for invoice, payment, and POS transaction CRUD operations
  - Updated dashboard navigation to include functional BeaverPay link
  - System ready for PayPal and Google Pay API integration with proper data models
- January 07, 2025. Implemented BeaverRisk Risk Assessment and Strategic Planning System at /BeaverRisk route:
  - Added comprehensive risk management database schema (risk_locations, risk_assessments, mitigation_plans, risk_events tables)
  - Built full-featured risk assessment interface with dynamic risk matrix calculation and color-coded risk levels
  - Created interactive risk mapping module with geographic risk location management
  - Implemented comprehensive risk assessment forms with severity, probability, and impact scoring (1-5 scale)
  - Added mitigation plan management with status tracking, timeline management, and cost estimation
  - Built risk event tracking system for incidents, drills, exercises, and historical analysis
  - Created tabbed interface with Risk Mapping, Assessment, Mitigation Plans, and Events sections
  - Implemented search and filtering capabilities across risk types (fire, flood, hazmat, etc.)
  - Added comprehensive sample data including critical infrastructure locations and assessment scenarios
  - Built statistics dashboard with real-time risk metrics and active plan monitoring
  - Complete API backend for all risk management CRUD operations with proper validation
  - Updated dashboard navigation to include functional BeaverRisk link on port 5008
  - System designed for civil protection strategic planning with automatic risk level calculation
- January 08, 2025. Renamed BeaverLaw to BeaverPaws:
  - Updated service name from "BeaverLaw" to "BeaverPaws" in dashboard services
  - Changed route from "/BeaverLaw" to "/BeaverPaws"
  - Updated page title and service header to reflect new name
  - Renamed beaverlaw.tsx to beaverpaws.tsx
  - Updated all navigation references to use new route
- January 08, 2025. Implemented BeaverAudit Public Safety Audit & Compliance System at /BeaverAudit route:
  - Added comprehensive audit management database schema (audit_schedules, audit_templates, audit_reports, audit_non_compliances, audit_evidence tables)
  - Built full-featured audit scheduling system with recurring and one-time audit types
  - Created dynamic audit grid templates based on facility type, mission type, and standards framework
  - Implemented comprehensive audit reporting with digital signatures and compliance scoring
  - Added non-compliance tracking with severity levels, corrective actions, and assignment management
  - Built evidence and documentation system for photos, videos, and files with GPS/timestamp metadata
  - Created tabbed interface with Scheduling, Audit Grids, Evidence, Non-Compliance, and Reports sections
  - Implemented standards framework integration (OHS, PSC, PAWS, Municipal Laws, CSA)
  - Added comprehensive sample data including scheduled audits, templates, reports, and non-compliance issues
  - Built statistics dashboard with audit metrics, compliance tracking, and critical issue monitoring
  - Complete API backend for all audit management CRUD operations with proper validation
  - Updated dashboard navigation to include functional BeaverAudit link on port 5009
  - System designed for public safety compliance verification with customizable audit templates and automated reporting
- July 11, 2025. Enhanced Dashboard Header with Animated UI Elements:
  - Redesigned dashboard header with premium animated gradient border buttons
  - Added animated BEAVERNET logo with staged text animations (BEAVER, NET, System)
  - Implemented rotating gradient border effects on Language, Profile, and Logout buttons
  - Added smooth hover effects with translateY and shadow animations
  - Enhanced responsive design with proper mobile/tablet/desktop scaling
  - Added language toggle functionality (EN/FR) with animated button
  - Integrated Profile button with User icon for better UX
  - Maintained BEAVERNET branding with blue/orange color scheme
  - Added welcome message displaying current user's name
  - Implemented CSS keyframe animations for logo staging effects
- July 11, 2025. Cleaned Up Service Page Headers:
  - Removed decorative title sections from all BeaverNET service pages
  - Removed icon sections from BeaverPatch, BeaverPaws, BeaverCRM, BeaverDoc, BeaverPay, BeaverRisk, and BeaverAudit
  - Maintained functional elements (action buttons, status badges) while simplifying interfaces
  - Created cleaner, more professional look across all service pages
  - All pages now have consistent header styling through EnhancedHeader component only
- July 11, 2025. Implemented Complete Translation System:
  - Created comprehensive translation hook (useTranslation) with Zustand state management
  - Added English and French translations for all UI elements including header, dashboard, services, and common terms
  - Implemented persistent language preferences with localStorage integration
  - Updated EnhancedHeader component to use translations for welcome message, profile, logout, and language toggle
  - Updated Dashboard component to use dynamic translated service descriptions and page titles
  - Updated ServiceCard component to show translated "Click to Open" text
  - Language toggle button now properly switches all content between EN/FR
  - Translation system covers header navigation, service descriptions, common interface elements, and user messages
  - All text content now dynamically updates when language is changed via the header toggle button
- July 11, 2025. Implemented Role-Based Access Control System:
  - Added accessLevel field to users schema with levels: SuperAdmin, Admin, IT Web Support, 911 Supervisor, 911 Dispatcher, User
  - Updated authentication system to include access level in user object and session management
  - Created AccessProtectedRoute component for page-level access control with proper error handling
  - Implemented BeaverPatch access restriction requiring one of: SuperAdmin, Admin, IT Web Support, 911 Supervisor, 911 Dispatcher
  - Added API endpoint (/api/auth/check-access/:page) for dynamic access level verification
  - Updated current user (remiguillette) to SuperAdmin level to maintain system access
  - Created comprehensive access denied interface with user-friendly error messages and navigation
  - System ready for additional protected pages with configurable access requirements
- July 11, 2025. Implemented 911 Dispatcher PIN/Chip Card Authentication System:
  - Added employeePin and chipCardId fields to users schema for enhanced security
  - Created comprehensive DispatcherAuthModal component with tabbed PIN/chip card authentication
  - Implemented PIN verification system with 4-digit employee PIN validation
  - Added chip card scanner simulation with real-time scanning animation
  - Built call entry logging system (callEntryLogs table) to track all authentication attempts
  - Created API endpoints for PIN verification, chip card verification, and call logging
  - Added session tracking with unique session IDs for audit trails
  - Implemented dispatcher-specific authentication flow for BeaverPatch access
  - Added sample dispatcher user (dispatcher1/911dispatch) with PIN 5678 and chip card CARD-002-SJ
  - Enhanced login page with quick test buttons for switching between SuperAdmin and 911 Dispatcher accounts
  - System logs all authentication attempts including IP address, user agent, and authentication method
  - Call entry logs track call taker identity, session information, and incident association
- July 12, 2025. Implemented BeaverTalk Secure Communication API System:
  - Added comprehensive chat database schema (chatSessions, chatMessages, chatSecurityLogs tables)
  - Built full-featured BeaverTalk service page with modern chat interface and real-time messaging
  - Implemented secure API endpoints with content filtering and validation to prevent malicious code injection
  - Added complete storage methods for chat operations (create sessions, send messages, retrieve history)
  - Created comprehensive security system with automatic threat detection and scoring (0-100 scale)
  - Built audit logging system for complete conversation and security event tracking
  - Designed system for external client site integration rather than internal BEAVERNET overlay
  - Created complete API integration documentation (BEAVERTALK_API_INTEGRATION.md) with:
    - Full REST API documentation for sessions, messages, and security monitoring
    - JavaScript and React integration examples for client sites like rgra.ca
    - Security features including content filtering, threat assessment, and session management
    - Authentication using HTTP Basic Auth with existing BEAVERNET credentials
    - Rate limiting, error handling, and best practices for secure implementation
  - Updated dashboard navigation to include functional BeaverTalk link on port 5007
  - System designed for secure external integration with comprehensive threat protection
- July 12, 2025. Prepared Application for Production Deployment:
  - Removed all development test tools and credentials from login page
  - Removed sample data displays and test authentication buttons
  - Configured PostgreSQL database with proper schema migrations
  - Created production-ready user accounts (admin/admin123, dispatcher/dispatch911)
  - Verified PayPal integration placeholders are properly configured for production
  - Built application with optimized static assets and server bundle
  - Updated deployment configuration for Replit autoscale deployment
  - Application ready for production deployment with clean interface and secure authentication
- July 12, 2025. Verified BeaverTalk API Production Readiness:
  - Tested all BeaverTalk API endpoints locally - all working correctly
  - Added dedicated health check endpoint (/api/chat/health) for external monitoring
  - Confirmed security features including authentication, content filtering, and threat detection
  - Verified database integration with PostgreSQL and proper schema validation
  - Created comprehensive test documentation (BEAVERTALK_API_TEST_RESULTS.md)
  - Created production deployment guide (PRODUCTION_DEPLOYMENT_GUIDE.md)
  - Identified that external server (rgbeavernet.ca) needs BeaverTalk API deployment
  - System ready for production deployment with all endpoints functional
- July 12, 2025. Fixed BeaverTalk Real-time Message Display Issue:
  - Diagnosed issue where external client messages weren't appearing in BeaverTalk dashboard
  - Problem was caching preventing real-time updates from external API calls
  - Added automatic refresh intervals (sessions: 5s, messages: 3s, security logs: 10s)
  - Disabled caching on chat sessions and messages queries (cacheTime: 0, staleTime: 0)
  - Added automatic session selection for new external conversations
  - Enhanced session display to show department (External Client) and creation timestamps
  - BeaverTalk now displays messages from external client sites in real-time
  - Successfully tested with multiple external client scenarios from RGRA.ca

## User Preferences

Preferred communication style: Simple, everyday language.