// src/pages/QuantumPage.tsx
import React from 'react';
import { FlaskConical } from 'lucide-react';
import { SharedLayout } from '../components/layout/SharedLayout';
import { ResizablePanelLayout } from '../components/layout/ResizablePanelLayout';
import { QuantumStatePanel } from '../components/quantum/panels/QuantumStatePanel';
import { QuantumControlPanel } from '../components/quantum/panels/QuantumControlPanel';
import { QuantumInfoPanel } from '../components/quantum/panels/QuantumInfoPanel';

const QuantumPage: React.FC = () => {
  return (
    <SharedLayout
      title="Quantum Module Demo"
      titleIcon={<FlaskConical className="w-6 h-6" />}
    >
      <ResizablePanelLayout
        panelPrefix="quantum"
        leftPanel={<QuantumControlPanel />}
        mainPanel={<QuantumStatePanel />}
        rightPanel={<QuantumInfoPanel />}
      />
    </SharedLayout>
  );
};

export default QuantumPage;