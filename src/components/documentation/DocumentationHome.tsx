import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaAtom, FaCode, FaArrowRight } from 'react-icons/fa';

const DocumentationHome: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <FaBook className="mr-3 text-blue-600" />
          Spin Network Documentation
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive resources to understand spin networks from theory to implementation.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Physics Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <FaAtom className="text-xl text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Physics & Theory</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Explore the mathematical foundations and physical theory behind spin networks.
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/physics/physics-notebook" className="text-blue-600 hover:underline">
                Physics Notebook
              </Link>
            </li>
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/physics/mathematical-roadmap" className="text-blue-600 hover:underline">
                Mathematical Foundations
              </Link>
            </li>
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/physics/intertwiner-spaces" className="text-blue-600 hover:underline">
                Intertwiner Spaces
              </Link>
            </li>
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/physics/unified-dynamics" className="text-blue-600 hover:underline">
                Unified Dynamics Approach
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Implementation Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <FaCode className="text-xl text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Implementation Details</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Guides and resources for implementing and testing spin network simulations.
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/implementation/standalone-guide" className="text-blue-600 hover:underline">
                Standalone Library Guide
              </Link>
            </li>
            <li className="flex items-center">
              <FaArrowRight className="text-blue-500 mr-2 text-sm" />
              <Link to="/docs/implementation/simulation-test" className="text-blue-600 hover:underline">
                Simulation Test Environment
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-medium text-blue-700 mb-2">About the Documentation</h3>
        <p className="text-gray-700">
          This documentation hub centralizes resources for the Spin Network project, making it easier to access 
          technical documents, guides, and theoretical explanations. All content is accessible from within the 
          application interface for a seamless experience.
        </p>
      </div>
    </div>
  );
};

export default DocumentationHome;