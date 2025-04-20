import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import 'github-markdown-css/github-markdown-light.css';
import 'katex/dist/katex.min.css';
import './DocsStyles.css';

interface DocsViewerProps {
  type: 'physics' | 'implementation';
}

const DocsViewer: React.FC<DocsViewerProps> = ({ type }) => {
  const { docId } = useParams<{ docId: string }>();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHtml, setIsHtml] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // List of possible paths to try in order
        const possiblePaths = [];
        
        // Prepare possible paths based on provided docId
        if (docId?.includes('.')) {
          // If docId already has an extension
          possiblePaths.push(`/docs/${type}/${docId}`);
        } else {
          // Try HTML first (most likely to exist in our app structure)
          possiblePaths.push(`/docs/${type}/${docId}.html`);
          possiblePaths.push(`/docs/${type}/${docId}.md`);
          
          // Try public directory paths as fallbacks
          possiblePaths.push(`/public/docs/${type}/${docId}.html`);
          possiblePaths.push(`/public/docs/${type}/${docId}.md`);
        }
        
        // Also try root public paths for backwards compatibility
        possiblePaths.push(`/${docId}.html`);
        
        let foundContent = false;
        let foundExtension = '';
        let responseText = '';
        
        // Try each path until we find content
        for (const path of possiblePaths) {
          try {
            console.log(`Attempting to load document from: ${path}`);
            const response = await fetch(path);
            
            if (response.ok) {
              responseText = await response.text();
              foundExtension = path.split('.').pop() || '';
              foundContent = true;
              console.log(`Successfully loaded document from: ${path}`);
              break;
            }
          } catch (pathErr) {
            console.log(`Path not found: ${path}`);
            // Continue to next path
          }
        }
        
        if (!foundContent) {
          throw new Error(`Failed to load document: Could not find ${docId} in any expected location`);
        }
        
        // Set content type flag
        setIsHtml(foundExtension === 'html');
        setContent(responseText);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load the requested document. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (docId) {
      fetchDocument();
    }
  }, [docId, type]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-red-500 p-4 border border-red-300 bg-red-50 rounded">
          {error}
        </div>
        <div className="p-4 border border-blue-300 bg-blue-50 rounded">
          <h3 className="font-medium text-blue-800 mb-2">Troubleshooting</h3>
          <p className="mb-2">This error may be caused by:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The document not existing at the expected path</li>
            <li>Missing UMD library files for standalone pages</li>
            <li>Path differences between development and production environments</li>
          </ul>
          <p className="mt-2">
            If you're in the development environment, try running <code className="bg-gray-100 px-1 py-0.5 rounded">pnpm run build:lib</code> to 
            generate the missing UMD library files.
          </p>
        </div>
      </div>
    );
  }
  
  if (isHtml) {
    // Try to enhance the HTML content with necessary styles and scripts
    const enhanceHtmlContent = (html: string) => {
      // Add KaTeX styles if not already included
      if (!html.includes('katex.min.css')) {
        html = html.replace('</head>', 
          '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">\n</head>');
      }
      
      // Add custom doc styles
      html = html.replace('</head>', 
        '<style>\n' +
        'body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 960px; margin: 0 auto; padding: 20px; }\n' +
        'pre, code { background-color: #f6f8fa; border-radius: 3px; padding: 0.2em 0.4em; }\n' +
        'pre { padding: 1em; overflow: auto; }\n' +
        'h1, h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }\n' +
        'table { border-collapse: collapse; width: 100%; }\n' +
        'table th, table td { border: 1px solid #dfe2e5; padding: 6px 13px; }\n' +
        'table tr:nth-child(2n) { background-color: #f6f8fa; }\n' +
        '.katex-display { overflow-x: auto; overflow-y: hidden; padding: 1em 0; }\n' +
        '</style>\n</head>');
      
      return html;
    };

    // For HTML content, we'll use an iframe with enhanced content
    const enhancedContent = (content.includes('<head>')) 
      ? enhanceHtmlContent(content) 
      : `<html><head><meta charset="UTF-8"><title>Document</title>
         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
         <style>
           body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 960px; margin: 0 auto; padding: 20px; }
           pre, code { background-color: #f6f8fa; border-radius: 3px; padding: 0.2em 0.4em; }
           pre { padding: 1em; overflow: auto; }
           h1, h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
           table { border-collapse: collapse; width: 100%; }
           table th, table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
           table tr:nth-child(2n) { background-color: #f6f8fa; }
           .katex-display { overflow-x: auto; overflow-y: hidden; padding: 1em 0; }
         </style>
         </head><body>${content}</body></html>`;
    
    return (
      <iframe 
        className="w-full h-full border-0"
        srcDoc={enhancedContent}
        title={docId || 'Documentation'}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
  
  // Add ID anchors to headings for TOC navigation
  const addAnchorsToHeadings = (content: string) => {
    // Replace markdown headings with headings that have IDs
    return content.replace(
      /^(#{1,6})\s+(.+)$/gm, 
      (match, hashes, title) => {
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        return `${hashes} ${title} {#${id}}`;
      }
    );
  };

  // Render markdown with anchors
  const contentWithAnchors = addAnchorsToHeadings(content);
  
  return (
    <div className="markdown-body px-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
        components={{
          // Add IDs to headings for TOC linking
          h1: ({node, ...props}) => <h1 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h2: ({node, ...props}) => <h2 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h3: ({node, ...props}) => <h3 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h4: ({node, ...props}) => <h4 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h5: ({node, ...props}) => <h5 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h6: ({node, ...props}) => <h6 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
        }}
      >
        {contentWithAnchors}
      </ReactMarkdown>
    </div>
  );
};

export default DocsViewer;