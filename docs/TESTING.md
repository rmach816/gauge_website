# Testing Documentation

## Overview

The GAUGE app uses Jest for unit testing and React Native Testing Library for component testing.

## Setup

### Installation

Testing dependencies are included in `package.json`:
- `jest` - Testing framework
- `@types/jest` - TypeScript types for Jest
- `react-test-renderer` - React component testing
- `jest-transform-stub` - Asset mocking

### Configuration

- **Jest Config**: `jest.config.js`
- **Jest Setup**: `jest.setup.js` (mocks and global setup)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
  services/
    __tests__/
      storage.test.ts
      closet.test.ts
  utils/
    __tests__/
      debounce.test.ts
      retry.test.ts
```

## Current Test Coverage

### Unit Tests ✅

1. **StorageService** (`src/services/__tests__/storage.test.ts`)
   - User profile save/retrieve
   - Closet items save/retrieve
   - Onboarding state management

2. **ClosetService** (`src/services/__tests__/closet.test.ts`)
   - Get closet items
   - Add items
   - Remove items
   - Search items

3. **Utility Functions**
   - `debounce.test.ts` - Debounce function testing
   - `retry.test.ts` - Retry with backoff testing

## Mocking

### AsyncStorage
- Mocked via `@react-native-async-storage/async-storage/jest/async-storage-mock`

### Expo Modules
- `expo-constants` - Mocked
- `expo-file-system` - Mocked
- `expo-image-picker` - Mocked

### React Native
- Animated helpers mocked
- Console warnings/errors silenced in tests

## Writing Tests

### Service Tests

```typescript
import { StorageService } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save and retrieve data', async () => {
    // Test implementation
  });
});
```

### Utility Tests

```typescript
import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should delay function execution', () => {
    // Test implementation
  });
});
```

## Future Test Coverage

### Pending Unit Tests
- [ ] ChatService methods
- [ ] ClaudeVisionService (mocked API calls)
- [ ] PremiumService
- [ ] HistoryService
- [ ] Custom hooks (useWardrobe, useChat, useOutfit)

### Integration Tests
- [ ] Onboarding flow
- [ ] Outfit generation flow
- [ ] Wardrobe management flow
- [ ] Chat flow

### E2E Tests
- [ ] Critical user journeys
- [ ] Premium gating
- [ ] Error scenarios

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies (AsyncStorage, APIs)
3. **Cleanup**: Use `beforeEach`/`afterEach` for setup/teardown
4. **Naming**: Use descriptive test names
5. **Coverage**: Aim for >80% code coverage

## Coverage Reports

Run `npm run test:coverage` to generate coverage reports in the `coverage/` directory.

---

**Note**: Install dependencies with `npm install` before running tests for the first time.

