/**
 * Spin Chain Dynamics Examples
 * 
 * Demonstrates:
 * 1. Heisenberg chain evolution
 * 2. Magnetization dynamics
 * 3. Spin correlation functions
 * 4. Domain wall dynamics
 */

import { Hamiltonian } from '../../hamiltonian';
import { StateVector } from '../../stateVector';
import { createComplex } from '../../complex';
import { MatrixOperator } from '../../operator';
import { PauliZ } from '../../gates';
import { composeOperators } from '../../composition';

/**
 * Creates magnetization operator for a specific site in a spin chain
 */
function createSitemagnetization(site: number, numSites: number): MatrixOperator {
    const ops = Array(numSites).fill(null).map(() => 
        MatrixOperator.identity(2)
    );
    ops[site] = PauliZ;
    return composeOperators(ops) as MatrixOperator;
}

/**
 * Creates spin correlation operator between two sites
 */
function createSpinCorrelation(site1: number, site2: number, numSites: number): MatrixOperator {
    const sz1 = createSitemagnetization(site1, numSites);
    const sz2 = createSitemagnetization(site2, numSites);
    return sz1.compose(sz2) as MatrixOperator;
}

/**
 * Example 1: Basic Heisenberg Chain Evolution
 */
function demonstrateHeisenbergDynamics() {
    console.log('Example 1: Heisenberg Chain Evolution');
    console.log('----------------------------------');

    // Create 4-site Heisenberg chain with J = 1
    const numSites = 4;
    const J = 1.0;
    const H = Hamiltonian.createHeisenbergHamiltonian(numSites, J);

    // Initialize Néel state |↑↓↑↓⟩
    const neelState = StateVector.computationalBasis(Math.pow(2, numSites), 0b0101);
    
    console.log('Initial Néel state |↑↓↑↓⟩');
    console.log('Energy:', H.expectationValue(neelState).re.toFixed(3));

    // Measure site magnetizations
    const initialMags = Array(numSites).fill(0).map((_,i) => {
        const sz = createSitemagnetization(i, numSites);
        return neelState.innerProduct(sz.apply(neelState)).re;
    });
    console.log('Initial magnetizations:', initialMags.map(m => m.toFixed(3)));

    // Time evolution
    const times = [0.5, 1.0, 2.0, 4.0];
    for (const t of times) {
        const evolved = H.evolveState(neelState, t);
        console.log(`\nt = ${t.toFixed(2)}:`);
        
        // Measure magnetizations
        const mags = Array(numSites).fill(0).map((_,i) => {
            const sz = createSitemagnetization(i, numSites);
            return evolved.innerProduct(sz.apply(evolved)).re;
        });
        console.log('Site magnetizations:', mags.map(m => m.toFixed(3)));
        
        // Measure nearest-neighbor correlations
        const correlations = [];
        for (let i = 0; i < numSites-1; i++) {
            const corr = createSpinCorrelation(i, i+1, numSites);
            correlations.push(evolved.innerProduct(corr.apply(evolved)).re);
        }
        console.log('NN Correlations:', correlations.map(c => c.toFixed(3)));
    }
}

/**
 * Example 2: Domain Wall Dynamics
 */
function demonstrateDomainWall() {
    console.log('\nExample 2: Domain Wall Dynamics');
    console.log('----------------------------');

    // Create 6-site chain
    const numSites = 6;
    const J = 1.0;
    const H = Hamiltonian.createHeisenbergHamiltonian(numSites, J);

    // Initialize domain wall state |↑↑↑↓↓↓⟩
    const domainState = StateVector.computationalBasis(
        Math.pow(2, numSites), 
        0b111000  // First three up, last three down
    );

    console.log('Initial domain wall state |↑↑↑↓↓↓⟩');
    console.log('Energy:', H.expectationValue(domainState).re.toFixed(3));

    // Measure initial profile
    const initialMags = Array(numSites).fill(0).map((_,i) => {
        const sz = createSitemagnetization(i, numSites);
        return domainState.innerProduct(sz.apply(domainState)).re;
    });
    console.log('Initial magnetization profile:', initialMags.map(m => m.toFixed(3)));

    // Time evolution
    const times = [0.5, 1.0, 2.0, 4.0];
    for (const t of times) {
        const evolved = H.evolveState(domainState, t);
        console.log(`\nt = ${t.toFixed(2)}:`);
        
        // Measure magnetization profile
        const mags = Array(numSites).fill(0).map((_,i) => {
            const sz = createSitemagnetization(i, numSites);
            return evolved.innerProduct(sz.apply(evolved)).re;
        });
        console.log('Magnetization profile:', mags.map(m => m.toFixed(3)));
        
        // Calculate domain wall width
        const width = calculateDomainWidth(mags);
        console.log('Approximate domain width:', width.toFixed(2));
    }
}

/**
 * Helper function to estimate domain wall width
 * Uses the spread of the transition region where magnetization changes sign
 */
function calculateDomainWidth(magnetizations: number[]): number {
    // Find points where magnetization crosses zero
    const crossings = [];
    for (let i = 0; i < magnetizations.length - 1; i++) {
        if (magnetizations[i] * magnetizations[i+1] <= 0) {
            crossings.push(i + Math.abs(magnetizations[i]) / 
                (Math.abs(magnetizations[i]) + Math.abs(magnetizations[i+1])));
        }
    }
    
    // Use the spread of the transition region
    if (crossings.length >= 2) {
        return crossings[crossings.length-1] - crossings[0];
    }
    return magnetizations.length; // If no clear crossings, assume maximally spread
}

// Run the demonstrations
console.log('Spin Chain Dynamics Demonstrations\n');
demonstrateHeisenbergDynamics();
demonstrateDomainWall();