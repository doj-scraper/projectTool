# Testing Framework Implementation

## Overview

This project uses **Vitest** as the primary testing framework with **React Testing Library** for component testing. This modern, fast testing stack is the recommended approach for Next.js 16+ applications with TypeScript.

## Why Vitest?

Based on current industry standards (2026):

- **Speed**: 2-3x faster than Jest with parallel test execution by default
- **Vite-native**: Shares config with Vite/Next.js, reducing configuration overhead  
- **ESM-first**: Native ES Module support without additional configuration
- **TypeScript**: First-class TypeScript support with instant type checking
- **Next.js official support**: Recommended by Next.js team for unit testing

## Installed Dependencies

### Core Testing Framework
```bash
vitest@4.1.2           # Test runner and framework
@vitejs/plugin-react@6.0.1  # React support for Vite/Vitest
```

### Testing Library
```bash
@testing-library/react@16.3.2   # React component testing utilities
@testing-library/dom@10.4.1     # DOM testing utilities
@testing-library/jest-dom@6.9.1 # Custom matchers for DOM assertions
```

### Environment
```bash
jsdom@29.0.1              # Browser environment for headless testing
vite-tsconfig-paths@6.1.1 # TypeScript path resolution support
```

## Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### vitest.setup.ts
```typescript
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests once (CI mode)
npx vitest --run

# Run specific test file
npx vitest --run src/components/ui/__tests__/toast.test.tsx

# Run tests with coverage
npx vitest --coverage

# Run tests in watch mode (development)
npx vitest
```

## Test File Structure

Tests can be co-located with components or placed in `__tests__` directories:

```
src/
├── components/
│   ├── ui/
│   │   ├── toast.tsx
│   │   └── __tests__/
│   │       └── toast.test.tsx
│   └── editor/
│       ├── code-editor.tsx
│       └── __tests__/
│           └── code-editor.test.tsx
└── lib/
    └── __tests__/
        └── utils.test.ts
```

## Writing Tests

### Basic Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Custom Matchers Available

The `@testing-library/jest-dom` package provides custom matchers:

- `toBeInTheDocument()` - Check if element is in the document
- `toHaveClass()` - Check CSS classes
- `toHaveTextContent()` - Check text content
- `toBeVisible()` - Check visibility
- `toBeDisabled()` - Check disabled state
- And many more...

## Testing Strategy

### Unit Tests
- Test individual components in isolation
- Mock external dependencies (API calls, browser APIs)
- Focus on component behavior, not implementation details

### Integration Tests
- Test component interactions
- Test data flow through multiple components
- Test with real store/context when needed

### What to Test

**Should Test:**
- Component rendering with different props
- User interactions (clicks, inputs, form submissions)
- Conditional rendering logic
- State changes and their effects on UI
- Accessibility features

**Should Not Test:**
- Implementation details (how it works vs what it does)
- Third-party libraries (assume they work)
- Static markup without logic
- CSS/styling (unless it's behavior-related)

## Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(screen.getByRole('button')).toBeEnabled()
   
   // Avoid
   expect(component.props.disabled).toBe(false)
   ```

2. **Use Semantic Queries**
   ```typescript
   // Preferred order:
   getByRole('button')      // accessibility first
   getByLabelText('Name')   // form labels
   getByPlaceholderText('Enter name')
   getByText('Submit')      
   getByTestId('submit-btn') // last resort
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('submits form', () => {
     // Arrange
     const onSubmit = vi.fn()
     render(<Form onSubmit={onSubmit} />)
     
     // Act
     userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
     userEvent.click(screen.getByRole('button', { name: /submit/i }))
     
     // Assert
     expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
   })
   ```

4. **Mock External Dependencies**
   ```typescript
   import { vi } from 'vitest'
   
   vi.mock('next/navigation', () => ({
     useRouter: () => ({
       push: vi.fn(),
       replace: vi.fn(),
     }),
   }))
   ```

## Mocking

### Mocking Modules
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}))
```

### Mocking Hooks
```typescript
const mockUseStore = vi.fn()
vi.mock('@/store/editor-store', () => ({
  useStore: () => mockUseStore(),
}))
```

## Async Testing

```typescript
import { waitFor } from '@testing-library/react'

it('loads data on mount', async () => {
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

## Coverage

To generate coverage reports:

```bash
# Add coverage dependency
bun add -D @vitest/coverage-v8

# Run with coverage
npx vitest --coverage
```

Coverage configuration can be added to `vitest.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.*',
      ],
    },
  },
})
```

## Troubleshooting

### Common Issues

1. **"document is not defined"**
   - Ensure `environment: 'jsdom'` is set in vitest.config.ts
   - Check that jsdom is installed: `bun add -D jsdom`

2. **"expect is not defined" in setup file**
   - Import expect from vitest before extending matchers
   - Use the pattern shown in vitest.setup.ts

3. **Path resolution issues**
   - Ensure `vite-tsconfig-paths` is installed and configured
   - Check tsconfig.json paths configuration

4. **CSS/Style imports causing errors**
   - Add CSS handling to vitest.config.ts or mock CSS modules

### Debug Mode

Run tests with debug output:
```bash
npx vitest --reporter=verbose
```

## Next Steps

1. Add more comprehensive test coverage for existing components
2. Set up CI/CD pipeline to run tests on pull requests
3. Consider adding E2E tests with Playwright for critical user flows
4. Establish test coverage thresholds for production code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest)
