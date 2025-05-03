// Tensor Operations Handler

if (!window.SpinNetwork) {
    console.error('SpinNetwork module not loaded');
    throw new Error('SpinNetwork module not loaded. Please ensure the library is built with tensor support.');
}

class TensorOperations {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // 2-Valent Node Elements
        this.spin2v = document.getElementById('spin-2v');
        this.run2vTest = document.getElementById('run-2v-test');
        this.norm2v = document.getElementById('norm-2v');
        this.unit2v = document.getElementById('unit-2v');

        // 3-Valent Node Elements
        this.spin1_3v = document.getElementById('spin1-3v');
        this.spin2_3v = document.getElementById('spin2-3v');
        this.spin3_3v = document.getElementById('spin3-3v');
        this.run3vTest = document.getElementById('run-3v-test');
        this.angmom3v = document.getElementById('angmom-3v');
        this.triangle3v = document.getElementById('triangle-3v');

        // 4-Valent Node Elements
        this.spin1_4v = document.getElementById('spin1-4v');
        this.spin2_4v = document.getElementById('spin2-4v');
        this.spin3_4v = document.getElementById('spin3-4v');
        this.spin4_4v = document.getElementById('spin4-4v');
        this.run4vTest = document.getElementById('run-4v-test');
        this.recouple4v = document.getElementById('recouple-4v');
        this.closure4v = document.getElementById('closure-4v');
    }

    attachEventListeners() {
        this.run2vTest?.addEventListener('click', () => this.test2ValentNode());
        this.run3vTest?.addEventListener('click', () => this.test3ValentNode());
        this.run4vTest?.addEventListener('click', () => this.test4ValentNode());
    }

    test2ValentNode() {
        try {
            const spin = parseFloat(this.spin2v.value);
            const edgeSpins = [spin, spin]; // For 2-valent node, both edges have same spin

            // Create a tensor node 
            const node = window.SpinNetwork.core.createTensorNode(
                'test-2v',
                { x: 0, y: 0 },
                0, // intertwiner value
                edgeSpins
            );

            // Use core module's tensor functions 
            const norm = Math.sqrt(window.SpinNetwork.quantum.tensorNorm(node.tensor));
            
            // For 2-valent nodes, check if tensor represents an identity map
            const dim = Math.round(2 * spin + 1);
            const identityTensor = window.SpinNetwork.quantum.createTensor([dim, dim]);
            for (let i = 0; i < dim; i++) {
                window.SpinNetwork.core.setTensorElement(identityTensor, [i, i], { re: 1/Math.sqrt(dim), im: 0 });
            }
            
            // Contract with its conjugate using core tensor functions
            const contracted = window.SpinNetwork.quantum.contractTensors(node.tensor, node.tensor, [[1, 0]]);
            const identityDeviation = Math.abs(Math.sqrt(window.SpinNetwork.quantum.tensorNorm(contracted)) - 1);
            const isUnitary = identityDeviation < 1e-10;
            
            this.norm2v.textContent = norm.toFixed(4);
            this.unit2v.textContent = isUnitary ? '1.0000' : '0.0000';
            
            console.log('2-Valent node test completed:', { spin, norm, isUnitary });
        } catch (error) {
            console.error('2-Valent node test failed:', error);
            this.norm2v.textContent = 'Error';
            this.unit2v.textContent = 'Error';
        }
    }

    test3ValentNode() {
        try {
            const spins = [
                parseFloat(this.spin1_3v.value),
                parseFloat(this.spin2_3v.value),
                parseFloat(this.spin3_3v.value)
            ];

            // Create a tensor node for the 3-valent vertex
            const node = window.SpinNetwork.core.createTensorNode(
                'test-3v',
                { x: 0, y: 0 },
                0, // intertwiner value for 3-valent node is unique
                spins
            );
            
            // Calculate total angular momentum using expectation value
            const J2op = window.SpinNetwork.quantum.createSpinOperators(1).Sz;  // Total angular momentum operator
            const angularMomentum = window.SpinNetwork.quantum.expectationValue(node.tensor, J2op);
            const triangleInequality = window.SpinNetwork.core.triangleInequality(spins[0], spins[1], spins[2]);
            
            this.angmom3v.textContent = angularMomentum.toFixed(4);
            this.triangle3v.textContent = triangleInequality ? 'Valid' : 'Invalid';
            
            console.log('3-Valent node test completed:', { spins, angularMomentum, triangleInequality });
        } catch (error) {
            console.error('3-Valent node test failed:', error);
            this.angmom3v.textContent = 'Error';
            this.triangle3v.textContent = 'Error';
        }
    }

    test4ValentNode() {
        try {
            const spins = [
                parseFloat(this.spin1_4v.value),
                parseFloat(this.spin2_4v.value),
                parseFloat(this.spin3_4v.value),
                parseFloat(this.spin4_4v.value)
            ];
            
            // Create a tensor node for the 4-valent vertex
            const node = window.SpinNetwork.core.createTensorNode(
                'test-4v',
                { x: 0, y: 0 },
                0, // intertwiner value 
                spins
            );
            
            // Use quantum module functions to check recoupling consistency
            const basis = window.SpinNetwork.quantum.createIntertwinerTensor(
                spins[0], spins[1], spins[2], spins[3], 0
            );
            const contracted = window.SpinNetwork.quantum.contractTensors(node.tensor, basis, [[0,0], [1,1], [2,2], [3,3]]);
            const recouplingConsistency = Math.sqrt(window.SpinNetwork.quantum.normSquared(contracted));
            
            // Check closure relations by verifying total angular momentum is zero
            const J2op = window.SpinNetwork.quantum.createSpinOperators(1).Sz;
            const totalJ = window.SpinNetwork.quantum.expectationValue(node.tensor, J2op);
            const closureRelations = Math.abs(totalJ) < 1e-10;
            
            this.recouple4v.textContent = recouplingConsistency.toFixed(4);
            this.closure4v.textContent = closureRelations ? 'Valid' : 'Invalid';
            
            console.log('4-Valent node test completed:', { spins, recouplingConsistency, closureRelations });
        } catch (error) {
            console.error('4-Valent node test failed:', error);
            this.recouple4v.textContent = 'Error';
            this.closure4v.textContent = 'Error'; 
        }
    }
}

// Initialize handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TensorOperations();
});