# Standalone React Template Planning Document
*Last Updated: May 13, 2025 - 16:00 UTC*

## Implementation Status Overview
*Added: May 13, 2025*

### ✅ Completed Features
1. **Core Layout System**
   - Main layout with configurable panels
   - Resizable panels with persistence
   - Theme system with light/dark support
   - Basic routing integration

2. **State Management**
   - Panel state management (usePanel hook)
   - Layout persistence (usePanelLayout hook)
   - Settings system with persistence
   - Theme management

3. **Example Implementation**
   - Basic app showcasing core features
   - Theme switching demonstration
   - Panel system demonstration
   - Settings persistence demonstration

### 🔄 In Progress Features
1. **Advanced Panel System**
   - Panel tabs system
   - Panel grouping
   - Panel drag-and-drop reordering

2. **Workspace Framework**
   - Workspace state management
   - Multi-workspace support
   - Interaction mode management

### ⬜ Pending Features
1. **Debug and Logging System**
   - Log viewer component
   - Debug panel system
   - Performance monitoring

2. **Documentation System**
   - Documentation viewer
   - API documentation integration
   - Interactive examples

3. **Tool System**
   - Tool registration system
   - Tool panel framework
   - Tool state management

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

### Template Core (`@template-core`) - Current Implementation
```
template-core/
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx          # Main application layout
│   │   ├── ResizablePanel.tsx     # Base resizable panel
│   │   └── common/
│   │       └── icons/             # Common icon components
│   ├── state/
│   │   ├── AppStateProvider.tsx   # Central state provider
│   │   ├── hooks/
│   │   │   ├── useTheme.ts       # Theme management
│   │   │   ├── usePanel.ts       # Panel state management
│   │   │   ├── usePanelLayout.ts # Layout management
│   │   │   └── useSettings.ts    # Settings management
│   │   └── types.ts              # State type definitions
│   └── types/
│       └── index.ts              # Core type definitions
├── examples/
│   └── basic-app/               # Working example implementation
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Currently Implemented Features

#### 1. Layout System
```typescript
// AppLayout Component
interface AppLayoutProps {
  title: string;
  titleIcon?: React.ReactNode;
  navItems?: NavItem[];
  rightContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  footerSize?: number;
  minFooterSize?: number;
  maxFooterSize?: number;
  className?: string;
  children: React.ReactNode;
}

// ResizablePanel Component
interface ResizablePanelProps {
  direction: 'horizontal' | 'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  handlePosition?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
  onResize?: (size: number) => void;
}
```

#### 2. State Management
```typescript
// Panel State Hook
const { panel, updatePanel } = usePanel('panelId');

// Layout Management Hook
const { layout, addPanel, removePanel } = usePanelLayout();

// Theme Management Hook
const [theme, setTheme] = useTheme();

// Settings Management Hook
const { settings, updateSettings } = useSettings();
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

## 3. Implementation Strategy & Progress

### Phase 1: Core Extraction ✅
1. ✅ Extract core layout components
   - AppLayout component implemented
   - ResizablePanel component implemented
   - Theme system integrated
2. ✅ Create base panel abstractions
   - Panel state management implemented
   - Panel layout system implemented
3. ✅ Move state management to template core
   - AppStateProvider created
   - Core hooks implemented
   - State persistence added
4. ✅ Basic routing infrastructure
   - Router integration complete
   - Navigation components added

### Phase 2: Advanced Features 🔄
1. Panel System Enhancements
   - ✅ Basic panel system
   - ✅ Panel state persistence
   - ✅ Resize functionality
   - 🔄 Panel tabs system
   - ⬜ Panel grouping
   - ⬜ Drag-and-drop support

2. Workspace Framework
   - ✅ Basic workspace container
   - 🔄 Workspace state management
   - ⬜ Multi-workspace support
   - ⬜ Workspace persistence
   - ⬜ Advanced interaction modes

3. Advanced State Management
   - ✅ Theme management
   - ✅ Settings persistence
   - 🔄 Operation history
   - ⬜ State validation
   - ⬜ State export/import

### Phase 3: Additional Systems ⬜
1. Debug and Logging
   - ⬜ Log viewer component
   - ⬜ Log persistence
   - ⬜ Debug panel system
   - ⬜ Performance monitoring

2. Documentation System
   - ⬜ Documentation viewer
   - ⬜ API documentation
   - ⬜ Code highlighting
   - ⬜ Interactive examples

3. Tool System
   - ⬜ Tool registration
   - ⬜ Tool panel framework
   - ⬜ Tool state management
   - ⬜ Tool configuration

## 4. Example Usage (Current Implementation)

### Basic App Setup
```tsx
// Main Application Entry
import { AppStateProvider } from '@template-core/state';
import App from './App';

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);

// App Implementation
const ExampleApp: React.FC = () => {
  // Core hooks for state management
  const [theme, setTheme] = useTheme();
  const { panel: leftPanel, updatePanel: updateLeftPanel } = usePanel('leftSidebar');
  const { panel: rightPanel, updatePanel: updateRightPanel } = usePanel('rightSidebar');
  const { settings, updateSettings } = useSettings();

  return (
    <Router>
      <AppLayout
        title="Template Demo"
        titleIcon={<Activity className="w-6 h-6" />}
        navItems={[
          { path: '/', label: 'Home', icon: <Home /> },
          { path: '/activity', label: 'Activity', icon: <Activity /> }
        ]}
        rightContent={
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
        }
      >
        <div className="flex h-full">
          {/* Left Panel */}
          {leftPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={leftPanel.size}
              minSize={leftPanel.minSize}
              maxSize={leftPanel.maxSize}
              onResize={(size) => updateLeftPanel({ size })}
            >
              <LeftPanelContent />
            </ResizablePanel>
          )}

          {/* Main Content */}
          <MainContent />

          {/* Right Panel */}
          {rightPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={rightPanel.size}
              minSize={rightPanel.minSize}
              maxSize={rightPanel.maxSize}
              handlePosition="start"
              onResize={(size) => updateRightPanel({ size })}
            >
              <RightPanelContent />
            </ResizablePanel>
          )}
        </div>
      </AppLayout>
    </Router>
  );
};
```

### State Management Usage
```typescript
// Panel Management
const { panel, updatePanel } = usePanel('panelId');
updatePanel({ 
  isOpen: true,
  size: 250,
  minSize: 200,
  maxSize: 400
});

// Layout Management
const { layout, addPanel } = usePanelLayout();
addPanel({
  id: 'newPanel',
  isOpen: true,
  size: 300
});

// Settings Management
const { settings, updateSettings } = useSettings();
updateSettings({
  persistLayout: true,
  // other settings...
});
```

### Theme Implementation
```typescript
// Theme Usage
const [theme, setTheme] = useTheme();

// Theme-aware styling
const mainClasses = theme === 'dark' 
  ? 'bg-gray-800 text-white' 
  : 'bg-white text-gray-900';

// Theme toggle component
const ThemeToggle = () => {
  const [theme, setTheme] = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
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

## Migration Guide
*Added: May 13, 2025*

### 1. Initial Setup
```bash
# Add dependencies
pnpm add @template-core @template-base

# Optional: Add type definitions
pnpm add -D @types/template-core @types/template-base
```

### 2. State Management Integration
1. Wrap your app with AppStateProvider:
```tsx
import { AppStateProvider } from '@template-core/state';

function App() {
  return (
    <AppStateProvider>
      <YourApp />
    </AppStateProvider>
  );
}
```

2. Use the provided hooks for state management:
```tsx
function YourComponent() {
  const [theme] = useTheme();
  const { panel, updatePanel } = usePanel('yourPanelId');
  const { settings } = useSettings();
  
  // Use state as needed...
}
```

### 3. Layout Migration Steps
1. Replace your root layout with AppLayout
2. Convert existing panels to use ResizablePanel
3. Implement panel state management
4. Add theme support to your components

### 4. Best Practices
- Use the provided hooks for state management
- Follow the theme system for consistent styling
- Implement proper panel cleanup
- Use proper typing for all components

### 5. Common Patterns
```tsx
// Panel initialization
useEffect(() => {
  if (!panel) {
    addPanel({
      id: 'yourPanel',
      isOpen: true,
      size: 250,
      minSize: 200,
      maxSize: 400
    });
  }
}, [panel, addPanel]);

// Theme-aware component
const YourComponent = () => {
  const [theme] = useTheme();
  const classes = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900';
    
  return <div className={classes}>...</div>;
};
```

### 6. Anti-patterns to Avoid
- Don't manage panel state outside of usePanel
- Don't implement custom theme switching
- Don't bypass the panel system for resizing
- Don't implement custom state persistence

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