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
          <sphereGeometry args={[Math.max(node.size * 0.5, 3), 16, 16]} />
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
        // Cylinders are aligned along Y-axis by default, so we need to rotate to align with direction
        const up = new THREE.Vector3(0, 1, 0);
        direction.normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        
        return (
          <mesh key={edge.id} position={position.toArray()} quaternion={quaternion}>
            <cylinderGeometry args={[0.5, 0.5, length, 8]} />
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
  const { nodes3D, edges3D, cameraPosition } = useMemo(() => {
    const nodes3D: Node3DData[] = [];
    const edges3D: Edge3DData[] = [];
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    renderGraph.getAllRenderNodes().forEach(([nodeId, node]) => {
      const x = node.position.x;
      const y = node.position.y;
      const z = node.position.z;
      
      // Track bounds
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
      
      nodes3D.push({
        id: nodeId,
        position: [x, y, z],
        color: node.renderProps?.color || '#3b82f6',
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
          color: edge.renderProps?.color || '#94a3b8'
        });
      }
    });

    // Calculate camera position based on graph bounds
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    
    // Position camera at a distance that fits the entire graph
    const distance = Math.max(maxRange * 2, 50);
    const cameraPosition: [number, number, number] = [
      centerX + distance,
      centerY + distance,
      centerZ + distance
    ];

    return { nodes3D, edges3D, cameraPosition };
  }, [renderGraph]);

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ minHeight: '400px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={cameraPosition} />
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
