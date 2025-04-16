/**
 * Analysis module for the Spin Network simulation library
 * 
 * This module provides tools for analyzing simulation results,
 * calculating geometric properties, and extracting insights from
 * spin network simulations.
 */

// Export geometric property calculators
export { 
  GeometricPropertiesCalculator,
  calculateVolume,
  calculateArea,
  calculateEffectiveDimension,
  calculateVolumeEntropy
} from './geometricProps';

// Export conservation law analyzers
export {
  ProbabilityConservation,
  TotalOccupancyConservation,
  PositivityConservation,
  ConservationCheckerFactory,
  checkMassConservation,
  checkEnergyConservation
} from './conservation';

// Export the ConservationLawChecker interface
export type { ConservationLawChecker } from './conservation';

// Export statistical analysis tools
export {
  SimulationAnalyzer,
  calculateMeanSquareDisplacement,
  calculateSpectralDimension,
  calculateReturnProbability,
  calculateDiffusionCoefficient
} from './statistics';
