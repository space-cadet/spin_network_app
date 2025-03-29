import React, { useState } from 'react';
import { FaPlus, FaTable, FaCircle, FaRandom } from 'react-icons/fa';

interface NetworkToolsProps {
  onCreateNetwork: (type: string) => void;
}

const NetworkTools: React.FC<NetworkToolsProps> = ({ onCreateNetwork }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'templates'>('create');
  
  const handleCreateEmpty = () => {
    onCreateNetwork('empty');
  };
  
  const handleCreateLattice = () => {
    onCreateNetwork('lattice');
  };
  
  const handleCreateCircular = () => {
    onCreateNetwork('circular');
  };
  
  const handleCreateRandom = () => {
    onCreateNetwork('random');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Network Tools</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 ${
            activeTab === 'create'
              ? 'text-primary border-b-2 border-primary font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'templates'
              ? 'text-primary border-b-2 border-primary font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>
      
      {/* Create Tab Content */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaPlus className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Empty Network</h3>
              <p className="text-sm text-gray-500">Create a blank network</p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleCreateEmpty}
            >
              Create
            </button>
          </div>
          
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaPlus className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add Node</h3>
              <p className="text-sm text-gray-500">Add a new node to the network</p>
            </div>
            <button className="btn btn-sm btn-outline">
              Add
            </button>
          </div>
          
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaPlus className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add Edge</h3>
              <p className="text-sm text-gray-500">Connect nodes with an edge</p>
            </div>
            <button className="btn btn-sm btn-outline">
              Add
            </button>
          </div>
        </div>
      )}
      
      {/* Templates Tab Content */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaTable className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Lattice Network</h3>
              <p className="text-sm text-gray-500">Regular grid pattern</p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleCreateLattice}
            >
              Create
            </button>
          </div>
          
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaCircle className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Circular Network</h3>
              <p className="text-sm text-gray-500">Nodes arranged in a circle</p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleCreateCircular}
            >
              Create
            </button>
          </div>
          
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaRandom className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Random Network</h3>
              <p className="text-sm text-gray-500">Randomly generated network</p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleCreateRandom}
            >
              Create
            </button>
          </div>
        </div>
      )}
      
      {/* Additional Tools */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Node Properties</h3>
        <div className="form-group">
          <label className="form-label">Intertwiner Value</label>
          <select className="form-input">
            <option>0</option>
            <option>1/2</option>
            <option>1</option>
            <option>3/2</option>
            <option>2</option>
          </select>
        </div>
        
        <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">Edge Properties</h3>
        <div className="form-group">
          <label className="form-label">Spin Value</label>
          <select className="form-input">
            <option>0</option>
            <option>1/2</option>
            <option>1</option>
            <option>3/2</option>
            <option>2</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default NetworkTools;
