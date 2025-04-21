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
        const isExplicitHtml = docId?.endsWith('.html');
        let path = '';
        
        if (docId?.includes('.')) {
          path = `/docs/${type}/${docId}`;
        } else {
          path = `/docs/${type}/${docId}.md`;
        }
        
        let response = await fetch(path);
        
        if (!response.ok && !isExplicitHtml && !docId?.includes('.')) {
          const htmlPath = `/docs/${type}/${docId}.html`;
          response = await fetch(htmlPath);
        }
        
        if (!response.ok) {
          const publicPath = `/public/docs/${type}/${docId}${docId?.includes('.') ? '' : '.md'}`;
          response = await fetch(publicPath);
          
          if (!response.ok && !docId?.includes('.')) {
            const publicHtmlPath = `/public/docs/${type}/${docId}.html`;
            response = await fetch(publicHtmlPath);
          }
        }
        
        if (!response.ok) {
          throw new Error(`Failed to load document: Could not find ${docId} in any expected location`);
        }
        
        const responseText = await response.text();
        const foundExtension = response.url.split('.').pop()?.toLowerCase() || '';
        
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
        </div>
      </div>
    );
  }
  
  if (isHtml) {
    const processHtmlContent = (rawContent: string) => {
      let processed = rawContent;
      
      // Ensure base href exists
      if (!processed.includes('<base href')) {
        const basePath = `/docs/${type}/`;
        processed = processed.replace('<head>', `<head><base href="${basePath}">`);
      }

      // Add required styles
      if (!processed.includes('katex.min.css')) {
        processed = processed.replace('</head>', 
          '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">\n</head>');
      }

      return processed;
    };

    const finalContent = content.includes('<head>')
      ? processHtmlContent(content)
      : `<!DOCTYPE html>
        <html>
        <head>
          <base href="/docs/${type}/">
          <meta charset="UTF-8">
          <title>${docId || 'Documentation'}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
          <style>
            body { 
              font-family: -apple-system, system-ui, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>${content}</body>
        </html>`;

    return (
      <div className="relative w-full h-full">
        <iframe 
          className="w-full h-full border-0"
          srcDoc={finalContent}
          title={docId || 'Documentation'}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }
  
  return (
    <div className="markdown-body px-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
        components={{
          h1: ({node, ...props}) => <h1 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          h2: ({node, ...props}) => <h2 id={props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')} {...props} />,
          p: ({node, ...props}) => {
            if (typeof props.children === 'string') {
              const content = props.children.toString();
              const anchorPattern = /\s+\{#[\w-]+\}$/;
              if (anchorPattern.test(content)) {
                props.children = content.replace(anchorPattern, '');
              }
            }
            return <p {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default DocsViewer;