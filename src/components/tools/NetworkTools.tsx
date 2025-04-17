import React, { useState } from 'react';
import { FaPlus, FaTable, FaCircle, FaRandom, FaTrash } from 'react-icons/fa';
import FileOperations from '../common/FileOperations';
import ResetButton from '../common/ResetButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createEmpty, 
  createLattice, 
  createCircular, 
  createRandom 
} from '../../store/slices/networkSlice';
import { setInteractionMode } from '../../store/slices/uiSlice';
import { selectInteractionMode } from '../../store/selectors';
import CollapsibleSection from '../common/CollapsibleSection';

// Network type options
type NetworkType = 'empty' | 'lattice' | 'circular' | 'random';

const NetworkTools: React.FC = () => {
  const dispatch = useAppDispatch();
  const interactionMode = useAppSelector(selectInteractionMode);
  
  // Common parameters
  const [networkName, setNetworkName] = useState('My Network');
  const [networkType, setNetworkType] = useState<NetworkType>('empty');
  
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
  
  const handleCreateNetwork = () => {
    switch(networkType) {
      case 'empty':
        dispatch(createEmpty(networkName));
        break;
      case 'lattice':
        dispatch(createLattice({
          ...latticeParams,
          name: networkName
        }));
        break;
      case 'circular':
        dispatch(createCircular({
          ...circularParams,
          name: networkName
        }));
        break;
      case 'random':
        dispatch(createRandom({
          ...randomParams,
          name: networkName
        }));
        break;
    }
  };
  
  // Toggle interaction modes
  const handleSetMode = (mode: 'addNode' | 'addEdge' | 'delete') => {
    // If already in this mode, switch back to select mode
    if (interactionMode === mode) {
      dispatch(setInteractionMode('select'));
    } else {
      dispatch(setInteractionMode(mode));
    }
  };

  // Network type icons
  const networkTypeIcons = {
    empty: <FaPlus className="text-primary" />,
    lattice: <FaTable className="text-primary" />,
    circular: <FaCircle className="text-primary" />,
    random: <FaRandom className="text-primary" />
  };

  // Network type descriptions
  const networkTypeDescriptions = {
    empty: "Create a blank network",
    lattice: "Regular grid pattern",
    circular: "Nodes arranged in a circle",
    random: "Randomly generated network"
  };

  return (
    <CollapsibleSection
      title="Network Tools"
      defaultExpanded={true}
      className="border-b border-gray-200"
      contentClassName="p-4"
    >
      {/* Network Creation */}
      <CollapsibleSection title="Network Creation" defaultExpanded={true}>
        <div className="card p-4">
          <div className="form-group mb-4">
            <label className="form-label text-sm">Network Name</label>
            <input
              type="text"
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              placeholder="Enter network name"
              className="form-input w-full"
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label text-sm">Network Type</label>
            <div className="flex space-x-2 mb-2">
              {(['empty', 'lattice', 'circular', 'random'] as NetworkType[]).map(type => (
                <button
                  key={type}
                  className={`flex-1 py-2 px-3 rounded-md flex flex-col items-center justify-center ${
                    networkType === type 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setNetworkType(type)}
                >
                  <div className="p-2">
                    {networkTypeIcons[type]}
                  </div>
                  <span className="text-xs font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">{networkTypeDescriptions[networkType]}</p>
          </div>
          
          {/* Lattice Parameters */}
          {networkType === 'lattice' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
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
          )}
          
          {/* Circular Parameters */}
          {networkType === 'circular' && (
            <>
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
              
              <div className="form-group mb-4">
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
            </>
          )}
          
          {/* Random Parameters */}
          {networkType === 'random' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
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
          )}
          
          <button
            className="btn btn-sm btn-primary w-full"
            onClick={handleCreateNetwork}
          >
            Create Network
          </button>
        </div>
      </CollapsibleSection>
      
      {/* Element Operations */}
      <CollapsibleSection title="Element Operations" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaPlus className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add Node</h3>
              <p className="text-sm text-gray-500">Add a new node to the network</p>
            </div>
            <button 
              className={`btn btn-sm ${interactionMode === 'addNode' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSetMode('addNode')}
            >
              {interactionMode === 'addNode' ? 'Cancel' : 'Add'}
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
            <button 
              className={`btn btn-sm ${interactionMode === 'addEdge' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSetMode('addEdge')}
            >
              {interactionMode === 'addEdge' ? 'Cancel' : 'Add'}
            </button>
          </div>
          
          <div className="card p-4 flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <FaTrash className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Delete Elements</h3>
              <p className="text-sm text-gray-500">Remove nodes or edges</p>
            </div>
            <button 
              className={`btn btn-sm ${interactionMode === 'delete' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSetMode('delete')}
            >
              {interactionMode === 'delete' ? 'Cancel' : 'Delete'}
            </button>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* File Operations */}
      <CollapsibleSection title="File Operations" defaultExpanded={true}>
        <div className="flex justify-between mb-4">
          <FileOperations />
        </div>
        <div className="flex justify-end">
          <ResetButton />
        </div>
      </CollapsibleSection>
      
      {/* Additional Tools */}
      <CollapsibleSection title="Default Properties" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Default Intertwiner Value</label>
            <select className="form-input">
              <option>0</option>
              <option>1/2</option>
              <option>1</option>
              <option>3/2</option>
              <option>2</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Spin Value</label>
            <select className="form-input">
              <option>0</option>
              <option>1/2</option>
              <option>1</option>
              <option>3/2</option>
              <option>2</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>
    </CollapsibleSection>
  );
};

export default NetworkTools;