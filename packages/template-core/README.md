# Template Core

Core React template components and utilities for building modular applications.

## Features

- Panel system
- Layout components
- Common UI elements
- Core hooks
- Type definitions
- Utility functions

## Installation

```bash
pnpm add @template-core
```

## Usage

```typescript
import { PanelContainer, usePanel } from '@template-core';
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build package
pnpm build

# Run tests
pnpm test
```

## Directory Structure

```
src/
  ├── components/    # Core React components
  ├── hooks/        # React hooks
  ├── types/        # TypeScript definitions
  └── utils/        # Utility functions
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```