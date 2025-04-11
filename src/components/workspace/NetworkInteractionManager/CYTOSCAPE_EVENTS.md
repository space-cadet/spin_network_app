# Cytoscape Event Handling in TypeScript

*Created: April 11, 2025*

## Overview

This document explains the event handling pattern used in the NetworkInteractionManager component when working with Cytoscape.js in TypeScript. Due to some limitations in the TypeScript definitions for Cytoscape, we've adopted specific patterns to make event handling work correctly.

## Known Issues

The TypeScript definitions for Cytoscape.js have some limitations when it comes to event handling:

1. The `.on()` and `.off()` methods have type definitions that don't correctly handle function references.
2. The error messages suggest that the methods are expecting string parameters rather than function handlers.
3. This mismatch makes it difficult to properly register and remove event handlers.

## Solution Pattern

We've used the following pattern to work around these TypeScript issues:

### 1. Import Style

Use namespace import for Cytoscape instead of default import:

```typescript
// Correct
import * as cytoscape from 'cytoscape';

// Avoid
import cytoscape from 'cytoscape';
```

### 2. Event Handler Function Definition

Define event handlers as function expressions with const to maintain reference equality:

```typescript
// Recommended
const onTap = function(event: cytoscape.EventObject) {
  // Handler code
};

// Avoid
function onTap(event: cytoscape.EventObject) {
  // Handler code
}
```

### 3. TypeScript Assertions

Use `@ts-ignore` comments to bypass TypeScript's incorrect type checking for Cytoscape events:

```typescript
// Define the handler
const onTap = function(event: cytoscape.EventObject) {
  handleTapEvent(event);
};

// Register the event with @ts-ignore
// @ts-ignore - Cytoscape typings are not handling event functions correctly
cy.nodes().on('tap', onTap);

// Cleanup with the same pattern
return () => {
  // @ts-ignore - Cytoscape typings are not handling event functions correctly
  cy.nodes().off('tap', onTap);
};
```

### 4. Proper Cleanup

Always make sure to clean up event handlers in useEffect return functions using the same handler reference:

```typescript
useEffect(() => {
  if (!cy) return;
  
  const onEvent = function(event: cytoscape.EventObject) {
    // Handler code
  };
  
  // @ts-ignore
  cy.on('someEvent', onEvent);
  
  return () => {
    // @ts-ignore
    cy.off('someEvent', onEvent);
  };
}, [cy, otherDependencies]);
```

## Alternative Approaches

If you prefer not to use `@ts-ignore` comments, consider these alternatives:

1. **Type Casting**: Cast the event handler to `any` before passing it to Cytoscape methods
2. **Custom Type Definition**: Create a local .d.ts file with corrected type definitions
3. **Type Parameter**: Leverage TypeScript's generics to specify the handler type

## Long-term Solutions

For a more permanent solution:

1. Submit a PR to the `@types/cytoscape` repository to fix the type definitions
2. Create a local type definition file that correctly handles event bindings
3. Use a custom wrapper around Cytoscape that abstracts away the event binding issues

## Resources

- [Cytoscape.js Documentation](https://js.cytoscape.org/#events)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [DefinitelyTyped Repository](https://github.com/DefinitelyTyped/DefinitelyTyped)
