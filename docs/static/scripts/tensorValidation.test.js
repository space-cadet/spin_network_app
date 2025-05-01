// Helper to format test results
function formatResult(name, passed, details) {
    return `${passed ? '✓' : '✗'} ${name}\n${details ? '  ' + details + '\n' : ''}`;
}

// 2-valent node tests
function run2ValentTests() {
    const results = [];
    const resultsDiv = document.getElementById('results-2v');
    
    try {
        // Test matching spins (j₁ = j₂ = 1/2)
        const j1 = 0.5, j2 = 0.5;
        const matchingNode = window.SpinNetwork.createTensorNode(
            'test-2v-match',
            { x: 0, y: 0 },
            0,
            [0.5, 0.5] // passing actual spins j=1/2
        );

        results.push(`Testing 2-valent node with spins: j₁=${j1}, j₂=${j2}`);
        results.push(`Dimensions: [${matchingNode.tensor.dimensions.join(', ')}]`);
        results.push('Expected: Identity tensor for matching spins\n');

        // Check identity tensor elements
        let identityPassed = true;
        const identityElements = [];
        
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const element = window.SpinNetwork.getTensorElement(matchingNode.tensor, [i, j]);
                const expected = i === j ? 1 : 0;
                const pass = Math.abs(element.re - expected) < 1e-10;
                identityElements.push(`[${i},${j}] = ${element.re.toFixed(4)} (expected: ${expected}) ${pass ? '✓' : '✗'}`);
                if (!pass) identityPassed = false;
            }
        }
        
        results.push('Identity tensor elements:');
        results.push(identityElements.join('\n'));
        results.push(`Identity test: ${identityPassed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

        // Test mismatched spins (j₁ = 1/2, j₂ = 1)
        const j1m = 0.5, j2m = 1.0;
        results.push(`Testing mismatched spins: j₁=${j1m}, j₂=${j2m}`);
        
        const mismatchedNode = window.SpinNetwork.createTensorNode(
            'test-2v-mismatch',
            { x: 0, y: 0 },
            0,
            [0.5, 1.0] // actual spins j₁=1/2 and j₂=1
        );

        results.push(`Dimensions: [${mismatchedNode.tensor.dimensions.join(', ')}]`);
        results.push('Expected: Zero tensor for mismatched spins\n');

        // Check zero tensor elements
        let zeroPassed = true;
        const zeroElements = [];
        
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                const element = window.SpinNetwork.getTensorElement(mismatchedNode.tensor, [i, j]);
                const pass = Math.abs(element.re) < 1e-10;
                zeroElements.push(`[${i},${j}] = ${element.re.toFixed(4)} ${pass ? '✓' : '✗'}`);
                if (!pass) zeroPassed = false;
            }
        }
        
        results.push('Tensor elements (should all be zero):');
        results.push(zeroElements.join('\n'));
        results.push(`Zero tensor test: ${zeroPassed ? 'PASSED ✓' : 'FAILED ✗'}`);

    } catch (error) {
        results.push(`ERROR: ${error.message}`);
    }

    resultsDiv.innerHTML = results.join('\n');
    resultsDiv.className = 'test-results ' + 
        (results.every(r => !r.includes('✗') && !r.includes('ERROR')) ? 'success' : 'failure');
}

// 3-valent node tests
function run3ValentTests() {
    const results = [];
    const resultsDiv = document.getElementById('results-3v');
    
    try {
        // Test valid triangle (j₁=1/2, j₂=1/2, j₃=1)
        const j1 = 0.5, j2 = 0.5, j3 = 1.0;
        results.push(`Testing 3-valent node with spins: j₁=${j1}, j₂=${j2}, j₃=${j3}`);
        
        // Check triangle inequalities
        const triIneq1 = j1 + j2 >= j3;
        const triIneq2 = j2 + j3 >= j1;
        const triIneq3 = j3 + j1 >= j2;
        
        results.push('\nTriangle inequality checks:');
        results.push(`j₁ + j₂ ≥ j₃: ${j1} + ${j2} = ${j1+j2} ≥ ${j3} : ${triIneq1 ? '✓' : '✗'}`);
        results.push(`j₂ + j₃ ≥ j₁: ${j2} + ${j3} = ${j2+j3} ≥ ${j1} : ${triIneq2 ? '✓' : '✗'}`);
        results.push(`j₃ + j₁ ≥ j₂: ${j3} + ${j1} = ${j3+j1} ≥ ${j2} : ${triIneq3 ? '✓' : '✗'}`);
        
        const validNode = window.SpinNetwork.createTensorNode(
            'test-3v-valid',
            { x: 0, y: 0 },
            0,
            [0.5, 0.5, 1.0] // actual spins j₁=1/2, j₂=1/2, j₃=1
        );

        results.push(`\nDimensions: [${validNode.tensor.dimensions.join(', ')}]`);
        results.push(`Intertwiner dimension: ${validNode.intertwiner.dimension}`);
        
        // Show non-zero tensor elements
        const elements = validNode.tensor.elements;
        if (elements.length > 0) {
            results.push('\nNon-zero tensor elements:');
            elements.forEach(el => {
                results.push(`[${el.indices.join(',')}] = ${el.value.re.toFixed(4)}${el.value.im !== 0 ? ' + ' + el.value.im.toFixed(4) + 'i' : ''}`);
            });
        }
        
        results.push(`\nValid triangle test: ${elements.length > 0 ? 'PASSED ✓' : 'FAILED ✗'}`);

        // Test invalid triangle (j₁=1/2, j₂=1/2, j₃=2)
        const j1i = 0.5, j2i = 0.5, j3i = 2.0;
        results.push(`\nTesting invalid configuration: j₁=${j1i}, j₂=${j2i}, j₃=${j3i}`);
        
        // Check triangle inequalities for invalid case
        const triIneq1i = j1i + j2i >= j3i;
        const triIneq2i = j2i + j3i >= j1i;
        const triIneq3i = j3i + j1i >= j2i;
        
        results.push('\nTriangle inequality checks:');
        results.push(`j₁ + j₂ ≥ j₃: ${j1i} + ${j2i} = ${j1i+j2i} ≥ ${j3i} : ${triIneq1i ? '✓' : '✗'}`);
        results.push(`j₂ + j₃ ≥ j₁: ${j2i} + ${j3i} = ${j2i+j3i} ≥ ${j1i} : ${triIneq2i ? '✓' : '✗'}`);
        results.push(`j₃ + j₁ ≥ j₂: ${j3i} + ${j1i} = ${j3i+j1i} ≥ ${j2i} : ${triIneq3i ? '✓' : '✗'}`);
        
        const invalidNode = window.SpinNetwork.createTensorNode(
            'test-3v-invalid',
            { x: 0, y: 0 },
            0,
            [0.5, 0.5, 2.0] // actual spins j₁=1/2, j₂=1/2, j₃=2
        );

        results.push(`\nDimensions: [${invalidNode.tensor.dimensions.join(', ')}]`);
        results.push(`Intertwiner dimension: ${invalidNode.intertwiner.dimension}`);
        
        const invalidElements = invalidNode.tensor.elements;
        results.push(`\nInvalid triangle test: ${invalidElements.length === 0 ? 'PASSED ✓' : 'FAILED ✗'}`);

    } catch (error) {
        results.push(`\nERROR: ${error.message}`);
    }

    resultsDiv.innerHTML = results.join('\n');
    resultsDiv.className = 'test-results ' + 
        (!results.join('').includes('✗') && !results.join('').includes('ERROR') ? 'success' : 'failure');
}

// 4-valent node tests
function run4ValentTests() {
    const results = [];
    const resultsDiv = document.getElementById('results-4v');
    
    try {
        // Test four spin-1/2 edges
        const j1 = 0.5, j2 = 0.5, j3 = 0.5, j4 = 0.5;
        const intermediateJ = 1;
        
        results.push(`Testing 4-valent node:`);
        results.push(`Spins: j₁=${j1}, j₂=${j2}, j₃=${j3}, j₄=${j4}`);
        results.push(`Intermediate coupling j=${intermediateJ}\n`);

        const node = window.SpinNetwork.createTensorNode(
            'test-4v-basic',
            { x: 0, y: 0 },
            intermediateJ,
            [0.5, 0.5, 0.5, 0.5] // actual spins for four j=1/2 edges
        );

        // Show recoupling scheme
        results.push(`Recoupling scheme: ${node.intertwiner.recouplingScheme || '(j₁,j₂)(j₃,j₄)'}`);
        
        // Show allowed intermediate spins
        const j12min = Math.abs(j1 - j2);
        const j12max = j1 + j2;
        const j34min = Math.abs(j3 - j4);
        const j34max = j3 + j4;
        
        results.push('\nAllowed intermediate spins:');
        results.push(`j₁₂: |j₁-j₂| ≤ j₁₂ ≤ j₁+j₂ : ${j12min} ≤ j₁₂ ≤ ${j12max}`);
        results.push(`j₃₄: |j₃-j₄| ≤ j₃₄ ≤ j₃+j₄ : ${j34min} ≤ j₃₄ ≤ ${j34max}`);
        
        // Show intertwiner dimension
        results.push(`\nIntertwiner space dimension: ${node.intertwiner.dimension}`);
        
        // Show tensor dimensions and structure
        results.push(`\nTensor dimensions: [${node.tensor.dimensions.join(', ')}]`);
        
        // Show non-zero tensor elements
        const elements = node.tensor.elements;
        if (elements.length > 0) {
            results.push('\nNon-zero tensor elements:');
            elements.forEach(el => {
                const val = el.value;
                results.push(`[${el.indices.join(',')}] = ${val.re.toFixed(4)}${val.im !== 0 ? ' + ' + val.im.toFixed(4) + 'i' : ''}`);
            });
        }

        // Verify normalization
        let normSquared = 0;
        elements.forEach(el => {
            normSquared += el.value.re * el.value.re + el.value.im * el.value.im;
        });
        
        results.push(`\nTensor normalization: ${Math.abs(normSquared - 1) < 1e-10 ? 'PASSED ✓' : 'FAILED ✗'}`);
        results.push(`(|T|² = ${normSquared.toFixed(10)})`);

    } catch (error) {
        results.push(`\nERROR: ${error.message}`);
    }

    resultsDiv.innerHTML = results.join('\n');
    resultsDiv.className = 'test-results ' + 
        (!results.join('').includes('✗') && !results.join('').includes('ERROR') ? 'success' : 'failure');
}