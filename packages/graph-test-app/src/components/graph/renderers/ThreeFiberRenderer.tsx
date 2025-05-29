import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { IRenderGraph } from '@spin-network/graph-ui/src/types/rendering';

interface Node3DData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface Edge3DData {
  id: string;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
}

interface ThreeFiberRendererProps {
  renderGraph: IRenderGraph;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

interface GraphNodes3DProps {
  nodes: Node3DData[];
  onNodeClick?: (nodeId: string) => void;
}

interface GraphEdges3DProps {
  edges: Edge3DData[];
  onEdgeClick?: (edgeId: string) => void;
}

const GraphNodes3D: React.FC<GraphNodes3DProps> = ({ nodes, onNodeClick }) => {
  return (
    <>
      {nodes.map((node) => (
        <mesh 
          key={node.id} 
          position={node.position}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick?.(node.id);
          }}
        >
          <sphereGeometry args={[node.size / 10, 16, 16]} />
          <meshStandardMaterial color={node.color} />
        </mesh>
      ))}
    </>
  );
};

const GraphEdges3D: React.FC<GraphEdges3DProps> = ({ edges, onEdgeClick }) => {
  return (
    <>
      {edges.map((edge) => {
        const start = new THREE.Vector3(...edge.sourcePosition);
        const end = new THREE.Vector3(...edge.targetPosition);
        const direction = end.clone().sub(start);
        const length = direction.length();
        const position = start.clone().add(direction.clone().multiplyScalar(0.5));
        
        // Calculate rotation to align cylinder with edge direction
        const orientation = new THREE.Matrix4();
        orientation.lookAt(start, end, new THREE.Vector3(0, 1, 0));
        const quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(orientation);
        
        return (
          <mesh key={edge.id} position={position.toArray()} quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}>
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshStandardMaterial color={edge.color} />
          </mesh>
        );
      })}
    </>
  );
};

export const ThreeFiberRenderer: React.FC<ThreeFiberRendererProps> = ({ 
  renderGraph,
  className,
  onNodeClick,
  onEdgeClick
}) => {
  const { nodes3D, edges3D } = useMemo(() => {
    const nodes3D: Node3DData[] = [];
    const edges3D: Edge3DData[] = [];
    
    renderGraph.getAllRenderNodes().forEach(([nodeId, node]) => {
      nodes3D.push({
        id: nodeId,
        position: [node.position.x, node.position.y, node.position.z],
        color: node.renderProps?.color || '#9ca3af',
        size: node.renderProps?.size || 5
      });
    });

    renderGraph.getAllRenderEdges().forEach(([edgeId, edge]) => {
      const sourcePos = renderGraph.getNodePosition(edge.source);
      const targetPos = renderGraph.getNodePosition(edge.target);
      
      if (sourcePos && targetPos) {
        edges3D.push({
          id: edgeId,
          sourcePosition: [sourcePos.x, sourcePos.y, sourcePos.z],
          targetPosition: [targetPos.x, targetPos.y, targetPos.z],
          color: edge.renderProps?.color || '#9ca3af'
        });
      }
    });

    return { nodes3D, edges3D };
  }, [renderGraph]);

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ minHeight: '400px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[200, 200, 200]} />
        <OrbitControls enablePan enableZoom enableRotate />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        <GraphNodes3D nodes={nodes3D} onNodeClick={onNodeClick} />
        <GraphEdges3D edges={edges3D} onEdgeClick={onEdgeClick} />
      </Canvas>
    </div>
  );
};
