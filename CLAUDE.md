# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a NestJS backend application for a recruitment management system. It includes candidate management, vacancy tracking, company management, and user authentication with JWT-based auth.

## Development Commands

### Setup and Installation
```bash
npm install
docker compose up --build  # First time setup with database
```

### Development
```bash
npm run start:dev          # Development server with hot reload
npm run start:debug        # Debug mode with hot reload
npm run start              # Production start
```

### Database Operations
```bash
npm run db:generate        # Generate Drizzle migrations
npm run db:migrate         # Run database migrations
```

### Code Quality and Testing
```bash
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
npm run ci:test            # Run tests in CI mode
```

### Build and Deployment
```bash
npm run build              # Build for production
npm run start:prod         # Start production build
```

## Architecture

### Core Structure
- **Database Layer**: Uses Drizzle ORM with PostgreSQL
- **Authentication**: JWT-based auth with Passport.js (local + JWT strategies)
- **Authorization**: Role-based access control with guards
- **API Documentation**: Swagger/OpenAPI at `/docs` endpoint
- **Global Features**: CORS, Helmet security, global validation pipes

### Key Directories
- `src/common/database/schemas/` - Drizzle database schemas
- `src/auth/` - Authentication and authorization logic
- `src/*/` - Feature modules (candidate, vacancy, company, etc.)
- `drizzle/` - Database migration files

### Module Pattern
Each feature follows NestJS module pattern:
- `*.module.ts` - Module definition with imports/exports
- `*.controller.ts` - HTTP endpoints and routing
- `*.service.ts` - Business logic and database operations
- `*.dto.ts` - Data transfer objects for validation

### Database Schema
The application manages:
- **Users** with role-based permissions
- **Candidates** with files, sources, and status tracking
- **Vacancies** with filtering and status management
- **Companies** with industry and area classifications
- **Comments** and **Blacklist** functionality

### Authentication Flow
- Global JWT guard protects all routes by default
- Login endpoint (`/auth/login`) returns JWT token
- User roles control access via `@Roles()` decorator
- Current user context available via `nestjs-cls`

### API Structure
All endpoints prefixed with `/api/v1/`
Swagger documentation available at `/docs`

## Configuration
- Environment variables loaded via `@nestjs/config`
- Database URL configured via `DATABASE_URL` env var
- JWT configuration in auth module
- Docker compose for local development with PostgreSQL