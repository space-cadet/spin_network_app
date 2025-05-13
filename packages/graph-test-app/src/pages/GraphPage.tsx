// src/pages/GraphPage.tsx
import React from 'react';
import { Activity } from 'lucide-react';
import { SharedLayout } from '../components/layout/SharedLayout';
import { ResizablePanelLayout } from '../components/layout/ResizablePanelLayout';
import { ControlPanel } from '../components/panels/ControlPanel';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { GraphCanvas } from '../components/graph/GraphCanvas';

const GraphPage: React.FC = () => {
  return (
    <SharedLayout
      title="Graph Library Test"
      titleIcon={<Activity className="w-6 h-6" />}
    >
      <ResizablePanelLayout
        panelPrefix="graph"
        leftPanel={<ControlPanel />}
        mainPanel={<GraphCanvas />}
        rightPanel={<PropertiesPanel />}
      />
    </SharedLayout>
  );
};

export default GraphPage;