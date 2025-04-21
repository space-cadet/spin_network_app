import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBook, FaAtom, FaCode, FaChevronDown, FaChevronRight } from 'react-icons/fa';

// Interface for TOC items
interface TocItem {
  id: string;
  title: string;
  level: number;
}

// Interface for document metadata
interface DocMeta {
  path: string;
  label: string;
  toc: TocItem[];
}

const DocsSidebar: React.FC = () => {
  const location = useLocation();
  const [expandedTOCs, setExpandedTOCs] = useState<Record<string, boolean>>({});
  const [docMeta, setDocMeta] = useState<Record<string, DocMeta>>({});
  
  const physicsDocs = [
    { path: '/docs/physics/physics-notebook.html', label: 'Physics Notebook', format: 'html' },
    { path: '/docs/physics/mathematical-roadmap', label: 'Mathematical Foundations', format: 'md' },
    { path: '/docs/physics/intertwiner-spaces', label: 'Intertwiner Spaces', format: 'md' },
    { path: '/docs/physics/unified-dynamics', label: 'Unified Dynamics Approach', format: 'md' },
  ];
  
  const implementationDocs = [
    { path: '/docs/implementation/standalone-guide.html', label: 'Standalone Library Guide', format: 'html' },
    { path: '/docs/implementation/simulation-test.html', label: 'Simulation Test Environment', format: 'html' },
  ];
  
  // Toggle TOC expansion for a specific document
  const toggleTOC = (path: string) => {
    setExpandedTOCs(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Extract TOC from markdown content
  const extractTOC = (content: string): TocItem[] => {
    const toc: TocItem[] = [];
    const lines = content.split('\n');
    
    // Regex to match markdown headings
    const headingRegex = /^(#{1,6})\s+(.+)$/;
    
    lines.forEach(line => {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length;
        const title = match[2];
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        
        toc.push({ id, title, level });
      }
    });
    
    return toc;
  };
  
  // Fetch document metadata and TOC
  useEffect(() => {
    const fetchTOC = async () => {
      const allDocs = [...physicsDocs, ...implementationDocs];
      
      for (const doc of allDocs) {
        // Skip HTML documents - TOC only for markdown
        if (doc.format === 'html' || doc.path.endsWith('.html')) continue;
        
        try {
          // Convert path to file path
          let filePath = doc.path;
          // Remove /docs/ prefix
          filePath = filePath.replace('/docs/', '/');
          // Add .md extension if not present
          if (!filePath.includes('.')) {
            filePath = `${filePath}.md`;
          }
          
          const response = await fetch(`/docs${filePath}`);
          if (response.ok) {
            const content = await response.text();
            const toc = extractTOC(content);
            
            setDocMeta(prev => ({
              ...prev,
              [doc.path]: {
                path: doc.path,
                label: doc.label,
                format: doc.format || 'md',
                toc
              }
            }));
          }
        } catch (error) {
          console.error(`Error fetching TOC for ${doc.path}:`, error);
        }
      }
    };
    
    fetchTOC();
  }, []);
  
  // Auto-expand TOC of the active document
  useEffect(() => {
    if (location.pathname) {
      setExpandedTOCs(prev => ({
        ...prev,
        [location.pathname]: true
      }));
    }
  }, [location.pathname]);
  
  const renderTOCItems = (path: string) => {
    const meta = docMeta[path];
    if (!meta || !meta.toc || meta.toc.length === 0) return null;
    
    return (
      <div className="pl-4 pb-2">
        <ul className="border-l border-gray-200 space-y-1">
          {meta.toc.map((item, index) => (
            // Only render h1, h2, and h3 to avoid overwhelming the TOC
            item.level <= 3 && (
              <li 
                key={`${item.id}-${index}`}
                className={`pl-${item.level * 2} text-xs`}
              >
                <a 
                  href={`${path}#${item.id}`}
                  className="text-gray-600 hover:text-blue-600 block py-1 truncate"
                  style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                >
                  {item.title}
                </a>
              </li>
            )
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="py-4">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center">
          <FaBook className="mr-2" />
          Documentation
        </h2>
      </div>
      
      {/* Physics Section */}
      <div className="mb-6">
        <div className="px-4 mb-2 text-sm font-medium text-gray-600 flex items-center">
          <FaAtom className="mr-2" />
          Physics & Theory
        </div>
        <ul className="space-y-1">
          {physicsDocs.map(doc => (
            <li key={doc.path}>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {docMeta[doc.path]?.toc?.length > 0 && (
                    <button 
                      onClick={() => toggleTOC(doc.path)}
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {expandedTOCs[doc.path] ? 
                        <FaChevronDown size={12} /> : 
                        <FaChevronRight size={12} />
                      }
                    </button>
                  )}
                  <NavLink 
                    to={doc.path}
                    className={({ isActive }) => 
                      `flex-1 block px-2 py-2 text-sm ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'}`
                    }
                  >
                    {doc.label}
                  </NavLink>
                </div>
                
                {expandedTOCs[doc.path] && renderTOCItems(doc.path)}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Implementation Section */}
      <div>
        <div className="px-4 mb-2 text-sm font-medium text-gray-600 flex items-center">
          <FaCode className="mr-2" />
          Implementation
        </div>
        <ul className="space-y-1">
          {implementationDocs.map(doc => (
            <li key={doc.path}>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {docMeta[doc.path]?.toc?.length > 0 && (
                    <button 
                      onClick={() => toggleTOC(doc.path)}
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {expandedTOCs[doc.path] ? 
                        <FaChevronDown size={12} /> : 
                        <FaChevronRight size={12} />
                      }
                    </button>
                  )}
                  <NavLink 
                    to={doc.path}
                    className={({ isActive }) => 
                      `flex-1 block px-2 py-2 text-sm ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'}`
                    }
                  >
                    {doc.label}
                  </NavLink>
                </div>
                
                {expandedTOCs[doc.path] && renderTOCItems(doc.path)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocsSidebar;