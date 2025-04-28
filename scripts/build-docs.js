import { copy } from 'fs-extra';
import { join } from 'path';
import { glob } from 'glob';

async function buildDocs() {
  const docsSource = join(process.cwd(), 'docs');
  const docsDest = join(process.cwd(), 'dist', 'docs');
  
  try {
    // Get all doc files using glob
    const docFiles = await glob('**/*', {
      cwd: docsSource,
      nodir: true,
      absolute: true
    });

    // Copy each file to destination
    for (const file of docFiles) {
      const relativePath = file.replace(docsSource, '');
      const destPath = join(docsDest, relativePath);
      await copy(file, destPath);
    }

    console.log('Documentation build complete');
  } catch (error) {
    console.error('Error building documentation:', error);
    process.exit(1);
  }
}

buildDocs();