import React from 'react';
import { Activity } from 'lucide-react';
import { SharedLayout } from '../components/layout/SharedLayout';
import { ResizablePanelLayout } from '../components/layout/ResizablePanelLayout';
import { ControlPanel } from '../components/panels/ControlPanel';
import { GraphWorkspace } from '../components/workspace/GraphWorkspace';
import { GraphProperties } from '../components/panels/GraphProperties';

const GraphPage: React.FC = () => {
  return (
    <SharedLayout
      title="Graph Library Test"
      titleIcon={<Activity className="w-6 h-6" />}
    >
      <ResizablePanelLayout
        panelPrefix="graph"
        leftPanel={<ControlPanel />}
        mainPanel={<GraphWorkspace />}
        rightPanel={<GraphProperties />}
        bottomPanel={<div className="p-4">Bottom Panel Content</div>}
      />
    </SharedLayout>
  );
};

export default GraphPage;