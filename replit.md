# MusicFlow - Music Streaming Application

## Overview

MusicFlow is a full-stack music streaming application built with a modern web architecture. It provides users with the ability to search for music, create playlists, manage favorites, and stream audio content using the Jamendo API. The application features a Spotify-inspired dark theme interface with comprehensive music player controls including shuffle, repeat, volume management, and playlist functionality.

## Recent Changes (January 19, 2025)

✓ Built complete Spotify-like music streaming application
✓ Implemented Jamendo API integration for free music streaming
✓ Created all core features: search, trending, favorites, playlists
✓ Designed responsive dark theme matching Spotify's aesthetic
✓ Added comprehensive error handling for API issues
✓ Integrated audio player with full controls and queue management
✓ User needs to update JAMENDO_CLIENT_ID secret to: 6853ac8d (from their developer dashboard)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Audio Management**: Custom audio player hook with HTML5 Audio API for music playback

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Development**: Hot module replacement with Vite integration in development mode
- **API Design**: RESTful API endpoints for playlists, favorites, and user management
- **Data Validation**: Zod schemas for runtime type validation and API request validation

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Schema Management**: Drizzle migrations for database version control
- **In-Memory Fallback**: MemStorage class for development and testing scenarios
- **Session Storage**: PostgreSQL sessions with connect-pg-simple for user persistence

### Authentication and Authorization
- **User Management**: Custom user system with username/password authentication
- **Session Handling**: Express sessions stored in PostgreSQL
- **User Identification**: Local storage for user ID persistence on client-side

### External Service Integrations
- **Music API**: Jamendo API integration for music catalog, search, and trending tracks
- **Audio Streaming**: Direct audio URL streaming from Jamendo's CDN
- **Image Assets**: Album artwork and artist images served from Jamendo's media servers

### Key Architectural Decisions

**Monolithic Deployment**: Single codebase with client and server in the same repository for simplified development and deployment, suitable for the application's current scale.

**Type-Safe Data Layer**: Drizzle ORM chosen over Prisma for better TypeScript integration and lighter bundle size, with shared schema definitions between client and server.

**Component-Based UI**: shadcn/ui provides pre-built, customizable components reducing development time while maintaining design consistency.

**Optimistic Updates**: TanStack Query enables optimistic updates for better user experience when adding favorites or creating playlists.

**Custom Audio Management**: Built-in HTML5 Audio API wrapper provides precise control over playback features without external dependencies.

**Responsive Design**: Mobile-first approach with Tailwind's responsive utilities ensuring cross-device compatibility.