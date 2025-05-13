import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

interface ComponentInfo {
  name: string;
  path: string;
  type: string;
  relatedFiles: string[];
  package?: string; // Optional package name for monorepo components
}

// --- Configuration ---
// Get the directory name in an ESM-compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'memory-bank/component_index.md');

// Define patterns and directories to search
const componentPatterns = ['**/*.tsx', '**/*.jsx']; // Include both TSX and JSX files
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.next/**'
];
// --- End Configuration ---

async function findComponents(): Promise<ComponentInfo[]> {
  console.log('Scanning project for components...');
  const components: ComponentInfo[] = [];

  // Use glob to find all component files across the project
  const componentFiles = await glob(componentPatterns, {
    cwd: projectRoot,
    absolute: true,
    ignore: excludePatterns
  });

  for (const absolutePath of componentFiles) {
    const relativePath = path.relative(projectRoot, absolutePath);
    const dirName = path.dirname(absolutePath);
    const baseName = path.basename(absolutePath, path.extname(absolutePath));

    // Skip files we don't want to include
    if (baseName.startsWith('.') || baseName.toLowerCase() === 'index') {
      continue;
    }

    // Determine the package/location context
    const pathParts = relativePath.split(path.sep);
    let packageName = '';
    if (pathParts.includes('packages')) {
      // For monorepo components, use the package name
      const pkgIndex = pathParts.indexOf('packages');
      if (pkgIndex + 1 < pathParts.length) {
        packageName = pathParts[pkgIndex + 1];
      }
    } else if (pathParts.includes('src')) {
      // For main source components
      packageName = 'main';
    } else {
      // For other locations, use the top-level directory
      packageName = pathParts[0];
    }

    // Check for related files
    const relatedFiles: string[] = [];
    const possibleRelatedFiles = [
      path.join(dirName, 'index.ts'),
      path.join(dirName, 'index.tsx'),
      path.join(dirName, 'styles.css'),
      path.join(dirName, 'styles.scss'),
      path.join(dirName, `${baseName}.test.tsx`),
      path.join(dirName, `${baseName}.test.ts`),
      path.join(dirName, `${baseName}.css`),
      path.join(dirName, `${baseName}.scss`)
    ];

    for (const file of possibleRelatedFiles) {
      if (fs.existsSync(file)) {
        relatedFiles.push(path.relative(projectRoot, file));
      }
    }

    // Determine component type based on location and content
    let type = 'React Component';
    if (relativePath.includes('pages/')) {
      type = 'Page Component';
    } else if (relativePath.includes('layouts/')) {
      type = 'Layout Component';
    } else if (relativePath.includes('hooks/')) {
      type = 'Custom Hook';
    } else if (relativePath.includes('components/')) {
      // Keep default type
    }

    components.push({
      name: baseName,
      path: relativePath.replace(/\\/g, '/'),
      type,
      relatedFiles: relatedFiles.map(p => p.replace(/\\/g, '/')),
      package: packageName
    });
  }

  // Sort components by package and then by name
  components.sort((a, b) => {
    if (a.package === b.package) {
      return a.name.localeCompare(b.name);
    }
    return a.package?.localeCompare(b.package || '') || 0;
  });

  return components;
}

function generateMarkdown(components: ComponentInfo[]): string {
  const timestamp = new Date().toISOString();
  let markdown = `# Component Index\n`;
  markdown += `*Last Updated: ${timestamp} (Auto-generated)*\n\n`;
  markdown += `This file maps components across the entire project. Paths are relative to the project root (\`${projectRoot}\`).\n\n`;

  // Group components by package
  const componentsByPackage = components.reduce((acc, comp) => {
    const pkg = comp.package || 'other';
    if (!acc[pkg]) {
      acc[pkg] = [];
    }
    acc[pkg].push(comp);
    return acc;
  }, {} as Record<string, ComponentInfo[]>);

  // Generate section for each package
  for (const [pkg, pkgComponents] of Object.entries(componentsByPackage)) {
    markdown += `\n## ${pkg === 'main' ? 'Main Source' : pkg}\n\n`;
    markdown += `| Component Name | Primary File Path | Type/Description | Related Files |\n`;
    markdown += `|----------------|------------------|-----------------|---------------|\n`;

    pkgComponents.forEach(comp => {
      const related = comp.relatedFiles.length > 0 ? `\`${comp.relatedFiles.join('`, `')}\`` : '-';
      markdown += `| ${comp.name} | \`${comp.path}\` | ${comp.type} | ${related} |\n`;
    });
  }

  markdown += `\n## Notes\n`;
  markdown += `- This index includes components from across the entire project structure.\n`;
  markdown += `- Component types are inferred based on their location in the project.\n`;
  markdown += `- This file is auto-generated by \`scripts/generate-component-index.ts\`. Do not edit manually.\n`;
  markdown += `- Keep this updated by running the script when components are added, moved, or renamed.\n`;
  markdown += `- Related files may include tests, styles, and index files.\n`;

  return markdown;
}

async function run() {
  try {
    console.log(`Scanning for components in the project...`);
    const components = await findComponents();
    console.log(`Found ${components.length} potential components.`);

    if (components.length === 0) {
        console.warn("No components found. Check the 'componentPatterns' and 'excludePatterns' configuration.");
        return;
    }

    console.log(`Generating Markdown...`);
    const markdownContent = generateMarkdown(components);

    console.log(`Writing index to: ${outputFile}`);
    fs.writeFileSync(outputFile, markdownContent, 'utf8');

    console.log('Component index generated successfully!');
  } catch (error) {
    console.error('Error generating component index:', error);
    process.exit(1);
  }
}

run();