// Advanced Simulation Controls Handler
class AdvancedSimulationControls {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.diffusionModel = document.getElementById('diffusion-model');
        this.numericalMethod = document.getElementById('numerical-method');
        this.timeStep = document.getElementById('time-step');
        this.errorTolerance = document.getElementById('error-tolerance');
        this.maxIterations = document.getElementById('max-iterations');
        
        // State Vector Operation Buttons
        this.normalizeState = document.getElementById('normalize-state');
        this.randomizeState = document.getElementById('randomize-state');
        this.resetState = document.getElementById('reset-state');
    }

    attachEventListeners() {
        this.normalizeState?.addEventListener('click', () => this.normalizeStateVector());
        this.randomizeState?.addEventListener('click', () => this.randomizeStateVector());
        this.resetState?.addEventListener('click', () => this.resetStateVector());
        
        // Add change event listeners for simulation parameters
        [this.diffusionModel, this.numericalMethod, this.timeStep, 
         this.errorTolerance, this.maxIterations].forEach(element => {
            element?.addEventListener('change', () => this.updateSimulationParams());
        });
    }

    normalizeStateVector() {
        try {
            if (!window.currentState) {
                throw new Error('No current state available');
            }
            
            // Use the normalize state vector function from the library
            window.currentState = window.SpinNetwork.normalizeStateVector(window.currentState);
            
            // Update visualization if needed
            if (window.renderNetwork) {
                window.renderNetwork();
            }
            
            console.log('State vector normalized');
        } catch (error) {
            console.error('Failed to normalize state vector:', error);
        }
    }

    randomizeStateVector() {
        try {
            if (!window.currentNetwork) {
                throw new Error('No network available');
            }
            
            // Create a random state vector
            const dimension = window.currentNetwork.nodes.length;
            const randomState = window.SpinNetwork.createStateVector(
                window.currentNetwork.nodes.map(node => node.id)
            );
            
            // Fill with random values
            for (let i = 0; i < randomState.amplitudes.length; i++) {
                randomState.amplitudes[i] = {
                    re: Math.random() * 2 - 1,
                    im: Math.random() * 2 - 1
                };
            }
            
            window.currentState = window.SpinNetwork.normalizeStateVector(randomState);
            
            // Update visualization
            if (window.renderNetwork) {
                window.renderNetwork();
            }
            
            console.log('State vector randomized');
        } catch (error) {
            console.error('Failed to randomize state vector:', error);
        }
    }

    resetStateVector() {
        try {
            if (!window.currentNetwork) {
                throw new Error('No network available');
            }
            
            // Create an initial state vector
            const initialState = window.SpinNetwork.createStateVector(
                window.currentNetwork.nodes.map(node => node.id)
            );
            
            // Set first amplitude to 1
            if (initialState.amplitudes.length > 0) {
                initialState.amplitudes[0] = { re: 1, im: 0 };
            }
            
            window.currentState = initialState;
            
            // Update visualization
            if (window.renderNetwork) {
                window.renderNetwork();
            }
            
            console.log('State vector reset to initial state');
        } catch (error) {
            console.error('Failed to reset state vector:', error);
        }
    }

    updateSimulationParams() {
        try {
            const params = {
                diffusionModel: this.diffusionModel.value,
                numericalMethod: this.numericalMethod.value,
                timeStep: parseFloat(this.timeStep.value),
                errorTolerance: parseFloat(this.errorTolerance.value),
                maxIterations: parseInt(this.maxIterations.value)
            };
            
            // Update simulation engine if it exists
            if (window.currentNetwork && window.SpinNetwork) {
                const engine = window.SpinNetwork.createSimulationEngine();
                
                // Set parameters directly on the engine
                Object.keys(params).forEach(key => {
                    if (engine.parameters && engine.parameters[key] !== undefined) {
                        engine.parameters[key] = params[key];
                    }
                });
                
                console.log('Simulation parameters updated:', params);
            }
        } catch (error) {
            console.error('Failed to update simulation parameters:', error);
        }
    }
}

// Initialize handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedSimulationControls();
});