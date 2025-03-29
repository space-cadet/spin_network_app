import React, { createContext, useContext, useState } from 'react';
import { SpinNetwork } from '../models/types';
import { createEmptyNetwork } from '../models/networkModel';

interface NetworkContextType {
  network: SpinNetwork;
  setNetwork: (network: SpinNetwork) => void;
  selectedElementId: string | null;
  selectedElementType: 'node' | 'edge' | null;
  setSelectedElement: (id: string | null, type: 'node' | 'edge' | null) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<SpinNetwork>(createEmptyNetwork());
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<'node' | 'edge' | null>(null);

  const setSelectedElement = (id: string | null, type: 'node' | 'edge' | null) => {
    setSelectedElementId(id);
    setSelectedElementType(type);
  };

  return (
    <NetworkContext.Provider 
      value={{ 
        network, 
        setNetwork, 
        selectedElementId, 
        selectedElementType, 
        setSelectedElement 
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
