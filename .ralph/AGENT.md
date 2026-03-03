# Ralph Agent Configuration

## Test Instructions

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

## Run Instructions
Install dependencies and ensure correct node version is installed

`$ nvm use` # will install/setup node needed for this project. Install the specified version (nvm Will help you do that)
`$ npm i`   # will install deps

Then
```bash
# Start/run the project
npm start
```

## Notes
- Update this file when build process changes
- Add environment setup instructions as needed
- Include any pre-requisites or dependencies
- Line length: 120 characters
