// Let's analyze the simulation flow issues
// Since we can't directly run the app, let's step through the key calculations

// First, let's create a simple 3-node graph
const graph = {
  nodes: [
    { id: 'node1', position: { x: 100, y: 100 } },
    { id: 'node2', position: { x: 200, y: 100 } },
    { id: 'node3', position: { x: 150, y: 150 } }
  ],
  edges: [
    { id: 'edge1', source: 'node1', target: 'node2', spin: 0.5 },
    { id: 'edge2', source: 'node2', target: 'node3', spin: 0.5 },
    { id: 'edge3', source: 'node3', target: 'node1', spin: 0.5 }
  ],
  getNodeCount: function() { return this.nodes.length; },
  getNode: function(id) { return this.nodes.find(n => n.id === id); },
  getNeighbors: function(id) { 
    return this.edges
      .filter(e => e.source === id || e.target === id)
      .map(e => e.source === id ? e.target : e.source);
  },
  getDegree: function(id) {
    return this.edges.filter(e => e.source === id || e.target === id).length;
  },
  toLaplacianMatrix: function() {
    // Simple Laplacian matrix construction
    const n = this.nodes.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    
    // Fill diagonal with degrees
    for (let i = 0; i < n; i++) {
      const nodeId = this.nodes[i].id;
      matrix[i][i] = this.getDegree(nodeId);
    }
    
    // Fill off-diagonal with -1 for connected nodes
    for (const edge of this.edges) {
      const i = this.nodes.findIndex(n => n.id === edge.source);
      const j = this.nodes.findIndex(n => n.id === edge.target);
      if (i >= 0 && j >= 0) {
        matrix[i][j] = -1;
        matrix[j][i] = -1;
      }
    }
    
    return matrix;
  }
};

// Create a state vector with a single non-zero value
const stateVector = {
  size: 3,
  nodeIds: ['node1', 'node2', 'node3'],
  getValue: function(id) {
    const index = this.nodeIds.indexOf(id);
    return index === 0 ? 1.0 : 0.0; // Only node1 has value 1.0, others are 0
  },
  getValueAtIndex: function(i) {
    return i === 0 ? 1.0 : 0.0; // Only index 0 has value 1.0, others are 0
  }
};

// Let's mock the math adapter for eigenvalue calculations
const mathAdapter = {
  eigenDecomposition: function(matrix) {
    // Simple mock implementation
    return {
      values: [0, 1, 3], // One zero eigenvalue and two non-zero
      vectors: [] // Not used in our calculations
    };
  }
};

// Now let's implement the geometric property calculations

// 1. Calculate total volume
function calculateTotalVolume(state) {
  let totalVolume = 0;
  
  // Sum up the volumes associated with each node
  for (let i = 0; i < state.size; i++) {
    const stateValue = state.getValueAtIndex(i);
    const volumeContribution = Math.abs(stateValue) ** 2;
    totalVolume += volumeContribution;
  }
  
  console.log("Total volume calculation:", { totalVolume });
  return totalVolume;
}

// 2. Calculate area
function calculateTotalArea(graph) {
  let totalArea = 0;
  
  // Sum up the areas associated with each edge
  for (const edge of graph.edges) {
    const areaContribution = Math.sqrt(edge.spin * (edge.spin + 1));
    totalArea += areaContribution;
  }
  
  console.log("Total area calculation:", { totalArea });
  return totalArea;
}

// 3. Calculate effective dimension
function calculateEffectiveDimension(graph, state) {
  // Create the Laplacian matrix
  const laplacian = graph.toLaplacianMatrix();
  
  // Calculate eigenvalues (using our mock adapter)
  const { values } = mathAdapter.eigenDecomposition(laplacian);
  
  // Sort eigenvalues (excluding the zero eigenvalue)
  const sortedEigenvalues = values
    .filter(v => Math.abs(v) > 1e-10) // Remove zero eigenvalues
    .sort((a, b) => a - b);
  
  console.log("Eigenvalues:", { values, sortedEigenvalues });
  
  // If we don't have enough eigenvalues, return 0
  if (sortedEigenvalues.length < 2) {
    console.log("Not enough eigenvalues to calculate dimension");
    return 0;
  }
  
  // Take a sample of the smallest eigenvalues
  const sampleSize = Math.min(10, Math.floor(sortedEigenvalues.length / 3));
  const logEigenvalues = sortedEigenvalues
    .slice(0, sampleSize)
    .map(v => Math.log(v));
  
  // Generate log(N(λ)) data points
  const logCumulative = [];
  for (let i = 0; i < sampleSize; i++) {
    logCumulative.push(Math.log((i + 1) / sortedEigenvalues.length));
  }
  
  console.log("Log data:", { logEigenvalues, logCumulative });
  
  // Calculate the slope using linear regression
  let sumXY = 0;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    sumXY += logEigenvalues[i] * logCumulative[i];
    sumX += logEigenvalues[i];
    sumY += logCumulative[i];
    sumXX += logEigenvalues[i] * logEigenvalues[i];
  }
  
  let slope = 0;
  if (sampleSize * sumXX - sumX * sumX !== 0) {
    slope = (sampleSize * sumXY - sumX * sumY) / 
            (sampleSize * sumXX - sumX * sumX);
  }
  
  const dimension = -2 * slope;
  console.log("Dimension calculation:", { slope, dimension });
  
  return dimension;
}

// 4. Calculate volume entropy
function calculateVolumeEntropy(state) {
  const totalVolume = calculateTotalVolume(state);
  
  // If total volume is 0, return 0 to avoid division by zero
  if (totalVolume === 0) {
    console.log("Total volume is zero, entropy = 0");
    return 0;
  }
  
  let entropy = 0;
  
  // Calculate entropy based on volume distribution
  for (let i = 0; i < state.size; i++) {
    const stateValue = state.getValueAtIndex(i);
    const volumeContribution = Math.abs(stateValue) ** 2;
    
    // Skip nodes with zero volume
    if (volumeContribution === 0) {
      continue;
    }
    
    // Calculate the volume fraction
    const volumeFraction = volumeContribution / totalVolume;
    
    // Add to entropy: -p * ln(p)
    entropy -= volumeFraction * Math.log(volumeFraction);
  }
  
  console.log("Volume entropy calculation:", { entropy });
  return entropy;
}

// 5. Calculate basic statistics
function calculateStatistics(state) {
  let sum = 0;
  let sumSquared = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  
  // Calculate basic statistics
  for (let i = 0; i < state.size; i++) {
    const value = state.getValueAtIndex(i);
    
    sum += value;
    sumSquared += value * value;
    
    if (value < min) min = value;
    if (value > max) max = value;
  }
  
  const mean = sum / state.size;
  const variance = (sumSquared / state.size) - (mean * mean);
  const standardDeviation = Math.sqrt(Math.max(0, variance));
  
  console.log("Statistics calculation:", { mean, variance, standardDeviation, min, max });
  
  return {
    mean,
    variance,
    standardDeviation,
    min,
    max
  };
}

// Run all calculations
console.log("Running simulation result calculations on test data...");
console.log("Graph:", { nodes: graph.nodes.length, edges: graph.edges.length });
console.log("State vector:", { 
  size: stateVector.size, 
  values: Array(stateVector.size).fill(0).map((_, i) => stateVector.getValueAtIndex(i))
});

const totalVolume = calculateTotalVolume(stateVector);
const totalArea = calculateTotalArea(graph);
const effectiveDimension = calculateEffectiveDimension(graph, stateVector);
const volumeEntropy = calculateVolumeEntropy(stateVector);
const statistics = calculateStatistics(stateVector);

// Compile results
const results = {
  geometric: {
    totalVolume,
    totalArea,
    effectiveDimension,
    volumeEntropy
  },
  statistics: {
    mean: statistics.mean,
    variance: statistics.variance,
    standardDeviation: statistics.standardDeviation,
    min: statistics.min,
    max: statistics.max
  }
};

console.log("FINAL RESULTS:", results);