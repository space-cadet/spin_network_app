/**
 * Math utilities for quantum operations
 */

import { Complex } from '../core/types';
import * as math from 'mathjs';

/**
 * Computes matrix exponential using Taylor series
 */
export function matrixExponential(
  matrix: Complex[][],
  terms: number = 10
): Complex[][] {
  const dim = matrix.length;
  
  // Initialize result to identity matrix
  const result = Array(dim).fill(null).map((_, i) => 
    Array(dim).fill(null).map((_, j) => 
      i === j ? math.complex(1, 0) : math.complex(0, 0)
    )
  );

  // Initialize term to identity
  let term = Array(dim).fill(null).map((_, i) => 
    Array(dim).fill(null).map((_, j) => 
      i === j ? math.complex(1, 0) : math.complex(0, 0)
    )
  );

  // Compute sum of terms
  for (let n = 1; n <= terms; n++) {
    // Multiply term by matrix and divide by n
    term = multiplyMatrices(term, matrix).map(row =>
      row.map(element => math.complex(element.re / n, element.im / n))
    );
    
    // Add to result
    result.forEach((row, i) =>
      row.forEach((_, j) => {
        result[i][j] = math.add(result[i][j], term[i][j]) as Complex;
      })
    );
  }

  return result;
}

/**
 * Multiplies two complex matrices
 */
export function multiplyMatrices(a: Complex[][], b: Complex[][]): Complex[][] {
  const dim = a.length;
  const result = Array(dim).fill(null).map(() => 
    Array(dim).fill(null).map(() => math.complex(0, 0))
  );

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      for (let k = 0; k < dim; k++) {
        const prod = math.multiply(a[i][k], b[k][j]) as Complex;
        result[i][j] = math.add(result[i][j], prod) as Complex;
      }
    }
  }

  return result;
}

/**
 * Computes the singular value decomposition of a matrix
 * Note: This is a placeholder for a proper SVD implementation
 */
export function singularValueDecomposition(
  matrix: Complex[][]
): {U: Complex[][], S: number[], V: Complex[][]} {
  const dim = matrix.length;
  
  // Placeholder implementation
  return {
    U: Array(dim).fill(null).map((_, i) => 
      Array(dim).fill(null).map((_, j) => 
        i === j ? math.complex(1, 0) : math.complex(0, 0)
      )
    ),
    S: Array(dim).fill(1),
    V: Array(dim).fill(null).map((_, i) => 
      Array(dim).fill(null).map((_, j) => 
        i === j ? math.complex(1, 0) : math.complex(0, 0)
      )
    )
  };
}