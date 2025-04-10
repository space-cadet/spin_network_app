/**
 * Numerical solvers for differential equations
 * 
 * This file implements various numerical integration methods
 * for solving the differential equations in the diffusion models.
 */

import { NumericalSolver, StateVector } from '../core/types';

/**
 * Base class for numerical solvers
 */
abstract class BaseSolver implements NumericalSolver {
  /**
   * Solve one step of a differential equation y' = f(t, y)
   * 
   * @param t Current time
   * @param y Current state
   * @param dt Time step
   * @param f Derivative function: f(t, y) returns the derivative of y at time t
   * @returns New state at time t + dt
   */
  abstract step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector;
}

/**
 * Euler method (first-order)
 * 
 * Simple first-order solver: y(t+dt) = y(t) + dt * f(t, y(t))
 */
export class EulerSolver extends BaseSolver {
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate derivative at current state
    const derivative = f(t, y);
    
    // Scale by dt
    const delta = derivative.multiply(dt);
    
    // Add to current state
    return y.add(delta);
  }
}

/**
 * Midpoint method (second-order Runge-Kutta)
 * 
 * y(t+dt) = y(t) + dt * f(t + dt/2, y(t) + dt/2 * f(t, y(t)))
 */
export class MidpointSolver extends BaseSolver {
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate derivative at current state
    const k1 = f(t, y);
    
    // Calculate state at midpoint
    const midpointState = y.add(k1.multiply(dt / 2));
    
    // Calculate derivative at midpoint
    const k2 = f(t + dt / 2, midpointState);
    
    // Use midpoint derivative for the full step
    const delta = k2.multiply(dt);
    
    // Add to current state
    return y.add(delta);
  }
}

/**
 * 4th order Runge-Kutta method
 * 
 * The most commonly used higher-order solver
 */
export class RungeKutta4Solver extends BaseSolver {
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate k1 = f(t, y)
    const k1 = f(t, y);
    
    // Calculate k2 = f(t + dt/2, y + dt/2 * k1)
    const k1Scaled = k1.multiply(dt / 2);
    const y2 = y.add(k1Scaled);
    const k2 = f(t + dt / 2, y2);
    
    // Calculate k3 = f(t + dt/2, y + dt/2 * k2)
    const k2Scaled = k2.multiply(dt / 2);
    const y3 = y.add(k2Scaled);
    const k3 = f(t + dt / 2, y3);
    
    // Calculate k4 = f(t + dt, y + dt * k3)
    const k3Scaled = k3.multiply(dt);
    const y4 = y.add(k3Scaled);
    const k4 = f(t + dt, y4);
    
    // Combine all terms: y(t+dt) = y(t) + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
    const weightedSum = k1
      .add(k2.multiply(2))
      .add(k3.multiply(2))
      .add(k4)
      .multiply(dt / 6);
    
    // Add to current state
    return y.add(weightedSum);
  }
}

/**
 * Adaptive step size Runge-Kutta-Fehlberg (RKF45) method
 * 
 * This solver automatically adjusts the step size based on error estimation
 */
export class AdaptiveRKF45Solver extends BaseSolver {
  private minStepSize: number = 1e-6;
  private maxStepSize: number = 1.0;
  private tolerance: number = 1e-4;
  private safetyFactor: number = 0.9;
  
  /**
   * Constructor with optional parameters
   */
  constructor(options?: {
    minStepSize?: number;
    maxStepSize?: number;
    tolerance?: number;
    safetyFactor?: number;
  }) {
    super();
    
    if (options) {
      this.minStepSize = options.minStepSize ?? this.minStepSize;
      this.maxStepSize = options.maxStepSize ?? this.maxStepSize;
      this.tolerance = options.tolerance ?? this.tolerance;
      this.safetyFactor = options.safetyFactor ?? this.safetyFactor;
    }
  }
  
  /**
   * Set solver parameters
   */
  setParameters(options: {
    minStepSize?: number;
    maxStepSize?: number;
    tolerance?: number;
    safetyFactor?: number;
  }): void {
    this.minStepSize = options.minStepSize ?? this.minStepSize;
    this.maxStepSize = options.maxStepSize ?? this.maxStepSize;
    this.tolerance = options.tolerance ?? this.tolerance;
    this.safetyFactor = options.safetyFactor ?? this.safetyFactor;
  }
  
  /**
   * Implement the step method with adaptive step size
   */
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Limit initial step size
    let currentDt = Math.min(dt, this.maxStepSize);
    let currentY = y;
    let currentT = t;
    let remainingTime = dt;
    
    // Take steps until we reach the target time
    while (remainingTime > this.minStepSize) {
      // Ensure we don't exceed the target time
      currentDt = Math.min(currentDt, remainingTime);
      
      // RKF45 has 6 function evaluations per step
      const k1 = f(currentT, currentY);
      
      const k1Scaled = k1.multiply(currentDt * 1/4);
      const y2 = currentY.add(k1Scaled);
      const k2 = f(currentT + currentDt/4, y2);
      
      const k2Scaled1 = k2.multiply(currentDt * 3/32);
      const k1Scaled2 = k1.multiply(currentDt * 3/32);
      const y3 = currentY.add(k1Scaled2).add(k2Scaled1);
      const k3 = f(currentT + currentDt * 3/8, y3);
      
      const k1Scaled3 = k1.multiply(currentDt * 1932/2197);
      const k2Scaled2 = k2.multiply(currentDt * -7200/2197);
      const k3Scaled1 = k3.multiply(currentDt * 7296/2197);
      const y4 = currentY.add(k1Scaled3).add(k2Scaled2).add(k3Scaled1);
      const k4 = f(currentT + currentDt * 12/13, y4);
      
      const k1Scaled4 = k1.multiply(currentDt * 439/216);
      const k2Scaled3 = k2.multiply(currentDt * -8);
      const k3Scaled2 = k3.multiply(currentDt * 3680/513);
      const k4Scaled1 = k4.multiply(currentDt * -845/4104);
      const y5 = currentY.add(k1Scaled4).add(k2Scaled3).add(k3Scaled2).add(k4Scaled1);
      const k5 = f(currentT + currentDt, y5);
      
      const k1Scaled5 = k1.multiply(currentDt * -8/27);
      const k2Scaled4 = k2.multiply(currentDt * 2);
      const k3Scaled3 = k3.multiply(currentDt * -3544/2565);
      const k4Scaled2 = k4.multiply(currentDt * 1859/4104);
      const k5Scaled1 = k5.multiply(currentDt * -11/40);
      const y6 = currentY.add(k1Scaled5).add(k2Scaled4).add(k3Scaled3).add(k4Scaled2).add(k5Scaled1);
      const k6 = f(currentT + currentDt / 2, y6);
      
      // Calculate 4th order solution
      const y4th = currentY.add(
        k1.multiply(currentDt * 25/216)
          .add(k3.multiply(currentDt * 1408/2565))
          .add(k4.multiply(currentDt * 2197/4104))
          .add(k5.multiply(currentDt * -1/5))
      );
      
      // Calculate 5th order solution
      const y5th = currentY.add(
        k1.multiply(currentDt * 16/135)
          .add(k3.multiply(currentDt * 6656/12825))
          .add(k4.multiply(currentDt * 28561/56430))
          .add(k5.multiply(currentDt * -9/50))
          .add(k6.multiply(currentDt * 2/55))
      );
      
      // Estimate error by comparing 4th and 5th order solutions
      // We'll use max absolute difference for simplicity
      let maxError = 0;
      for (let i = 0; i < y4th.size; i++) {
        const error = Math.abs(y5th.getValueAtIndex(i) - y4th.getValueAtIndex(i));
        maxError = Math.max(maxError, error);
      }
      
      // Avoid division by zero
      maxError = Math.max(maxError, 1e-15);
      
      // Calculate new step size based on error
      const scale = this.safetyFactor * Math.pow(this.tolerance / maxError, 0.2);
      const newDt = Math.min(
        Math.max(scale * currentDt, this.minStepSize),
        this.maxStepSize
      );
      
      // Accept or reject the step based on error
      if (maxError <= this.tolerance) {
        // Accept this step
        currentY = y5th;
        currentT += currentDt;
        remainingTime -= currentDt;
      }
      
      // Update step size for next iteration
      currentDt = newDt;
    }
    
    return currentY;
  }
}

/**
 * Factory to create numerical solvers based on method type
 */
export class SolverFactory {
  /**
   * Create a solver based on the specified method
   */
  static createSolver(
    method: 'euler' | 'midpoint' | 'rk4' | 'adaptive',
    options?: Record<string, any>
  ): NumericalSolver {
    switch (method) {
      case 'euler':
        return new EulerSolver();
      case 'midpoint':
        return new MidpointSolver();
      case 'rk4':
        return new RungeKutta4Solver();
      case 'adaptive':
        return new AdaptiveRKF45Solver(options);
      default:
        throw new Error(`Unknown numerical method: ${method}`);
    }
  }
}
