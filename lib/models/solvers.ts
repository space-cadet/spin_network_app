/**
 * Numerical solvers for differential equations
 * 
 * This file contains implementations of various numerical solvers
 * for evolving the simulation state over time.
 */

import { NumericalSolver, StateVector, SimulationParameters } from '../core/types';

/**
 * Implementation of Euler's method (first-order)
 * y_{n+1} = y_n + h * f(t_n, y_n)
 */
export class EulerSolver implements NumericalSolver {
  /**
   * Solve one step of a differential equation using Euler's method
   * y_{n+1} = y_n + h * f(t_n, y_n)
   */
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate the derivative at the current state
    const derivative = f(t, y);
    
    // Multiply by dt (scaling the derivative)
    const scaledDerivative = derivative.multiply(dt);
    
    // Add to the current state
    return y.add(scaledDerivative);
  }
}

/**
 * Implementation of midpoint method (second-order)
 * k1 = f(t_n, y_n)
 * k2 = f(t_n + h/2, y_n + h/2 * k1)
 * y_{n+1} = y_n + h * k2
 */
export class MidpointSolver implements NumericalSolver {
  /**
   * Solve one step of a differential equation using the midpoint method
   * k1 = f(t_n, y_n)
   * k2 = f(t_n + h/2, y_n + h/2 * k1)
   * y_{n+1} = y_n + h * k2
   */
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate k1 = f(t_n, y_n)
    const k1 = f(t, y);
    
    // Calculate the half-step: y_n + h/2 * k1
    const halfStep = y.add(k1.multiply(dt / 2));
    
    // Calculate k2 = f(t_n + h/2, y_n + h/2 * k1)
    const k2 = f(t + dt / 2, halfStep);
    
    // Calculate the full step: y_n + h * k2
    return y.add(k2.multiply(dt));
  }
}

/**
 * Implementation of classic Runge-Kutta method (fourth-order)
 * k1 = f(t_n, y_n)
 * k2 = f(t_n + h/2, y_n + h/2 * k1)
 * k3 = f(t_n + h/2, y_n + h/2 * k2)
 * k4 = f(t_n + h, y_n + h * k3)
 * y_{n+1} = y_n + h/6 * (k1 + 2*k2 + 2*k3 + k4)
 */
export class RungeKutta4Solver implements NumericalSolver {
  /**
   * Solve one step of a differential equation using classic Runge-Kutta method (fourth-order)
   * k1 = f(t_n, y_n)
   * k2 = f(t_n + h/2, y_n + h/2 * k1)
   * k3 = f(t_n + h/2, y_n + h/2 * k2)
   * k4 = f(t_n + h, y_n + h * k3)
   * y_{n+1} = y_n + h/6 * (k1 + 2*k2 + 2*k3 + k4)
   */
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // Calculate k1 = f(t_n, y_n)
    const k1 = f(t, y);
    
    // Calculate the first half-step: y_n + h/2 * k1
    const halfStep1 = y.add(k1.multiply(dt / 2));
    
    // Calculate k2 = f(t_n + h/2, y_n + h/2 * k1)
    const k2 = f(t + dt / 2, halfStep1);
    
    // Calculate the second half-step: y_n + h/2 * k2
    const halfStep2 = y.add(k2.multiply(dt / 2));
    
    // Calculate k3 = f(t_n + h/2, y_n + h/2 * k2)
    const k3 = f(t + dt / 2, halfStep2);
    
    // Calculate the full step: y_n + h * k3
    const fullStep = y.add(k3.multiply(dt));
    
    // Calculate k4 = f(t_n + h, y_n + h * k3)
    const k4 = f(t + dt, fullStep);
    
    // Combine the weighted sum: y_n + h/6 * (k1 + 2*k2 + 2*k3 + k4)
    const weightedSum = k1
      .add(k2.multiply(2))
      .add(k3.multiply(2))
      .add(k4)
      .multiply(dt / 6);
    
    return y.add(weightedSum);
  }
}

/**
 * Implementation of adaptive Runge-Kutta-Fehlberg method (RKF45)
 * This adaptive solver adjusts the step size based on error estimates
 */
export class AdaptiveRKF45Solver implements NumericalSolver {
  private _tolerance: number;
  private _minStep: number;
  private _maxStep: number;
  
  /**
   * Create a new adaptive solver
   */
  constructor(tolerance: number = 1e-6, minStep: number = 1e-6, maxStep: number = 0.1) {
    this._tolerance = tolerance;
    this._minStep = minStep;
    this._maxStep = maxStep;
  }
  
  /**
   * Solve one step of a differential equation with adaptive step size
   */
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector {
    // TO BE IMPLEMENTED
    return y;
  }
}

/**
 * Factory for creating numerical solvers based on parameters
 */
export class SolverFactory {
  /**
   * Create a solver based on method name
   */
  static createSolver(method: string): NumericalSolver {
    switch (method) {
      case 'euler':
        return new EulerSolver();
      
      case 'midpoint':
        return new MidpointSolver();
      
      case 'rk4':
        return new RungeKutta4Solver();
      
      case 'adaptive':
        return new AdaptiveRKF45Solver();
      
      default:
        console.warn(`Unknown numerical method: ${method}, using RK4 as default`);
        return new RungeKutta4Solver();
    }
  }
}
