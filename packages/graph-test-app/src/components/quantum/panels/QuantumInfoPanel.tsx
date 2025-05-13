import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@spin-network/template-base/src/components/ui/card';

export const QuantumInfoPanel: React.FC = () => {
  return (
    <div className="p-4 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Quantum State Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">State Vector</h3>
              <pre className="bg-muted p-2 rounded">
                0.7071|0⟩ + 0.7071|1⟩
              </pre>
            </div>
            <div>
              <h3 className="font-medium">Probabilities</h3>
              <div className="space-y-1">
                <div>|0⟩: 50%</div>
                <div>|1⟩: 50%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};