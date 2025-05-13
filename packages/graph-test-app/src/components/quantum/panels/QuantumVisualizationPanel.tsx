import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@spin-network/template-base/src/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const QuantumVisualizationPanel: React.FC = () => {
  // Example data - this would come from quantum state
  const data = [
    { state: '|0⟩', amplitude: 0.7071 },
    { state: '|1⟩', amplitude: 0.7071 }
  ];

  return (
    <div className="p-4 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>State Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <BarChart width={500} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amplitude" fill="#8884d8" />
            </BarChart>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};