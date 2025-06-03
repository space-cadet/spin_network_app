/**
 * Tests for 2D Quantum Random Walk
 */

import { describe, it, expect } from 'vitest';
import { lattice2D } from '@spin-network/graph-core/src/core/builders';
import { QuantumWalk2D } from '../../../src/algorithms/quantumWalk';

describe('QuantumWalk2D', () => {
  
  it('should initialize with correct state normalization', () => {
    console.log('\n=== Initialization Test ===');
    const lattice = lattice2D(5, 5);
    const walker = new QuantumWalk2D(lattice, { x: 2, y: 2 });
    
    const distribution = walker.getPositionDistribution();
    const totalProb = Array.from(distribution.values()).reduce((sum, p) => sum + p, 0);
    
    console.log(`Initial position: (2, 2)`);
    console.log(`Total probability: ${(totalProb * 100).toFixed(2)}%`);
    console.log(`Distribution size: ${distribution.size} positions`);
    
    expect(totalProb).toBeCloseTo(1.0, 10);
    expect(distribution.size).toBe(1);
  });

  it('should preserve probability after single step', () => {
    console.log('\n=== Single Step Test ===');
    const lattice = lattice2D(5, 5);
    const walker = new QuantumWalk2D(lattice, { x: 2, y: 2 });
    
    walker.step();
    const distribution = walker.getPositionDistribution();
    const totalProb = Array.from(distribution.values()).reduce((sum, p) => sum + p, 0);
    
    console.log(`After 1 step:`);
    console.log(`Total probability: ${(totalProb * 100).toFixed(2)}%`);
    console.log(`Distribution size: ${distribution.size} positions`);
    
    distribution.forEach((prob, pos) => {
      console.log(`  Position ${pos}: ${(prob * 100).toFixed(2)}%`);
    });
    
    expect(totalProb).toBeCloseTo(1.0, 10);
  });

  it('should preserve probability after multiple steps', () => {
    console.log('\n=== Multiple Steps Test ===');
    const lattice = lattice2D(7, 7);
    const walker = new QuantumWalk2D(lattice, { x: 3, y: 3 });
    
    for (let steps = 1; steps <= 5; steps++) {
      walker.step();
      const distribution = walker.getPositionDistribution();
      const totalProb = Array.from(distribution.values()).reduce((sum, p) => sum + p, 0);
      
      console.log(`After ${steps} steps: probability = ${(totalProb * 100).toFixed(2)}%, positions = ${distribution.size}`);
      
      expect(totalProb).toBeCloseTo(1.0, 8);
    }
  });

  it('should handle boundary conditions correctly', () => {
    console.log('\n=== Boundary Test ===');
    const lattice = lattice2D(3, 3);
    const walker = new QuantumWalk2D(lattice, { x: 0, y: 0 }); // Corner position
    
    walker.evolve(3);
    const distribution = walker.getPositionDistribution();
    const totalProb = Array.from(distribution.values()).reduce((sum, p) => sum + p, 0);
    
    console.log(`Corner start after 3 steps:`);
    console.log(`Total probability: ${(totalProb * 100).toFixed(2)}%`);
    
    const sortedPositions = Array.from(distribution.entries())
      .sort(([,a], [,b]) => b - a);
    
    sortedPositions.forEach(([pos, prob]) => {
      console.log(`  Position ${pos}: ${(prob * 100).toFixed(2)}%`);
    });
    
    expect(totalProb).toBeCloseTo(1.0, 8);
  });

  it('should show spreading behavior', () => {
    console.log('\n=== Spreading Analysis ===');
    const lattice = lattice2D(11, 11);
    const walker = new QuantumWalk2D(lattice, { x: 5, y: 5 });
    
    const spreadData: Array<{steps: number, positions: number, maxDist: number}> = [];
    
    for (let steps = 0; steps <= 10; steps += 2) {
      if (steps > 0) walker.evolve(2);
      
      const distribution = walker.getPositionDistribution();
      let maxDist = 0;
      
      distribution.forEach((prob, posStr) => {
        const [x, y] = posStr.split(',').map(Number);
        const dist = Math.abs(x - 5) + Math.abs(y - 5); // Manhattan distance
        maxDist = Math.max(maxDist, dist);
      });
      
      spreadData.push({
        steps,
        positions: distribution.size,
        maxDist
      });
      
      console.log(`Step ${steps}: ${distribution.size} positions, max distance = ${maxDist}`);
    }
    
    // Check that spreading generally increases
    expect(spreadData[spreadData.length - 1].maxDist).toBeGreaterThan(spreadData[0].maxDist);
  });
});
