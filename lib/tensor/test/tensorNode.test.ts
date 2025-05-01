// lib/tensor/test/tensorNode.test.ts

import { createTensorNode } from '../tensorNode';
import { getTensorElement } from '../../core/tensor';
import { intertwinerDimension, triangleInequality } from '../../core/intertwinerSpace';

function run2ValentTests() {
    const testSection = document.getElementById('test-2v-match');
    if (!testSection) return;

    const visDiv = document.getElementById('vis-2v-match');
    const resultDiv = document.getElementById('result-2v-match');

    if (!visDiv || !resultDiv) return;

    const j = 0.5;
    const node = createTensorNode('2v-match', { x: 0, y: 0 }, 0, [j, j]);
    const dim = Math.round(2 * j + 1);

    let isIdentity = true;
    for (let i = 0; i < dim; i++) {
        for (let k = 0; k < dim; k++) {
            const element = getTensorElement(node.tensor, [i, k]);
            const expected = i === k ? 1 : 0;
            if (Math.abs(element.re - expected) > 1e-10) {
                isIdentity = false;
                break;
            }
        }
        if (!isIdentity) break;
    }

    visDiv.innerHTML = `Tensor is ${isIdentity ? 'Identity' : 'Not Identity'}`;
    resultDiv.classList.add(isIdentity ? 'test-pass' : 'test-fail');
    resultDiv.textContent = isIdentity ? 'PASS' : 'FAIL';
}

function run3ValentTests() {
    const testSection = document.getElementById('test-3v-valid');
    if (!testSection) return;

    const resultDiv = document.getElementById('result-3v-valid');
    if (!resultDiv) return;

    const j1 = 0.5, j2 = 0.5, j3 = 1;
    const isValid = (j1 + j2 >= j3) && (j2 + j3 >= j1) && (j3 + j1 >= j2);
    const dimension = triangleInequality(j1, j2, j3) ? 1 : 0;

    const expectedDimension = isValid ? 1 : 0;
    const isCorrect = dimension === expectedDimension;

    resultDiv.classList.add(isCorrect ? 'test-pass' : 'test-fail');
    resultDiv.textContent = isCorrect ? 'PASS' : 'FAIL';
}

function run4ValentTests() {
    const testSection = document.getElementById('test-4v-basic');
    if (!testSection) return;

    const resultDiv = document.getElementById('result-4v-basic');
    if (!resultDiv) return;

    const j1 = 0.5, j2 = 0.5, j3 = 0.5, j4 = 0.5;
    const dimension = intertwinerDimension(j1, j2, j3, j4); // This now correctly calls the 4-argument version
    const expectedDimension = 2; // Known dimension for 4 spin-1/2 particles

    const isCorrect = dimension === expectedDimension;

    resultDiv.classList.add(isCorrect ? 'test-pass' : 'test-fail');
    resultDiv.textContent = isCorrect ? 'PASS' : 'FAIL';
}

document.addEventListener('DOMContentLoaded', () => {
    run2ValentTests();
    run3ValentTests();
    run4ValentTests();
});
