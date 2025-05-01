import { createTensorNode, getTensorElement } from '../tensorNode';
import { createComplex } from '../../core/tensor';
import { triangleInequality } from '../../core/intertwinerSpace';

/**
 * Test suite for intertwiner tensor validation
 */

/**
 * 2-valent node tests
 */
function testTwoValentNode() {
  console.log('\nTesting 2-valent nodes...');
  
  // Test matching spins (j₁ = j₂ = 1/2)
  const matchingNode = createTensorNode(
    'test-2v-match',
    { x: 0, y: 0 },
    0,  // Intertwiner value doesn't matter for 2-valent
    [0.5, 0.5]
  );
  
  // Should have identity tensor elements
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const element = getTensorElement(matchingNode.tensor, [i, j]);
      const expected = i === j ? { re: 1, im: 0 } : { re: 0, im: 0 };
      console.assert(
        Math.abs(element.re - expected.re) < 1e-10 &&
        Math.abs(element.im - expected.im) < 1e-10,
        `Matching spins identity test failed at [${i},${j}]`
      );
    }
  }

  // Test mismatched spins (j₁ = 1/2, j₂ = 1)  
  const mismatchedNode = createTensorNode(
    'test-2v-mismatch',
    { x: 0, y: 0 },
    0,
    [0.5, 1.0]
  );

  // Should have all zero elements
  const dim1 = 2;  // 2j₁ + 1 = 2
  const dim2 = 3;  // 2j₂ + 1 = 3
  for (let i = 0; i < dim1; i++) {
    for (let j = 0; j < dim2; j++) {
      const element = getTensorElement(mismatchedNode.tensor, [i, j]);
      console.assert(
        Math.abs(element.re) < 1e-10 && Math.abs(element.im) < 1e-10,
        `Mismatched spins zero test failed at [${i},${j}]`
      );
    }
  }
}

/**
 * 3-valent node tests
 */
function testThreeValentNode() {
  console.log('\nTesting 3-valent nodes...');

  // Test valid triangle (j₁=1/2, j₂=1/2, j₃=1)
  const validNode = createTensorNode(
    'test-3v-valid',
    { x: 0, y: 0 },
    0,
    [0.5, 0.5, 1.0]
  );

  console.assert(
    validNode.tensor.elements.length > 0,
    'Valid triangle should have non-zero elements'
  );

  // Test invalid triangle (j₁=1/2, j₂=1/2, j₃=2)
  const invalidNode = createTensorNode(
    'test-3v-invalid',
    { x: 0, y: 0 },
    0,
    [0.5, 0.5, 2.0]
  );

  console.assert(
    invalidNode.tensor.elements.length === 0 || 
    invalidNode.tensor.elements.every(el => 
      Math.abs(el.value.re) < 1e-10 && Math.abs(el.value.im) < 1e-10
    ),
    'Invalid triangle should have zero tensor'
  );
}

/**
 * 4-valent node tests 
 */
function testFourValentNode() {
  console.log('\nTesting 4-valent nodes...');

  // Test 4 spin-1/2 edges
  const node = createTensorNode(
    'test-4v-basic',
    { x: 0, y: 0 },
    1, // Intermediate spin j=1
    [0.5, 0.5, 0.5, 0.5]
  );

  // Should have proper dimension
  console.assert(
    node.intertwiner.dimension > 0,
    'Four spin-1/2 node should have non-zero intertwiner dimension'
  );

  // Should have proper basis state
  console.assert(
    node.tensor.elements.length > 0,
    'Four spin-1/2 node should have non-zero tensor elements'
  );
}

// Run all tests
export function runTensorValidation() {
  console.log('Starting tensor validation tests...');
  testTwoValentNode();
  testThreeValentNode();
  testFourValentNode();
  console.log('Tensor validation tests complete');
}