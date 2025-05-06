# React Template File Migration Plan
*Created: May 6, 2025*

## File Migration Strategy

### @template-core Package

#### Core Components (/packages/template-core/src/)
```
components/
  common/
    Button/
    Input/
    Select/
    Card/
    Dialog/
  layout/
    Grid/
    Container/
    Flex/
  panel/
    PanelContainer/
    PanelContext/
    PanelProvider/
  hooks/
    usePanel/
    useLayout/
    useTheme/
  types/
    panel.types.ts
    layout.types.ts
    theme.types.ts
  utils/
    panel.utils.ts
    layout.utils.ts
    theme.utils.ts
```

#### Configuration
```
/
  package.json
  tsconfig.json
  vite.config.ts
  .eslintrc.js
  .prettierrc
  README.md
```

### @template-base Package

#### Extended Components (/packages/template-base/src/)
```
components/
  workspace/
    WorkspaceContainer/
    WorkspaceContext/
    WorkspaceProvider/
  documentation/
    DocViewer/
    ApiDoc/
    MarkdownRenderer/
  tools/
    ToolPanel/
    ToolContext/
    ToolProvider/
  debug/
    DebugPanel/
    LogViewer/
    ErrorBoundary/
  settings/
    SettingsPanel/
    SettingsContext/
    SettingsProvider/
```

#### Configuration
```
/
  package.json
  tsconfig.json
  vite.config.ts
  .eslintrc.js
  .prettierrc
  README.md
```

## File Moving Strategy

### Phase 1: Core Infrastructure
1. Create package directories
2. Set up configuration files
3. Move core panel system
4. Move layout components
5. Move common components

### Phase 2: Base Components
1. Move workspace components
2. Move documentation system
3. Move tool infrastructure
4. Move debug & logging
5. Move settings system

### Phase 3: Update Application
1. Update imports
2. Fix dependencies
3. Test functionality
4. Update documentation

## Migration Guidelines

### File Moving Rules
1. Move files individually
2. Update imports immediately
3. Test after each move
4. Document changes
5. Keep git history

### Testing Strategy
1. Unit tests with each component
2. Integration tests for systems
3. Visual regression tests
4. Performance benchmarks

## Success Criteria
1. All files correctly placed
2. All tests passing
3. No broken imports
4. Documentation updated
5. Performance maintained

## Notes
- Keep simulation-specific code in app
- Maintain type safety during migration
- Document all changes
- Create examples for each component