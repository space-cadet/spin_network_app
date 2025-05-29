export { SigmaRenderer, setCurrentGraphInstance as setSigmaGraphInstance } from './SigmaRenderer';
export { ThreeFiberRenderer, setCurrentGraphInstance as setThreeFiberGraphInstance } from './ThreeFiberRenderer';

// Unified function to set graph for both renderers
import { setCurrentGraphInstance as setSigma } from './SigmaRenderer';
import { setCurrentGraphInstance as setThreeFiber } from './ThreeFiberRenderer';
import { GraphologyAdapter } from '../../../../graph-core/src/core/GraphologyAdapter';

export const setCurrentGraphInstance = (graph: GraphologyAdapter | null) => {
  setSigma(graph);
  setThreeFiber(graph);
};
