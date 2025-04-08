import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  selectSelectedElement, 
  selectElementByTypeAndId,
  selectNetwork
} from '../../store/selectors';
import {
  selectAllNodeTypes,
  selectAllEdgeTypes
} from '../../store/selectors/typeSelectors';
import { 
  updateNetworkNode, 
  updateNetworkEdge 
} from '../../store/slices/networkSlice';
import { NetworkNode, NetworkEdge } from '../../models/types';
import CollapsibleSection from '../common/CollapsibleSection';

const PropertiesPanel: React.FC = () => {
  const selectedElement = useAppSelector(selectSelectedElement);
  const element = useAppSelector(selectElementByTypeAndId);
  const network = useAppSelector(selectNetwork);
  const nodeTypes = useAppSelector(selectAllNodeTypes);
  const edgeTypes = useAppSelector(selectAllEdgeTypes);
  const dispatch = useAppDispatch();
  
  // Local state for form values
  const [formValues, setFormValues] = useState<any>({});
  
  // Calculate edge details manually instead of using a conditional selector
  const edgeDetails = React.useMemo(() => {
    if (selectedElement.type !== 'edge' || !selectedElement.id) return null;
    
    const edge = network.edges.find(edge => edge.id === selectedElement.id);
    if (!edge) return null;
    
    const sourceNode = network.nodes.find(node => node.id === edge.source);
    const targetNode = network.nodes.find(node => node.id === edge.target);
    
    return {
      edge,
      sourceNode,
      targetNode
    };
  }, [selectedElement.id, selectedElement.type, network.edges, network.nodes]);
  
  // Update local state when selected element changes
  useEffect(() => {
    if (element) {
      setFormValues({ ...element });
    } else {
      setFormValues({});
    }
  }, [element]);
  
  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedElement.id || !selectedElement.type) return;
    
    if (selectedElement.type === 'node') {
      const updates: Partial<NetworkNode> = {
        label: formValues.label,
        type: formValues.type || 'regular',
        intertwiner: parseFloat(formValues.intertwiner),
        position: {
          x: parseFloat(formValues.position.x),
          y: parseFloat(formValues.position.y)
        }
      };
      
      dispatch(updateNetworkNode({ 
        id: selectedElement.id, 
        updates 
      }));
    } else if (selectedElement.type === 'edge') {
      const updates: Partial<NetworkEdge> = {
        label: formValues.label,
        type: formValues.type || 'regular',
        spin: parseFloat(formValues.spin)
      };
      
      dispatch(updateNetworkEdge({ 
        id: selectedElement.id, 
        updates 
      }));
    }
  };

  if (!element) {
    return (
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium mb-4">Properties</h2>
        <p className="text-gray-500 text-sm">No element selected</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <h2 className="text-lg font-medium mb-4">
        {selectedElement.type === 'node' ? 'Node' : 'Edge'} Properties
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollapsibleSection title="Basic Information" defaultExpanded={true}>
          <div className="form-group">
            <label className="form-label">ID</label>
            <input
              type="text"
              value={element.id}
              readOnly
              className="form-input bg-gray-50"
            />
          </div>
          
          <div className="form-group mt-3">
            <label className="form-label">Label</label>
            <input
              type="text"
              value={formValues.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="form-input"
            />
          </div>
        </CollapsibleSection>
        
        {selectedElement.type === 'node' && (
          <>
            <CollapsibleSection title="Type" defaultExpanded={true}>
              <div className="form-group">
                <label className="form-label">Node Type</label>
                <select
                  value={formValues.type || 'regular'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="form-select w-full"
                >
                  {nodeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center mt-2">
                  <div 
                    className="w-8 h-8 mr-2 rounded-md" 
                    style={{
                      backgroundColor: nodeTypes.find(t => t.id === (formValues.type || 'regular'))?.color || '#4f46e5',
                      borderColor: nodeTypes.find(t => t.id === (formValues.type || 'regular'))?.borderColor || '#4338ca',
                      borderWidth: `${nodeTypes.find(t => t.id === (formValues.type || 'regular'))?.borderWidth || 2}px`,
                      borderStyle: nodeTypes.find(t => t.id === (formValues.type || 'regular'))?.borderStyle || 'solid'
                    }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {nodeTypes.find(t => t.id === (formValues.type || 'regular'))?.description || 'Default node type'}
                  </span>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Node Properties" defaultExpanded={true}>
              <div className="form-group">
                <label className="form-label">Intertwiner Value</label>
                <input
                  type="number"
                  step="0.5"
                  value={formValues.intertwiner || 0}
                  onChange={(e) => handleInputChange('intertwiner', e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group mt-3">
                <label className="form-label">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formValues.position?.x || 0}
                    onChange={(e) => handleInputChange('position', { 
                      ...formValues.position, 
                      x: e.target.value 
                    })}
                    className="form-input"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={formValues.position?.y || 0}
                    onChange={(e) => handleInputChange('position', { 
                      ...formValues.position, 
                      y: e.target.value 
                    })}
                    className="form-input"
                    placeholder="Y"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}
        
        {selectedElement.type === 'edge' && (
          <>
            <CollapsibleSection title="Type" defaultExpanded={true}>
              <div className="form-group">
                <label className="form-label">Edge Type</label>
                <select
                  value={formValues.type || 'regular'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="form-select w-full"
                >
                  {edgeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center mt-2">
                  <div className="w-12 flex items-center mr-2">
                    <div
                      className="w-full h-1"
                      style={{
                        backgroundColor: edgeTypes.find(t => t.id === (formValues.type || 'regular'))?.color || '#3b82f6',
                        height: `${edgeTypes.find(t => t.id === (formValues.type || 'regular'))?.thickness || 3}px`,
                        borderBottomStyle: edgeTypes.find(t => t.id === (formValues.type || 'regular'))?.lineStyle || 'solid'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {edgeTypes.find(t => t.id === (formValues.type || 'regular'))?.description || 'Default edge type'}
                  </span>
                </div>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Edge Properties" defaultExpanded={true}>
              <div className="form-group">
                <label className="form-label">Spin Value</label>
                <input
                  type="number"
                  step="0.5"
                  value={formValues.spin || 0}
                  onChange={(e) => handleInputChange('spin', e.target.value)}
                  className="form-input"
                />
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Connections" defaultExpanded={true}>
              <div className="form-group">
                <label className="form-label">Source</label>
                <div className="flex">
                  <input
                    type="text"
                    value={formValues.source || ''}
                    readOnly
                    className="form-input bg-gray-50 flex-1"
                  />
                  {edgeDetails?.sourceNode && (
                    <span className="ml-2 p-2 bg-gray-100 rounded text-sm">
                      {edgeDetails.sourceNode.label || `Node ${edgeDetails.sourceNode.id}`}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="form-group mt-3">
                <label className="form-label">Target</label>
                <div className="flex">
                  <input
                    type="text"
                    value={formValues.target || ''}
                    readOnly
                    className="form-input bg-gray-50 flex-1"
                  />
                  {edgeDetails?.targetNode && (
                    <span className="ml-2 p-2 bg-gray-100 rounded text-sm">
                      {edgeDetails.targetNode.label || `Node ${edgeDetails.targetNode.id}`}
                    </span>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}
        
        <div className="mt-4">
          <button type="submit" className="btn btn-primary">
            Update Properties
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertiesPanel;
