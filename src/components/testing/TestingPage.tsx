import React, { useState, useEffect, useRef } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedResourceId } from '../../store/slices/testingSlice';
import { RootState } from '../../store';

type TestResource = {
  id: string;
  title: string;
  description: string;
  path: string;
};

const testResources: TestResource[] = [
  {
    id: 'standalone-guide',
    title: 'Standalone Implementation Guide',
    description: 'Comprehensive guide for implementing and using the standalone spin network library.',
    path: '/docs/implementation/standalone-guide.html'
  },
  {
    id: 'simulation-test',
    title: 'Simulation Test Page',
    description: 'Interactive testing environment for the spin network simulation with visualizations.',
    path: '/docs/implementation/simulation-test.html'
  },
  {
    id: 'tensor-sandbox',
    title: 'Tensor Sandbox',
    description: 'Experimental sandbox for working with tensors and state vectors in spin networks.',
    path: '/docs/implementation/tensor-sandbox.html'
  }
];

const TestingPage: React.FC = () => {
  const dispatch = useDispatch();
  const selectedResourceId = useSelector((state: RootState) => state.testing.selectedResourceId);
  const selectedResource = testResources.find(resource => resource.id === selectedResourceId) || testResources[0];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 180px)');

  useEffect(() => {
    // Adjust iframe when window is resized
    const handleResize = () => {
      setIframeHeight('calc(100vh - 180px)');
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Testing Resources</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a resource to view
          </p>
        </div>
        <nav className="mt-2">
          {testResources.map((resource) => (
            <button
              key={resource.id}
              className={`w-full text-left px-4 py-3 flex items-start hover:bg-gray-100 ${
                selectedResource.id === resource.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => dispatch(setSelectedResourceId(resource.id))}
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
          <iframe
            ref={iframeRef}
            src={selectedResource.path}
            className="w-full border-0"
            style={{ height: iframeHeight }}
            title={selectedResource.title}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default TestingPage;
