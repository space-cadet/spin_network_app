import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

interface ComponentInfo {
  name: string;
  path: string;
  package: string;
  isTemplate: boolean;
  dependencies: string[];
  props?: string;
  description?: string;
}

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'memory-bank/template_component_index.md');
const packagesDir = path.join(projectRoot, 'packages');
const templatePackages = ['template-core', 'template-base'];
const filePattern = '**/*.tsx';
const excludePatterns = ['**/node_modules/**', '**/dist/**', '**/build/**'];
const additionalDirs = [path.join(projectRoot, 'src')]; // Add src/ folder to scan
// --- End Configuration ---

async function findComponents(): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = [];

  // Scan template packages
  for (const pkg of templatePackages) {
    const packagePath = path.join(packagesDir, pkg);
    const componentFiles = await glob(filePattern, {
      cwd: packagePath,
      absolute: true,
      ignore: excludePatterns,
    });

    for (const absolutePath of componentFiles) {
      const relativePath = path.relative(projectRoot, absolutePath);
      const baseName = path.basename(absolutePath, path.extname(absolutePath));

      // Basic metadata
      const component: ComponentInfo = {
        name: baseName,
        path: relativePath.replace(/\\/g, '/'),
        package: pkg,
        isTemplate: true,
        dependencies: [], // Placeholder for dependency analysis
      };

      // Add component to the list
      components.push(component);
    }
  }

  // Scan src/ folder
  for (const dir of additionalDirs) {
    const componentFiles = await glob(filePattern, {
      cwd: dir,
      absolute: true,
      ignore: excludePatterns,
    });

    for (const absolutePath of componentFiles) {
      const relativePath = path.relative(projectRoot, absolutePath);
      const baseName = path.basename(absolutePath, path.extname(absolutePath));

      // Basic metadata
      const component: ComponentInfo = {
        name: baseName,
        path: relativePath.replace(/\\/g, '/'),
        package: 'src', // Mark as part of src
        isTemplate: false, // Not a template component
        dependencies: [], // Placeholder for dependency analysis
      };

      // Add component to the list
      components.push(component);
    }
  }

  return components;
}

function generateMarkdown(components: ComponentInfo[]): string {
  const timestamp = new Date().toISOString();
  let markdown = `# Template Component Index\n`;
  markdown += `*Last Updated: ${timestamp} (Auto-generated)*\n\n`;
  markdown += `This file lists reusable template components from the \`template-core\` and \`template-base\` packages.\n\n`;

  markdown += `| Component Name | Package       | Path                                   | Dependencies |\n`;
  markdown += `|----------------|--------------|---------------------------------------|--------------|\n`;

  components.forEach(comp => {
    const dependencies = comp.dependencies.length > 0 ? comp.dependencies.join(', ') : '-';
    markdown += `| ${comp.name}         | ${comp.package} | ${comp.path} | ${dependencies} |\n`;
  });

  markdown += `\n## Notes\n`;
  markdown += `- This index focuses on reusable components from \`template-core\` and \`template-base\`.\n`;
  markdown += `- Dependencies are placeholders and can be expanded with further analysis.\n`;
  markdown += `- This file is auto-generated. Do not edit manually.\n`;

  return markdown;
}

async function run() {
  try {
    console.log(`Scanning for template components in: ${packagesDir}`);
    const components = await findComponents();
    console.log(`Found ${components.length} template components.`);

    if (components.length === 0) {
      console.warn("No template components found. Check the 'templatePackages' and 'filePattern' configuration.");
      return;
    }

    console.log(`Generating Markdown...`);
    const markdownContent = generateMarkdown(components);

    console.log(`Writing index to: ${outputFile}`);
    fs.writeFileSync(outputFile, markdownContent, 'utf8');

    console.log('Template component index generated successfully!');
  } catch (error) {
    console.error('Error generating template component index:', error);
    process.exit(1);
  }
}

run();
