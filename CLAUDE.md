# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `npm start` - Start development server with core Paragon theme
- `npm run start:with-theme` - Start development server with @edx/brand-edx.org theme  
- `npm run start:stage` - Start development server with staging configuration
- `npm run build` - Build for production
- `npm run build:with-theme` - Build with theme installation

### Testing
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run test:watch-no-cov` - Run tests in watch mode without coverage
- `npm run test -- ComponentName.test.jsx` - Run specific test file
- `npm run snapshot` - Update Jest snapshots

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run check-types` - TypeScript type checking
- `npm run check-types:watch` - TypeScript type checking in watch mode

## Architecture Overview

### Technology Stack
- **React 18** with Redux for state management
- **@tanstack/react-query** for data fetching and client-side caching (preferred for new API integrations)
- **Redux with redux-thunk** for legacy state management
- **@openedx/paragon** for UI components and styling
- **React Router 6** for routing
- **TypeScript** migration in progress (see TypeScript Guidelines below)

### Key Directories
- `src/components/` - React components organized by feature
- `src/containers/` - Redux-connected container components (legacy pattern)
- `src/data/` - Redux actions, reducers, and API services
- `src/config/` - Application configuration and feature flags
- `docs/decisions/` - Architecture Decision Records (ADRs)

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
- **Feature-based organization**: Components grouped by business domain (e.g., learner-credit-management, subscriptions)
- **Context providers**: Used for feature-specific state (e.g., EnterpriseAppContextProvider)

### Styling
- SCSS with Paragon design system
- Brand customization through BrandStyles component
- Responsive design using Paragon's MediaQuery components

### Testing
- Jest with React Testing Library
- Coverage reporting enabled by default
- Snapshot testing for component rendering
- Tests should be co-located with components in `tests/` subdirectories

### Key Configuration
- Feature flags in `src/config/index.js` control functionality
- Environment-based configuration for different deployment targets
- Enterprise customer data drives application behavior and permissions
