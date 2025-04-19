# Documentation Organization Plan

## Overview
This plan outlines a unified documentation system for the spin network project by:
1. Creating a dedicated "Documentation" section in the app
2. Organizing existing documentation files in a structured hierarchy
3. Making the documentation accessible from the main UI via the header menu

## Proposed Structure

### 1. File Organization
Create a new directory structure:
```
/public/docs/
  ├── physics/
  │   ├── physics-notebook.html     (from physics-notebook.html)
  │   ├── mathematical-roadmap.md   (from implementation-details/mathematical-roadmap.md)
  │   ├── intertwiner-spaces.md     (from implementation-details/intertwiner-spaces.md)
  │   └── unified-dynamics.md       (from implementation-details/spin-net-telegraph-unified.md)
  │
  ├── implementation/
  │   ├── standalone-guide.html     (from standalone-test.html)
  │   └── simulation-test.html      (from test-simulation.html)
  │
  └── index.html                    (new documentation landing page)
```

### 2. React Component Implementation
1. Create a new Documentation route and components:
```
/src/components/documentation/
  ├── DocsLayout.tsx           (Layout for documentation pages)
  ├── DocsSidebar.tsx          (Navigation sidebar)
  ├── DocsViewer.tsx           (Content viewer with markdown/HTML support)
  └── DocumentationHome.tsx    (Landing page)
```

2. Update the MainLayout.tsx header menu to include a "Documentation" link

3. Implement routing for documentation section:
```typescript
// In the app's router configuration
<Route path="/docs" element={<DocsLayout />}>
  <Route index element={<DocumentationHome />} />
  <Route path="physics/:docId" element={<DocsViewer type="physics" />} />
  <Route path="implementation/:docId" element={<DocsViewer type="implementation" />} />
</Route>
```

### 3. Documentation Content Structure

#### Categories:
1. **Physics & Theory**
   - Mathematical Foundations
   - Spin Networks Explained
   - Intertwiner Spaces
   - Unified Dynamics Approach

2. **Implementation Details**
   - Standalone Library Guide
   - Simulation Test Environment
   - API Reference

## Implementation Plan
1. Create the directory structure in public/docs/
2. Move existing files to their new locations
3. Create the new React components for documentation viewing
4. Add the Documentation link to the main navigation
5. Implement routing
6. Create the index/landing page for the documentation section

This approach will provide a centralized, accessible documentation system that can grow with the project while making all documentation easily available from within the app interface.
