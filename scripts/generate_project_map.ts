import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..'); // Assumes script is in 'scripts/' directory
const outputFile = path.join(projectRoot, 'memory-bank/project_map.md');
const scanRoots = [projectRoot]; // Start scanning from the project root
const ignorePatterns = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**', // Ignore general dist folders
  '**/.DS_Store',
  '**/pnpm-lock.yaml',
  '**/*.code-workspace',
  '**/storage/**', // Ignore BrowserFS storage
  '**/archive/**', // Ignore memory-bank archive
  '**/vendor/**', // Ignore public vendor files
  '**/python/**/__pycache__/**',
  '**/lib/dist/**', // Ignore library build output specifically
];
// Define patterns for important files/dirs to ensure they are included even if empty
const importantPatterns = [
    'package.json',
    'vite.config.ts',
    'README.md',
    'lib/index.ts',
    'src/main.tsx',
    'src/App.tsx',
    'memory-bank/tasks.md',
    'memory-bank/edit_history.md',
    'memory-bank/errorLog.md',
    'scripts/project_map.ts', // Include self
];
// --- End Configuration ---

type ItemType =
  | 'Directory'
  | 'Component'
  | 'Hook'
  | 'Util'
  | 'Config'
  | 'Doc'
  | 'Script'
  | 'LibraryModule'
  | 'Style'
  | 'Asset'
  | 'Data'
  | 'Test'
  | 'OtherFile';

interface ProjectItem {
  path: string; // Relative path from project root
  type: ItemType;
  description?: string; // Optional description
  isDirectory: boolean;
  keyFile?: string; // e.g., index.ts for a module
}

function inferItemType(relativePath: string, isDirectory: boolean): ItemType {
  if (isDirectory) return 'Directory';

  const ext = path.extname(relativePath).toLowerCase();
  const baseName = path.basename(relativePath).toLowerCase();
  const dir = path.dirname(relativePath);

  // Specific file names
  if (baseName === 'package.json') return 'Config';
  if (baseName === 'vite.config.ts') return 'Config';
  if (baseName === 'tailwind.config.js') return 'Config';
  if (baseName === 'postcss.config.js') return 'Config';
  if (baseName === 'tsconfig.json') return 'Config';
  if (baseName === '.gitignore') return 'Config';
  if (baseName === '.npmrc') return 'Config';
  if (baseName === '.prettierrc') return 'Config';
  if (baseName === 'readme.md') return 'Doc';

  // Directory-based rules
  if (dir.startsWith('src/components')) return 'Component';
  if (dir.startsWith('src/hooks')) return 'Hook';
  if (dir.startsWith('src/utils')) return 'Util';
  if (dir.startsWith('src/store')) return 'LibraryModule'; // Or specific state management type
  if (dir.startsWith('src/database')) return 'LibraryModule';
  if (dir.startsWith('src/simulation')) return 'LibraryModule';
  if (dir.startsWith('lib/core')) return 'LibraryModule';
  if (dir.startsWith('lib/models')) return 'LibraryModule';
  if (dir.startsWith('lib/analysis')) return 'LibraryModule';
  if (dir.startsWith('lib/adapters')) return 'LibraryModule';
  if (dir.startsWith('lib/io')) return 'LibraryModule';
  if (dir.startsWith('lib/templates')) return 'LibraryModule';
  if (dir.startsWith('lib/utils')) return 'Util';
  if (dir.startsWith('scripts')) return 'Script';
  if (dir.startsWith('docs') || dir.startsWith('public/docs')) return 'Doc';
  if (dir.startsWith('memory-bank')) return 'Doc'; // Treat memory bank as documentation/metadata
  if (dir.startsWith('public/assets') || dir.startsWith('resources')) return 'Asset';
  if (dir.startsWith('src/styles')) return 'Style';
  if (dir.startsWith('python')) return 'Script'; // Or 'PythonScript'

  // Extension-based rules
  if (ext === '.tsx') return 'Component'; // Default for TSX outside components dir
  if (ext === '.ts') return 'LibraryModule'; // Default for TS
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'Script'; // Default for JS
  if (ext === '.css') return 'Style';
  if (ext === '.md') return 'Doc';
  if (ext === '.json') return 'Data';
  if (ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') return 'Asset';
  if (ext === '.html') return 'Doc'; // Treat HTML in public as docs/assets

  return 'OtherFile';
}

function getDescription(item: ProjectItem): string {
    // Add specific descriptions based on path or type
    if (item.path === 'package.json') return 'Project dependencies and scripts';
    if (item.path === 'vite.config.ts') return 'Vite build configuration';
    if (item.path === 'README.md') return 'Project overview and setup';
    if (item.path === 'memory-bank/tasks.md') return 'Task tracking';
    if (item.path === 'memory-bank/edit_history.md') return 'Log of file modifications';
    if (item.path === 'memory-bank/errorLog.md') return 'Log of errors encountered';
    if (item.path === 'src/main.tsx') return 'Application entry point';
    if (item.path === 'src/App.tsx') return 'Root application component';
    if (item.path === 'lib/index.ts') return 'Standalone library entry point';
    if (item.path === 'public/docs/index.html') return 'Documentation system entry';
    // Add more descriptions as needed
    return ''; // Default empty description
}

async function findProjectItems(): Promise<ProjectItem[]> {
  const itemsMap = new Map<string, ProjectItem>();

  // Scan everything, respecting ignores
  const allPaths = await glob('**/*', {
    cwd: projectRoot,
    nodir: false, // Include directories in the initial scan
    dot: true, // Include dotfiles/dotfolders
    ignore: ignorePatterns,
    absolute: true,
    mark: true, // Add trailing / to directories
  });

  // Process all found paths
  for (const absolutePath of allPaths) {
    const isDirectory = absolutePath.endsWith('/');
    const cleanAbsolutePath = isDirectory ? absolutePath.slice(0, -1) : absolutePath;
    const relativePath = path.relative(projectRoot, cleanAbsolutePath).replace(/\\/g, '/');

    // Skip empty strings or root path itself if represented as ''
    if (!relativePath) continue;

    // Ensure parent directories are added
    let currentPath = '';
    const parts = relativePath.split('/');
    for (let i = 0; i < (isDirectory ? parts.length : parts.length - 1); i++) {
        currentPath = parts.slice(0, i + 1).join('/');
        if (currentPath && !itemsMap.has(currentPath)) {
            const parentType = inferItemType(currentPath, true);
            const parentItem: ProjectItem = {
                path: currentPath,
                type: parentType,
                isDirectory: true,
                description: getDescription({ path: currentPath, type: parentType, isDirectory: true }),
            };
            itemsMap.set(currentPath, parentItem);
        }
    }


    // Add the file/directory itself
    if (!itemsMap.has(relativePath)) {
        const itemType = inferItemType(relativePath, isDirectory);
        const item: ProjectItem = {
            path: relativePath,
            type: itemType,
            isDirectory: isDirectory,
            description: getDescription({ path: relativePath, type: itemType, isDirectory: isDirectory }),
        };
        itemsMap.set(relativePath, item);
    }
  }

    // Ensure important files/dirs are included
    for (const pattern of importantPatterns) {
        const importantPaths = await glob(pattern, {
            cwd: projectRoot,
            nodir: false,
            dot: true,
            absolute: true,
            mark: true,
        });
        for (const absolutePath of importantPaths) {
             const isDirectory = absolutePath.endsWith('/');
             const cleanAbsolutePath = isDirectory ? absolutePath.slice(0, -1) : absolutePath;
             const relativePath = path.relative(projectRoot, cleanAbsolutePath).replace(/\\/g, '/');
             if (relativePath && !itemsMap.has(relativePath)) {
                 const itemType = inferItemType(relativePath, isDirectory);
                 const item: ProjectItem = {
                     path: relativePath,
                     type: itemType,
                     isDirectory: isDirectory,
                     description: getDescription({ path: relativePath, type: itemType, isDirectory: isDirectory }),
                 };
                 itemsMap.set(relativePath, item);
             }
        }
    }


  // Convert map to array and sort
  const items = Array.from(itemsMap.values());
  items.sort((a, b) => {
    const pathA = a.path.toLowerCase();
    const pathB = b.path.toLowerCase();
    // Sort directories before files within the same level
    const depthA = pathA.split('/').length;
    const depthB = pathB.split('/').length;
    if (path.dirname(pathA) === path.dirname(pathB)) {
        if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
        }
    }
    return pathA.localeCompare(pathB);
  });

  return items;
}

function generateProjectMapMarkdown(items: ProjectItem[]): string {
  const timestamp = new Date().toISOString();
  let markdown = `# Project Map\n`;
  markdown += `*Last Updated: ${timestamp} (Auto-generated by scripts/project_map.ts)*\n\n`;
  markdown += `This file provides a map of the project structure. Paths are relative to the project root (\`${projectRoot}\`).\n\n`;

  markdown += `| Path                 | Type            | Description                                      |\n`;
  markdown += `|----------------------|-----------------|--------------------------------------------------|\n`;

  items.forEach(item => {
    const indent = '  '.repeat(item.path.split('/').length - 1);
    const displayName = path.basename(item.path);
    const displayPath = item.isDirectory ? `${indent}📁 ${displayName}/` : `${indent}📄 ${displayName}`;
    const typePadded = item.type.padEnd(15);
    const desc = item.description || ''; // Use provided description or empty string

    // Use backticks for the path in the final output for clarity if needed, but display name is cleaner
    markdown += `| \`${item.path}\`${item.isDirectory ? '/' : ''} | ${typePadded} | ${desc} |\n`;
    // Alternative display focusing on hierarchy:
    // markdown += `| ${displayPath.padEnd(60)} | ${typePadded} | ${desc} |\n`;
  });

  markdown += `\n## Notes\n`;
  markdown += `- This map includes significant files and directories, ignoring patterns like \`node_modules\`, \`.git\`, etc.\n`;
  markdown += `- 'Type' is inferred based on location and extension.\n`;
  markdown += `- This file is auto-generated. Do not edit manually.\n`;

  return markdown;
}

async function run() {
  try {
    console.log(`Scanning project structure from: ${projectRoot}`);
    const items = await findProjectItems();
    console.log(`Found ${items.length} project items.`);

    if (items.length === 0) {
      console.warn("No project items found. Check scanning logic and ignore patterns.");
      return;
    }

    console.log(`Generating Markdown map...`);
    const markdownContent = generateProjectMapMarkdown(items);

    console.log(`Writing project map to: ${outputFile}`);
    fs.writeFileSync(outputFile, markdownContent, 'utf8');

    console.log('Project map generated successfully!');
  } catch (error) {
    console.error('Error generating project map:', error);
    process.exit(1);
  }
}

run();
