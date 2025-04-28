import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';

const htmlTemplate = (content: string, title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .math-display { 
            overflow-x: auto;
            margin: 1em 0;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

// Configure marked to handle math expressions and underscores correctly
const mathInlineRegex = /\$([^\$]+)\$/;
const mathDisplayRegex = /\$\$([^\$]+)\$\$/;

const tokenizer = {
    inlineMath(src: string) {
        const match = src.match(mathInlineRegex);
        if (match) {
            return {
                type: 'html',
                raw: match[0],
                text: `<span class="math-inline">${match[0]}</span>`
            };
        }
        return false;
    },
    displayMath(src: string) {
        const match = src.match(mathDisplayRegex);
        if (match) {
            return {
                type: 'html',
                raw: match[0],
                text: `<div class="math-display">${match[0]}</div>`
            };
        }
        return false;
    }
};

marked.use({ 
    gfm: true,
    breaks: true,
    pedantic: false,
    smartLists: true,
    smartypants: false,
    tokenizer
});

async function convertFile(filePath: string) {
    try {
        // Validate file exists and has .md extension
        if (!filePath.endsWith('.md')) {
            console.error('Error: File must be a markdown file (.md)');
            process.exit(1);
        }

        // Read markdown file
        const markdown = await fs.readFile(filePath, 'utf-8');
        
        // Convert to HTML
        const content = marked(markdown);
        
        // Get title from filename
        const title = path.basename(filePath, '.md')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Generate full HTML
        const html = htmlTemplate(content, title);
        
        // Write to HTML file
        const outputPath = filePath.replace('.md', '.html');
        await fs.writeFile(outputPath, html);
        
        console.log(`Converted ${filePath} to ${outputPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: File not found - ${filePath}`);
        } else {
            console.error('Error:', error);
        }
        process.exit(1);
    }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
    console.error('Error: Please provide a markdown file path');
    process.exit(1);
}

convertFile(filePath);