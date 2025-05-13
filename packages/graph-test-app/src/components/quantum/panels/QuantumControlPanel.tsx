import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@spin-network/template-base/src/components/ui/card';
import { Button } from '@spin-network/template-base/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@spin-network/template-base/src/components/ui/tabs';

export const QuantumControlPanel: React.FC = () => {
  return (
    <div className="p-4 h-full">
      <Tabs defaultValue="states" className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => console.log('|0⟩')}>|0⟩</Button>
              <Button onClick={() => console.log('|1⟩')}>|1⟩</Button>
              <Button onClick={() => console.log('|+⟩')}>|+⟩</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => console.log('H')}>H</Button>
              <Button onClick={() => console.log('X')}>X</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};