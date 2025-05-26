#!/usr/bin/env node

// Simple debug script to test Wigner 3j symbols
import { wigner3j } from './dist/angularMomentum/wignerSymbols';
import * as math from 'mathjs';

console.log('=== Wigner 3j Symbol Debug Test ===\n');

// Test 1: (1 1 2; 0 0 0) = √(2/15)
console.log('Test 1: (1 1 2; 0 0 0)');
const result1 = wigner3j(1, 1, 2, 0, 0, 0);
const expected1 = Math.sqrt(2/15);
console.log(`Result: ${result1.re} + ${result1.im}i`);
console.log(`Expected: ${expected1}`);
console.log(`Error: ${Math.abs(result1.re - expected1)}`);
console.log(`Error %: ${((Math.abs(result1.re - expected1) / expected1) * 100).toFixed(2)}%\n`);

// Test 2: (1 1 0; 1 -1 0) = -1/√3
console.log('Test 2: (1 1 0; 1 -1 0)');
const result2 = wigner3j(1, 1, 0, 1, -1, 0);
const expected2 = -1/Math.sqrt(3);
console.log(`Result: ${result2.re} + ${result2.im}i`);
console.log(`Expected: ${expected2}`);
console.log(`Error: ${Math.abs(result2.re - expected2)}`);
console.log(`Error %: ${((Math.abs(result2.re - expected2) / Math.abs(expected2)) * 100).toFixed(2)}%\n`);

// Test 3: (0.5 0.5 1; 0.5 -0.5 0) = 1/√3
console.log('Test 3: (0.5 0.5 1; 0.5 -0.5 0)');
const result3 = wigner3j(0.5, 0.5, 1, 0.5, -0.5, 0);
const expected3 = 1/Math.sqrt(3);
console.log(`Result: ${result3.re} + ${result3.im}i`);
console.log(`Expected: ${expected3}`);
console.log(`Error: ${Math.abs(result3.re - expected3)}`);
console.log(`Error %: ${((Math.abs(result3.re - expected3) / expected3) * 100).toFixed(2)}%\n`);

// Test 4: (1 1 1; 1 0 -1) = 1/√6
console.log('Test 4: (1 1 1; 1 0 -1)');
const result4 = wigner3j(1, 1, 1, 1, 0, -1);
const expected4 = 1/Math.sqrt(6);
console.log(`Result: ${result4.re} + ${result4.im}i`);
console.log(`Expected: ${expected4}`);
console.log(`Error: ${Math.abs(result4.re - expected4)}`);
console.log(`Error %: ${((Math.abs(result4.re - expected4) / expected4) * 100).toFixed(2)}%\n`);

// Orthogonality test
console.log('=== Orthogonality Test ===');
const j1 = 1, j2 = 1;
let sum = 0;

for (let j3 = Math.abs(j1 - j2); j3 <= j1 + j2; j3++) {
  for (let m3 = -j3; m3 <= j3; m3++) {
    const m1 = 0, m2 = -m3;
    if (Math.abs(m2) <= j2) {
      const wigner = wigner3j(j1, j2, j3, m1, m2, m3);
      sum += Number(math.pow(math.abs(wigner), 2)) * (2 * j3 + 1);
    }
  }
}

console.log(`Orthogonality sum: ${sum}`);
console.log(`Expected: 1.0`);
console.log(`Error: ${Math.abs(sum - 1.0)}`);
