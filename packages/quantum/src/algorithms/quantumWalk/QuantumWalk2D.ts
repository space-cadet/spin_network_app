/**
 * 2D Quantum Random Walk implementation
 */

import { Complex, IStateVector } from '../../core/types';
import { StateVector } from '../../states/stateVector';
import { MatrixOperator } from '../../operators/operator';
import { GraphologyAdapter } from '@spin-network/graph-core/src/core/GraphologyAdapter';
import { IQuantumWalk2D, Position2D, CoinDirection } from './types';
import * as math from 'mathjs';

export class QuantumWalk2D implements IQuantumWalk2D {
  private state: StateVector;
  private coinOperator: MatrixOperator;
  private width: number;
  private height: number;

  constructor(lattice: GraphologyAdapter, startPosition: Position2D) {
    const metadata = lattice.getMetadata();
    const width = metadata?.parameters?.width;
    const height = metadata?.parameters?.height;
    
    // Ensure width and height are valid numbers
    if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
      throw new Error('Invalid lattice dimensions: width and height must be positive numbers');
    }
    
    this.width = width;
    this.height = height;
    
    // Total dimension: 4 coin states × width × height positions
    const totalDim = 4 * this.width * this.height;
    
    // Initialize state at starting position with UP coin
    const startIndex = this.getStateIndex(startPosition, CoinDirection.UP);
    this.state = StateVector.computationalBasis(totalDim, startIndex);

    // Create Hadamard coin operator (4×4 for 2D)
    const h = 1 / Math.sqrt(2);
    const coinMatrix: Complex[][] = [
      [math.complex(h, 0), math.complex(h, 0), math.complex(0, 0), math.complex(0, 0)],
      [math.complex(h, 0), math.complex(-h, 0), math.complex(0, 0), math.complex(0, 0)],
      [math.complex(0, 0), math.complex(0, 0), math.complex(h, 0), math.complex(h, 0)],
      [math.complex(0, 0), math.complex(0, 0), math.complex(h, 0), math.complex(-h, 0)]
    ];

    this.coinOperator = new MatrixOperator(coinMatrix);
  }

  /**
   * Perform single evolution step: coin flip then conditional shift
   */
  step(): void {
    // Apply coin operator to each position
    this.applyCoin();
    
    // Apply shift operator based on coin states
    this.applyShift();
  }

  /**
   * Evolve for multiple steps
   */
  evolve(steps: number): IStateVector {
    for (let i = 0; i < steps; i++) {
      this.step();
    }
    return this.state;
  }

  /**
   * Get probability distribution over positions
   */
  getPositionDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let probability = 0;
        
        // Sum probabilities over all coin states at this position
        for (let coin = 0; coin < 4; coin++) {
          const index = this.getStateIndex({x, y}, coin);
          const amplitude = this.state.getState(index);
          probability += Number(math.abs(math.multiply(amplitude, math.conj(amplitude))));
        }
        
        if (probability > 1e-10) {
          distribution.set(`${x},${y}`, probability);
        }
      }
    }
    
    return distribution;
  }

  private applyCoin(): void {
    const newAmplitudes: Complex[] = Array(this.state.dimension).fill(math.complex(0, 0));
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        // Apply coin operator to the 4 coin states at position (x,y)
        const coinStates: Complex[] = [];
        for (let coin = 0; coin < 4; coin++) {
          const index = this.getStateIndex({x, y}, coin);
          coinStates.push(this.state.getState(index));
        }
        
        // Matrix-vector multiplication for coin operation
        const coinMatrix = this.coinOperator.toMatrix();
        for (let i = 0; i < 4; i++) {
          let sum = math.complex(0, 0);
          for (let j = 0; j < 4; j++) {
            sum = math.add(sum, math.multiply(coinMatrix[i][j], coinStates[j])) as Complex;
          }
          const newIndex = this.getStateIndex({x, y}, i);
          newAmplitudes[newIndex] = sum;
        }
      }
    }
    
    this.state = new StateVector(this.state.dimension, newAmplitudes);
  }

  private applyShift(): void {
    const newAmplitudes: Complex[] = [...this.state.amplitudes];
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let coin = 0; coin < 4; coin++) {
          const currentIndex = this.getStateIndex({x, y}, coin);
          const amplitude = this.state.getState(currentIndex);
          
          // Skip if amplitude is zero
          if (Math.abs(amplitude.re) < 1e-15 && Math.abs(amplitude.im) < 1e-15) continue;
          
          // Determine new position based on coin state
          let newX = x, newY = y;
          let canMove = false;
          
          if (coin === CoinDirection.UP && y > 0) {
            newY = y - 1;
            canMove = true;
          } else if (coin === CoinDirection.DOWN && y < this.height - 1) {
            newY = y + 1;
            canMove = true;
          } else if (coin === CoinDirection.LEFT && x > 0) {
            newX = x - 1;
            canMove = true;
          } else if (coin === CoinDirection.RIGHT && x < this.width - 1) {
            newX = x + 1;
            canMove = true;
          }
          
          if (canMove) {
            // Move amplitude from current to new position
            const newIndex = this.getStateIndex({x: newX, y: newY}, coin);
            newAmplitudes[currentIndex] = math.subtract(newAmplitudes[currentIndex], amplitude) as Complex;
            newAmplitudes[newIndex] = math.add(newAmplitudes[newIndex], amplitude) as Complex;
          }
          // If can't move, amplitude stays at current position (no change needed)
        }
      }
    }
    
    this.state = new StateVector(this.state.dimension, newAmplitudes);
  }

  private getStateIndex(position: Position2D, coin: CoinDirection): number {
    return coin * this.width * this.height + position.y * this.width + position.x;
  }
}
