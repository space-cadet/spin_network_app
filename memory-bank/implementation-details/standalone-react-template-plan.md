# Standalone React Template Planning Document
*Last Updated: May 6, 2025 - 15:30 UTC*

## Table of Contents
1. [Current Application Analysis](#current-application-analysis)
   - [Application Overview](#application-overview)
   - [Core Architecture](#core-architecture)
   - [Key Features](#key-features)
   - [Technical Implementation Details](#technical-implementation-details)
   - [Architecture Strengths](#architecture-strengths)

2. [Template Extraction Plan](#template-extraction-plan)
   - [Core Architecture Separation](#1-core-architecture-separation)
   - [Key Abstractions](#2-key-abstractions)
   - [Implementation Strategy](#3-implementation-strategy)
   - [Example Usage](#4-example-usage)
   - [Migration Steps](#5-migration-steps)
   - [Additional Features](#6-additional-features)

3. [Template Benefits & Structure](#template-benefits--structure)
   - [Benefits of Template Architecture](#benefits-of-template-architecture)
   - [Package Structure](#package-structure)
   - [Package Configurations](#package-configurations)
   - [Implementation Steps](#implementation-steps)

4. [Next Steps & History](#next-steps--history)
   - [Next Steps](#next-steps)
   - [Document History](#document-history)

## Current Application Analysis
*Analysis Completed: May 6, 2025 - 14:45 UTC*

## Application Overview
The application is a sophisticated React-based interface designed for network visualization and simulation. It features a highly modular architecture with collapsible sidebars, persistent state management, and comprehensive logging capabilities.

## Core Architecture

### Layout Components
1. **Main Layout**
   - Three-panel layout system with collapsible sidebars
   - Left sidebar for network tools
   - Right sidebar for properties and simulation control
   - Bottom panel for results, logs, and debugging
   - Responsive main workspace area

2. **Resizable Panel System**
   - Two-tier panel implementation:
     - Base `ResizablePanel` component for core resize functionality
     - `PersistentResizablePanel` wrapper for state persistence
   - Features:
     - Bi-directional resizing (horizontal/vertical)
     - Configurable min/max sizes
     - Customizable handle positions
     - Debounced state updates
     - Smooth resize interactions

### State Management & Persistence

#### Core State Management
1. **URL State**
   - Route parameters
   - Query string handling
   - Navigation state

2. **Layout State**
   - Panel sizes
   - Panel visibility
   - Workspace configuration
   - Component positions

3. **User Preferences**
   - Theme settings
   - UI preferences
   - Feature flags
   - Display options

#### State Persistence Mechanisms

1. **Session Storage**
```typescript
interface SessionState {
  panels: {
    sizes: Record<string, number>;
    visibility: Record<string, boolean>;
  };
  workspace: {
    layout: LayoutConfig;
    lastRoute: string;
  };
}
```

2. **Local Storage**
```typescript
interface LocalState {
  preferences: UserPreferences;
  theme: ThemeConfig;
  features: FeatureFlags;
}
```

3. **URL State**
```typescript
interface URLState {
  view: string;
  panel?: string;
  tool?: string;
  config?: string;
}
```

#### Redux Integration Support

1. **Store Configuration**
```typescript
interface StoreConfig {
  reducers: Record<string, Reducer>;
  middleware?: Middleware[];
  enhancers?: StoreEnhancer[];
  devTools?: boolean;
}

// Usage example:
const store = createAppStore({
  reducers: {
    userFeature: userReducer
  },
  middleware: [...defaultMiddleware, userMiddleware]
});
```

2. **Integration Utilities**
- Store provider wrapper
- Type-safe action creators
- Selector utilities
- Middleware setup

3. **Development Tools**
- Redux DevTools integration
- Action logging
- State snapshots
- Time-travel debugging

### Navigation & Routing
- React Router implementation with multiple views:
  - Main workspace (default route)
  - Log explorer (/explorer)
  - Testing page (/testing)
  - Documentation (/docs)

## Key Features

### 1. Workspace Management
- Main workspace area with dynamic sizing
- Integration with network visualization tools
- Responsive to sidebar state changes

### 2. Panel System
- **Left Sidebar**
  - Network tools integration
  - Collapsible design
  - Size persistence
  - 200-400px width range

- **Right Sidebar**
  - Properties panel
  - Type management
  - Simulation controls
  - 250-500px width range

- **Bottom Panel**
  - Tab-based interface
  - Multiple views:
    - Simulation results
    - Simulation logs
    - Debug panel
    - Application logs
  - 150-400px height range

### 3. Logging System
- Comprehensive logging infrastructure
- Multiple log types support
- Database integration
- Migration utilities from markdown
- Filtering capabilities
- Export functionality

### 4. Theming
- Theme provider implementation
- Consistent styling system
- Tailwind CSS integration

## Technical Implementation Details

### State Persistence
- Redux store for global state
- Dedicated UI slice for layout state
- Selectors for efficient state access
- Debounced updates for performance

### Event Handling
- Mouse event management for resizing
- Debounced resize handlers
- Cleanup on component unmount
- Position-aware resize calculations

### Error Handling
- Error boundaries implementation
- Logging system integration
- User feedback mechanisms
- Migration error handling

## Optimization Features
1. Debounced state updates
2. Efficient resize calculations
3. Conditional rendering for sidebars
4. Memory-efficient event listeners
5. Cleanup implementations

## Areas for Potential Enhancement
1. Gesture support for touch devices
2. Keyboard accessibility improvements
3. State persistence optimization
4. Performance monitoring integration
5. Error recovery mechanisms

## Architecture Strengths
1. Modular component design
2. Robust state management
3. Efficient panel system
4. Comprehensive logging
5. Maintainable codebase structure

The application demonstrates a well-thought-out architecture with strong attention to user experience and performance considerations. The modular design allows for easy maintenance and future enhancements.

## Template Extraction Plan
*Plan Created: May 6, 2025 - 15:00 UTC*

## 1. Core Architecture Separation

### Optional Components (template-base)

1. **File Explorer**
```typescript
interface FileExplorerProps {
  rootDir: string;
  onFileSelect?: (file: FileInfo) => void;
  filters?: FileFilter[];
  view?: 'list' | 'grid' | 'tree';
}
```

2. **Logging System**
```typescript
interface LogViewerProps {
  source: string | LogSource;
  filters?: LogFilter[];
  onExport?: (format: 'json' | 'csv') => void;
  view?: 'list' | 'table' | 'timeline';
}
```

### Template Core (`@template-core`)
```
template-core/
├── components/
│   ├── layouts/
│   │   ├── MainLayout/
│   │   └── WorkspaceLayout/
│   ├── panels/
│   │   ├── PersistentResizablePanel/
│   │   └── ResizablePanel/
│   ├── common/
│   │   ├── SidebarToggle/
│   │   └── PersistenceStatus/
│   └── logging/
│       ├── LogViewer/
│       └── LogExplorer/
├── hooks/
│   ├── useResizable/
│   └── usePersistence/
├── store/
│   ├── slices/
│   │   └── uiSlice.ts
│   └── core.ts
└── types/
    └── layout.ts
```

### Base Template (`@template-base`)
```
template-base/
├── components/
│   ├── BaseApp.tsx
│   ├── BaseWorkspace.tsx
│   └── panels/
│       ├── BaseLeftPanel/
│       ├── BaseRightPanel/
│       └── BaseBottomPanel/
├── hooks/
│   └── useBaseConfiguration/
└── types/
    └── configuration.ts
```

## 2. Key Abstractions

### Layout Configuration Interface
```typescript
interface LayoutConfiguration {
  panels: {
    left?: {
      enabled: boolean;
      minSize?: number;
      maxSize?: number;
      defaultContent?: React.ReactNode;
    };
    right?: {
      enabled: boolean;
      minSize?: number;
      maxSize?: number;
      defaultContent?: React.ReactNode;
    };
    bottom?: {
      enabled: boolean;
      minSize?: number;
      maxSize?: number;
      tabs?: Array<{
        id: string;
        label: string;
        content: React.ReactNode;
      }>;
    };
  };
  workspace?: {
    defaultContent?: React.ReactNode;
  };
}
```

### Panel Provider Interface
```typescript
interface PanelProvider {
  id: string;
  component: React.ComponentType;
  position: 'left' | 'right' | 'bottom';
  config?: {
    minSize?: number;
    maxSize?: number;
    defaultSize?: number;
  };
}
```

## 3. Implementation Strategy

### Phase 1: Core Extraction
1. Extract core layout components
2. Create base panel abstractions
3. Move state management to template core
4. Extract logging infrastructure

### Phase 2: Template Creation
1. Create configurable BaseApp component
2. Implement panel provider system
3. Create workspace abstraction
4. Implement routing templates

### Phase 3: Simulation App Migration
1. Create simulation-specific components
2. Implement simulation panels
3. Configure workspace for simulation
4. Migrate existing features

## 4. Example Usage

```tsx
// Configuration Example
const appConfig: LayoutConfiguration = {
  panels: {
    left: {
      enabled: true,
      minSize: 200,
      maxSize: 400
    },
    right: {
      enabled: true,
      minSize: 250,
      maxSize: 500
    },
    bottom: {
      enabled: true,
      minSize: 150,
      maxSize: 400,
      tabs: [
        {
          id: 'results',
          label: 'Results',
          content: <ResultsPanel />
        },
        {
          id: 'logs',
          label: 'Logs',
          content: <LogsPanel />
        }
      ]
    }
  },
  workspace: {
    defaultContent: <CustomWorkspace />
  }
};

// App Implementation Example
const App = () => {
  return (
    <BaseApp
      config={appConfig}
      theme={customTheme}
      panels={customPanels}
      workspace={CustomWorkspace}
    />
  );
};
```

## 5. Migration Steps

1. **Template Core Package**
   - Create new package for core components
   - Move layout and panel logic
   - Create interfaces for customization
   - Extract state management

2. **Base Template Package**
   - Create configurable components
   - Implement panel system
   - Create workspace abstraction
   - Add routing templates

3. **Current App Migration**
   - Move simulation logic to separate package
   - Update imports to use template
   - Configure panels and workspace
   - Migrate state management

4. **Testing & Validation**
   - Verify template functionality
   - Test simulation-specific features
   - Validate state management
   - Check performance impact

## 6. Additional Features

### Theme Support
```typescript
interface ThemeConfiguration {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, number>;
}
```

### Logging Configuration
```typescript
interface LoggingConfiguration {
  enabled: boolean;
  storage: 'memory' | 'indexeddb' | 'custom';
  customStorage?: LogStorageProvider;
  levels: Array<'debug' | 'info' | 'warn' | 'error'>;
}
```

### State Persistence
```typescript
interface PersistenceConfiguration {
  enabled: boolean;
  storage: 'localStorage' | 'sessionStorage' | 'custom';
  customStorage?: StorageProvider;
  key: string;
}
```

## Benefits of Template Architecture

### 1. Reusability
- Core layout system
- Panel management
- State persistence
- Logging infrastructure

### 2. Customization
- Panel configuration
- Theme support
- Storage options
- Workspace flexibility

### 3. Maintainability
- Separated concerns
- Clear interfaces
- Consistent patterns
- Documented structure

### 4. Scalability
- Modular design
- Plugin architecture
- Extension points
- Performance optimizations

## Template Benefits & Structure
*Structure Defined: May 6, 2025 - 15:15 UTC*

## Next Steps & History
*Updated: May 6, 2025 - 15:30 UTC*

1. **Immediate Actions**
   - Create packages directory structure
   - Set up initial package configurations
   - Begin core component extraction

2. **Short-term Goals**
   - Complete template-core implementation
   - Create base template components
   - Begin simulation app migration

3. **Long-term Objectives**
   - Comprehensive testing suite
   - Documentation system
   - Example implementations
   - Performance optimization

## Document History
- Initial Analysis: May 6, 2025 - 14:45 UTC
- Template Plan Creation: May 6, 2025 - 15:00 UTC
- Package Structure Definition: May 6, 2025 - 15:15 UTC
- Final Update: May 6, 2025 - 15:30 UTC

   # Template Package Structure in Current Project

## Overview
Since this is a pnpm workspace project, we'll create a packages directory to house our template packages alongside the main application.

## Proposed Directory Structure

```
spin_network_app/
├── packages/
│   ├── template-core/             # Core template package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── components/
│   │       │   ├── layouts/
│   │       │   ├── panels/
│   │       │   └── common/
│   │       ├── hooks/
│   │       ├── store/
│   │       └── types/
│   │
│   ├── template-base/            # Base implementation package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── types/
│   │
│   └── simulation-app/           # Current app refactored as a package
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── components/
│           ├── simulation/
│           └── types/
│
├── src/                          # Main application entry point
│   ├── App.tsx                   # Updated to use template
│   └── main.tsx
│
└── pnpm-workspace.yaml           # Updated workspace configuration
```

## Package Configurations

### 1. template-core/package.json
```json
{
  "name": "@spin-network/template-core",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 2. template-base/package.json
```json
{
  "name": "@spin-network/template-base",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "@spin-network/template-core": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 3. simulation-app/package.json
```json
{
  "name": "@spin-network/simulation-app",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "@spin-network/template-base": "workspace:*"
  }
}
```

### 4. Updated pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
  - '.'

onlyBuiltDependencies:
  - esbuild
overrides:
  react-router@>=7.0 <=7.5.1: '>=7.5.2'
  react-router@>=7.2.0 <=7.5.1: '>=7.5.2'
  vite@>=6.3.0 <=6.3.3: '>=6.3.4'
```

## Implementation Steps

1. **Initial Setup**
   ```bash
   mkdir -p packages/{template-core,template-base,simulation-app}
   ```

2. **Move Core Components**
   - Move layout components to template-core
   - Move panel system to template-core
   - Move state management to template-core

3. **Create Base Implementation**
   - Implement BaseApp in template-base
   - Create configuration system
   - Set up theming support

4. **Refactor Current App**
   - Move simulation-specific code to simulation-app
   - Update imports to use template packages
   - Configure workspace layout

## Benefits of This Structure

1. **Clean Separation**
   - Core template functionality isolated
   - Base implementation separate from core
   - Simulation logic properly contained

2. **Dependency Management**
   - Proper peer dependencies
   - Workspace package linking
   - Version control for packages

3. **Development Workflow**
   - Independent package development
   - Easy testing setup
   - Clear dependency boundaries

4. **Future Extensibility**
   - Easy to add new packages
   - Clear upgrade path
   - Simple dependency management