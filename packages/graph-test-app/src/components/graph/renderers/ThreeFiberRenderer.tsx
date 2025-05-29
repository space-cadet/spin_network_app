import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { GraphologyAdapter } from '../../../../graph-core/src/core/GraphologyAdapter';
import * as THREE from 'three';

// Global reference to the current graph instance (shared with SigmaRenderer)
let currentGraphInstance: GraphologyAdapter | null = null;

export const setCurrentGraphInstance = (graph: GraphologyAdapter | null) => {
  currentGraphInstance = graph;
};

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

interface GraphNodes3DProps {
  nodes: Node3DData[];
}

interface GraphEdges3DProps {
  edges: Edge3DData[];
}

const GraphNodes3D: React.FC<GraphNodes3DProps> = ({ nodes }) => {
  return (
    <>
      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[node.size / 10, 16, 16]} />
          <meshStandardMaterial color={node.color} />
        </mesh>
      ))}
    </>
  );
};

const GraphEdges3D: React.FC<GraphEdges3DProps> = ({ edges }) => {
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
          <mesh key={edge.id} position={position.toArray()} quaternion={quaternion.toArray()}>
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshStandardMaterial color={edge.color} />
          </mesh>
        );
      })}
    </>
  );
};

interface ThreeFiberRendererProps {
  className?: string;
}

export const ThreeFiberRenderer: React.FC<ThreeFiberRendererProps> = ({ className }) => {
  const graphId = useSelector((state: RootState) => state.graph.graphId);

  const { nodes3D, edges3D } = useMemo(() => {
    if (!currentGraphInstance || !graphId) {
      return { nodes3D: [], edges3D: [] };
    }

    const graphInstance = currentGraphInstance.getGraphologyInstance();
    const nodes3D: Node3DData[] = [];
    const edges3D: Edge3DData[] = [];
    
    // Convert 2D positions to 3D (add z-coordinate)
    graphInstance.forEachNode((nodeId, attributes) => {
      const x = attributes.x || 0;
      const y = attributes.y || 0;
      const z = Math.random() * 100 - 50; // Random z for now
      
      nodes3D.push({
        id: nodeId,
        position: [x, y, z],
        color: attributes.color || '#3b82f6',
        size: attributes.size || 8
      });
    });

    // Create edge data with 3D positions
    const nodePositions = new Map<string, [number, number, number]>();
    nodes3D.forEach(node => {
      nodePositions.set(node.id, node.position);
    });

    graphInstance.forEachEdge((edgeId, attributes, source, target) => {
      const sourcePos = nodePositions.get(source);
      const targetPos = nodePositions.get(target);
      
      if (sourcePos && targetPos) {
        edges3D.push({
          id: edgeId,
          sourcePosition: sourcePos,
          targetPosition: targetPos,
          color: attributes.color || '#94a3b8'
        });
      }
    });

    return { nodes3D, edges3D };
  }, [graphId]);

  return (
    <div className={`w-full h-full ${className || ''}`} style={{ minHeight: '400px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[200, 200, 200]} />
        <OrbitControls enablePan enableZoom enableRotate />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {/* Graph Components */}
        <GraphNodes3D nodes={nodes3D} />
        <GraphEdges3D edges={edges3D} />
      </Canvas>
    </div>
  );
};
