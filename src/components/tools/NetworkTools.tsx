import React, { useState } from 'react';
import { FaPlus, FaTable, FaCircle, FaRandom } from 'react-icons/fa';
import { useNetwork } from '../../context/NetworkContext';
import { createEmptyNetwork } from '../../models/networkModel';
import { 
  createLatticeNetwork, 
  createCircularNetwork, 
  createRandomNetwork 
} from '../../utils/networkGenerators';

const NetworkTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'templates'>('create');
  const { setNetwork } = useNetwork();
  
  // Network template parameters
  const [latticeParams, setLatticeParams] = useState({
    rows: 4,
    columns: 4,
    defaultIntertwiner: 1,
    defaultSpin: 0.5
  });
  
  const [circularParams, setCircularParams] = useState({
    nodes: 6,
    radius: 200,
    defaultIntertwiner: 1,
    defaultSpin: 0.5,
    connectAll: false
  });
  
  const [randomParams, setRandomParams] = useState({
    nodes: 10,
    edgeProbability: 0.3,
    defaultIntertwiner: 1,
    defaultSpin: 0.5
  });
  
  const handleCreateEmpty = () => {
    setNetwork(createEmptyNetwork('Empty Network'));
  };
  
  const handleCreateLattice = () => {
    setNetwork(createLatticeNetwork(latticeParams));
  };
  
  const handleCreateCircular = () => {
    setNetwork(createCircularNetwork(circularParams));
  };
  
  const handleCreateRandom = () => {
    setNetwork(createRandomNetwork(randomParams));
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
          <div className="card p-4">
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FaTable className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Lattice Network</h3>
                <p className="text-sm text-gray-500">Regular grid pattern</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="form-group">
                <label className="form-label text-sm">Rows</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={latticeParams.rows}
                  onChange={(e) => setLatticeParams({
                    ...latticeParams,
                    rows: parseInt(e.target.value) || 2
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Columns</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={latticeParams.columns}
                  onChange={(e) => setLatticeParams({
                    ...latticeParams,
                    columns: parseInt(e.target.value) || 2
                  })}
                  className="form-input"
                />
              </div>
            </div>
            
            <button
              className="btn btn-sm btn-primary w-full"
              onClick={handleCreateLattice}
            >
              Create Lattice Network
            </button>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FaCircle className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Circular Network</h3>
                <p className="text-sm text-gray-500">Nodes arranged in a circle</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="form-group">
                <label className="form-label text-sm">Nodes</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={circularParams.nodes}
                  onChange={(e) => setCircularParams({
                    ...circularParams,
                    nodes: parseInt(e.target.value) || 3
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Radius</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={circularParams.radius}
                  onChange={(e) => setCircularParams({
                    ...circularParams,
                    radius: parseInt(e.target.value) || 200
                  })}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={circularParams.connectAll}
                  onChange={(e) => setCircularParams({
                    ...circularParams,
                    connectAll: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Connect all nodes</span>
              </label>
            </div>
            
            <button
              className="btn btn-sm btn-primary w-full"
              onClick={handleCreateCircular}
            >
              Create Circular Network
            </button>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FaRandom className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Random Network</h3>
                <p className="text-sm text-gray-500">Randomly generated network</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="form-group">
                <label className="form-label text-sm">Nodes</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={randomParams.nodes}
                  onChange={(e) => setRandomParams({
                    ...randomParams,
                    nodes: parseInt(e.target.value) || 3
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Edge Probability</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={randomParams.edgeProbability}
                  onChange={(e) => setRandomParams({
                    ...randomParams,
                    edgeProbability: parseFloat(e.target.value) || 0.3
                  })}
                  className="form-input"
                />
              </div>
            </div>
            
            <button
              className="btn btn-sm btn-primary w-full"
              onClick={handleCreateRandom}
            >
              Create Random Network
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
