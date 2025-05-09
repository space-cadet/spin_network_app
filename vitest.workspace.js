import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vite.config.ts",
  "./vite.config.js",
  "./packages/template-base/vite.config.ts",
  "./packages/template-core/vitest.config.ts",
  "./packages/template-core/examples/basic-app/vite.config.ts"
])
