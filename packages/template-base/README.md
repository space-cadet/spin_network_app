# Template Base

Extended React template components and features built on @template-core.

## Features

- Workspace management
- Documentation system
- Tool infrastructure
- Debug & logging
- Settings management

## Installation

```bash
pnpm add @template-base
```

## Usage

```typescript
import { WorkspaceContainer, useWorkspace } from '@template-base';
```

## Dependencies

- @template-core
- react-router-dom
- lucide-react

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
  ├── components/    # React components
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