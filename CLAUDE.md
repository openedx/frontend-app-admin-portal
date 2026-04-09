# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

frontend-app-admin-portal is a React-based micro-frontend within the Open edX ecosystem that provides
branded learning experiences and a comprehensive dashboard for enterprise learning administrators. It
enables enterprise admins to manage learners, track analytics, allocate budgets, assign content, and
configure organizational settings.

## Key Principles

- Search the codebase before assuming something isn't implemented
- Write comprehensive tests for new components using React Testing Library
- Follow existing code patterns and component structure
- Use Paragon components and utility classes from `@openedx/paragon` - invoke `/paragon` for guidance
- Keep changes focused and minimal
- Prefer `@tanstack/react-query` for new API integrations over Redux patterns
- Follow TypeScript migration guidelines when adding new code

## Documentation & Institutional Memory

- Document new functionality in `docs/` (see `docs/decisions/` for ADRs)
- When you learn something important about how this codebase works (gotchas, non-obvious
  patterns, integration quirks), capture it in the appropriate docs
- These docs are institutional memory - future sessions (yours or others) will benefit
  from what you record here
- See `docs/developing-with-ai.md` for AI-assisted development best practices

## Development Commands

### Building and Running
- Assume the development node server is running and responds to code changes
- Prefer to use the devstack `make dev.up.frontend-app-admin-portal` to launch this application if necessary
- `nvm install && nvm use` to ensure correct Node version is installed if running locally (outside of devstack)

### Testing
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run test:watch-no-cov` - Run tests in watch mode without coverage
- `npm run test -- ComponentName.test.jsx` - Run specific test file
- `npm run snapshot` - Update Jest snapshots
- Test loading, success, and error states related to data loading

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run check-types` - TypeScript type checking
- `npm run check-types:watch` - TypeScript type checking in watch mode
- Include accessibility-focused assertions and manual review in component testing,
  and only use automated a11y tooling (such as `axe-core`) when it is explicitly configured in the codebase

## Architecture Overview

frontend-app-admin-portal is a comprehensive enterprise administration dashboard that integrates with
multiple Open edX backend services to provide a unified interface for enterprise learning management.

### Technology Stack
- **React 18** with Redux for state management
- **@tanstack/react-query** for data fetching and client-side caching (preferred for new API integrations)
- **Redux with redux-thunk** for legacy state management
- **@openedx/paragon** for UI components and styling
- **React Router 6** for routing
- **TypeScript** migration in progress (see TypeScript Guidelines below)
- **Stripe Elements** for payment processing integration

### Key Directories
- `src/components/` - React components organized by feature (learner-credit-management, subscriptions, billing, etc.)
- `src/containers/` - Redux-connected container components (legacy pattern)
- `src/data/` - Redux actions, reducers, and API services
  - `src/data/services/` - API client classes for backend integrations
- `src/config/` - Application configuration and feature flags
- `docs/decisions/` - Architecture Decision Records (ADRs)
- `docs/references/` - Feature-specific documentation

### Data Fetching Strategy
**Preferred**: Use `@tanstack/react-query` for new API integrations
- Provides automatic caching, retries, and loading states
- Use query key factories for organized cache management
- Default `staleTime` is 20 seconds to prevent unnecessary refetches

**Legacy**: Redux with custom API service classes in `src/data/services/`
- Gradually migrate to react-query when touching existing API calls

### TypeScript Migration Guidelines
**High Priority** (prefer TypeScript):
- API methods and service classes
- React hooks and context providers
- Utility libraries

**Medium Priority** (TypeScript when helpful):
- React components (PropTypes still acceptable)

**Low Priority** (JavaScript acceptable):
- Unit tests

### Component Architecture
- **EnterpriseApp**: Main application shell with sidebar and routing
- **Feature-based organization**: Components grouped by business domain:
  - `learner-credit-management/` - Budget allocation and learner credit management
  - `subscriptions/` - Subscription plan management
  - `billing/` - Stripe integration for payment processing
  - `PeopleManagement/` - Learner and admin management, groups
  - `ContentHighlights/` - Featured content curation
  - `AdvanceAnalyticsV2/` - Analytics dashboards and reporting
- **Context providers**: Used for feature-specific state (e.g., EnterpriseAppContextProvider, EnterpriseSubsidiesContext)

### Key Concepts

- **Enterprise Customers**: Organizations that purchase and manage learning for their members
- **Learner Credit Management**: Budget-based system for allocating learning funds to learners
- **Subscriptions**: Plan-based access to content catalogs
- **Content Assignments**: Admin-driven assignment of specific courses to learners
- **People Management**: User administration including learners, admins, and groups
- **Analytics**: Comprehensive reporting on enrollments, completions, and engagement
- **Content Highlights**: Curated content collections to feature specific learning paths

### External Service Integration

The admin portal integrates with several Open edX backend services:
- **enterprise-access**: Policy and assignment management
- **enterprise-catalog**: Content metadata and discovery
- **enterprise-subsidy**: Subsidy and transaction management
- **license-manager**: License-based access control
- **LMS**: User authentication and course enrollment
- **edx-analytics-data-api**: Learning analytics and reporting data
- **Stripe**: Payment processing for self-service purchases

### Styling
- SCSS with Paragon design system
- Brand customization through BrandStyles component
- Responsive design using Paragon's MediaQuery components

### Testing
- Jest with React Testing Library
- Coverage reporting enabled by default
- Snapshot testing for component rendering
- Tests should be co-located with components in `tests/` subdirectories
- Mock utilities available in `__mocks__/` directory

### Local Development
- Requires devstack (LMS, enterprise services) running locally
- `STRIPE_PUBLISHABLE_KEY` must be set in `.env.development` for local testing of billing features

### Key Configuration
- Feature flags in `src/config/index.js` control functionality
- Environment-based configuration for different deployment targets
- Enterprise customer data drives application behavior and permissions
