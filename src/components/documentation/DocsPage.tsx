import React, { useState, useEffect, useRef } from 'react';
import { FaFileAlt, FaBook } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
import rehypeMathJax from 'rehype-mathjax';
// import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown.css';

// Add MathJax configuration after imports
const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
    packages: ['base', 'ams', 'noerrors', 'noundefined']
  },
  svg: {
    fontCache: 'global'
  }
};


type DocResource = {
  id: string;
  title: string;
  description: string;
  path: string;
  type: 'html' | 'markdown';
};

const docResources: DocResource[] = [
  {
    id: 'physics-notebook',
    title: 'Physics Notebook',
    description: 'Interactive notebook exploring the physics of spin networks.',
    path: '/docs/physics/physics-notebook.html',
    type: 'html'
  },
  {
    id: 'intertwiner-spaces',
    title: 'Intertwiner Spaces',
    description: 'Detailed explanation of intertwiner spaces in spin networks.',
    path: '/docs/physics/intertwiner-spaces.html',
    type: 'html'
  },
  {
    id: 'unified-dynamics',
    title: 'Unified Dynamics Approach',
    description: 'Unified approach to dynamics in spin network systems.',
    path: '/docs/physics/unified-dynamics.html',
    type: 'html'
  },
  {
    id: 'mathematical-roadmap',
    title: 'Mathematical Foundations',
    description: 'Mathematical roadmap and foundations for spin network theory.',
    path: '/docs/physics/mathematical-roadmap.html',
    type: 'html'
  }
];

const DocsPage: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<DocResource>(docResources[0]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 180px)');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Adjust iframe when window is resized
  useEffect(() => {
    const handleResize = () => {
      setIframeHeight('calc(100vh - 180px)');
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch Markdown content when selected resource changes
  useEffect(() => {
    if (selectedResource.type === 'markdown') {
      setIsLoading(true);
      
      fetch(selectedResource.path)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch markdown file');
          }
          return response.text();
        })
        .then(text => {
          setMarkdownContent(text);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading markdown:', error);
          setMarkdownContent(`# Error\nFailed to load ${selectedResource.title}. ${error.message}`);
          setIsLoading(false);
        });
    }
  }, [selectedResource]);

  const renderContent = () => {
    return (
      <iframe
        ref={iframeRef}
        src={selectedResource.path}
        className="w-full border-0"
        style={{ height: iframeHeight }}
        title={selectedResource.title}
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Documentation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Physics & Theory
          </p>
        </div>
        <nav className="mt-2">
          {docResources.map((resource) => (
            <button
              key={resource.id}
              className={`w-full text-left px-4 py-3 flex items-start hover:bg-gray-100 ${
                selectedResource.id === resource.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => setSelectedResource(resource)}
            >
              <FaFileAlt className={`mt-1 mr-3 ${selectedResource.id === resource.id ? 'text-blue-500' : 'text-gray-500'}`} />
              <div>
                <div className={`font-medium ${selectedResource.id === resource.id ? 'text-blue-600' : 'text-gray-900'}`}>
                  {resource.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">{resource.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold">{selectedResource.title}</h1>
          <p className="text-gray-600">{selectedResource.description}</p>
        </div>
        <div className="relative h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;