import numpy as np
from sympy.physics.quantum.cg import CG
from sympy import S
from itertools import product
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from tabulate import tabulate

def triangle_inequality(j1, j2, j3):
    """
    Check if three angular momenta satisfy the triangle inequality.
    """
    return (j1 + j2 >= j3) and (j2 + j3 >= j1) and (j3 + j1 >= j2)

def allowed_intermediate_spins(j1, j2):
    """
    Calculate allowed intermediate spins when coupling j1 and j2.
    Returns a list of possible j values following quantum angular momentum coupling rules.
    """
    j_min = abs(j1 - j2)
    j_max = j1 + j2
    
    # Determine if j1 and j2 are integers or half-integers
    j1_is_integer = abs(j1 - round(j1)) < 1e-10
    j2_is_integer = abs(j2 - round(j2)) < 1e-10
    
    # Determine if j should be integer or half-integer
    j_must_be_integer = (j1_is_integer and j2_is_integer) or (not j1_is_integer and not j2_is_integer)
    
    result = []
    
    # Start at j_min and increment by 1 until we reach j_max
    j = j_min
    while j <= j_max + 1e-10:
        j_is_integer = abs(j - round(j)) < 1e-10
        
        # Add to results if j has the correct "integer-ness"
        if (j_must_be_integer and j_is_integer) or (not j_must_be_integer and not j_is_integer):
            result.append(j)
        
        j += 1
    
    return result

def intertwiner_dimension(j1, j2, j3, j4):
    """
    Calculate the dimension of the intertwiner space for a 4-valent node
    with edges labeled j1, j2, j3, j4.
    """
    # Convert inputs to float for calculation
    j1, j2, j3, j4 = float(j1), float(j2), float(j3), float(j4)
    
    # Get allowed intermediate spins
    j12_values = allowed_intermediate_spins(j1, j2)
    j34_values = allowed_intermediate_spins(j3, j4)
    
    # Count overlapping values that can couple to j=0
    dimension = 0
    for j in j12_values:
        if any(abs(j - j_val) < 1e-10 for j_val in j34_values):
            dimension += 1
    
    return dimension

def cg_coefficient(j1, m1, j2, m2, j, m):
    """
    Calculate Clebsch-Gordan coefficient <j1 m1 j2 m2|j m>.
    """
    try:
        # Use sympy's CG function - we need to convert to Rational for exact calculations
        coef = float(CG(S(j1), S(m1), S(j2), S(m2), S(j), S(m)).doit())
        return coef
    except Exception as e:
        print(f"Error calculating CG coefficient: {e}")
        return 0.0

def construct_basis_vector(j1, j2, j3, j4, intermediate_j):
    """
    Construct a basis vector for the intertwiner space corresponding to 
    the intermediate coupling through value j.
    """
    # Convert to float for numerical calculation
    j1, j2, j3, j4, intermediate_j = float(j1), float(j2), float(j3), float(j4), float(intermediate_j)
    
    # Calculate dimensions
    dim1, dim2, dim3, dim4 = int(2*j1+1), int(2*j2+1), int(2*j3+1), int(2*j4+1)
    total_dim = dim1 * dim2 * dim3 * dim4
    
    # Initialize basis vector
    basis_vector = np.zeros(total_dim, dtype=complex)
    
    # Generate all possible m values
    m1_values = [j1 - i for i in range(dim1)]
    m2_values = [j2 - i for i in range(dim2)]
    m3_values = [j3 - i for i in range(dim3)]
    m4_values = [j4 - i for i in range(dim4)]
    
    # Couple j1 and j2 to intermediate_j, then couple with j3 and j4 to total j=0
    for m1, m2, m3, m4 in product(m1_values, m2_values, m3_values, m4_values):
        # Skip if m values don't sum to 0 (required for j=0)
        if abs(m1 + m2 + m3 + m4) > 1e-10:
            continue
        
        # Sum over allowed intermediate m values
        intermediate_dim = int(2*intermediate_j + 1)
        for i in range(intermediate_dim):
            intermediate_m = intermediate_j - i
            
            # Calculate Clebsch-Gordan coefficients
            cg1 = cg_coefficient(j1, m1, j2, m2, intermediate_j, intermediate_m)
            cg2 = cg_coefficient(intermediate_j, intermediate_m, j3, m3, j4, -m4)  # Note: For j=0, m must be 0
            
            # Calculate index in the tensor product basis
            idx = (int(j1-m1) * dim2 * dim3 * dim4 + 
                   int(j2-m2) * dim3 * dim4 + 
                   int(j3-m3) * dim4 + 
                   int(j4-m4))
            
            if 0 <= idx < total_dim:  # Ensure index is within bounds
                basis_vector[idx] += cg1 * cg2
    
    # Normalize
    norm = np.linalg.norm(basis_vector)
    if norm > 1e-10:  # Avoid division by zero
        basis_vector = basis_vector / norm
    
    return basis_vector

def get_intertwiner_basis(j1, j2, j3, j4):
    """
    Calculate the complete basis for the intertwiner space of a 4-valent node
    with edges labeled j1, j2, j3, j4.
    """
    # Convert to float for calculation
    j1, j2, j3, j4 = float(j1), float(j2), float(j3), float(j4)
    
    # Get allowed intermediate spins
    j12_values = allowed_intermediate_spins(j1, j2)
    j34_values = allowed_intermediate_spins(j3, j4)
    
    # Find common intermediate values with tolerance for floating point comparison
    common_js = []
    for j12 in j12_values:
        for j34 in j34_values:
            if abs(j12 - j34) < 1e-10:
                common_js.append(j12)
                break
    
    # Construct basis vectors
    basis = []
    for j in common_js:
        try:
            vector = construct_basis_vector(j1, j2, j3, j4, j)
            # Check if vector is non-zero
            if np.linalg.norm(vector) > 1e-10:
                basis.append((j, vector))
        except Exception as e:
            print(f"Error constructing basis vector for j={j}: {e}")
    
    return basis

def orthonormalize_basis(basis_vectors):
    """
    Apply Gram-Schmidt process to orthonormalize a set of basis vectors.
    """
    if not basis_vectors:
        return []
    
    orthonormal_basis = []
    for i, (j, vector) in enumerate(basis_vectors):
        if i > 0:
            # Project out all previous vectors
            for _, prev_vector in orthonormal_basis:
                projection = np.vdot(prev_vector, vector)
                vector = vector - projection * prev_vector
        
        # Normalize
        norm = np.linalg.norm(vector)
        if norm > 1e-10:  # Avoid division by zero
            vector = vector / norm
            orthonormal_basis.append((j, vector))
    
    return orthonormal_basis

def visualize_intertwiner_dimension(max_j=5, step=0.5):
    """
    Visualize how intertwiner dimension varies with spin values.
    """
    j_values = np.arange(0, max_j + step, step)
    dims = np.zeros((len(j_values), len(j_values)))
    
    for i, j1 in enumerate(j_values):
        for j, j2 in enumerate(j_values):
            dims[i, j] = intertwiner_dimension(j1, j2, j1, j2)
    
    plt.figure(figsize=(10, 8))
    plt.imshow(dims, interpolation='nearest', origin='lower', 
              extent=[0, max_j, 0, max_j])
    plt.colorbar(label='Intertwiner Dimension')
    plt.xlabel('j1 = j3')
    plt.ylabel('j2 = j4')
    plt.title('Intertwiner Space Dimension (j1=j3, j2=j4)')
    plt.tight_layout()
    plt.show()

def visualize_3d_intertwiner_dimension(max_j=3, step=0.5):
    """
    Create a 3D visualization of intertwiner dimensions for j1=j3, j2=j4.
    """
    j_values = np.arange(0, max_j + step, step)
    X, Y = np.meshgrid(j_values, j_values)
    Z = np.zeros_like(X)
    
    for i in range(len(j_values)):
        for j in range(len(j_values)):
            Z[i, j] = intertwiner_dimension(X[i, j], Y[i, j], X[i, j], Y[i, j])
    
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')
    surf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolor='none', alpha=0.8)
    
    ax.set_xlabel('j1 = j3')
    ax.set_ylabel('j2 = j4')
    ax.set_zlabel('Intertwiner Dimension')
    ax.set_title('3D Visualization of Intertwiner Space Dimensions')
    
    fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)
    plt.tight_layout()
    plt.show()

# Example usage:
if __name__ == "__main__":
    # Example 1: Four spin-1/2 edges
    print("Example 1: Four spin-1/2 edges")
    j_values = [0.5, 0.5, 0.5, 0.5]
    dim = intertwiner_dimension(*j_values)
    print(f"Intertwiner dimension: {dim}")
    
    basis = get_intertwiner_basis(*j_values)
    orthonormal_basis = orthonormalize_basis(basis)
    print(f"Basis states correspond to intermediate j values: {[j for j, _ in orthonormal_basis]}")
    
    # Example 2: Two spin-1/2 and two spin-1
    print("Example 2: Two spin-1/2 and two spin-1")
    j_values = [0.5, 0.5, 1, 1]
    dim = intertwiner_dimension(*j_values)
    print(f"Intertwiner dimension: {dim}")
    
    basis = get_intertwiner_basis(*j_values)
    orthonormal_basis = orthonormalize_basis(basis)
    print(f"Basis states correspond to intermediate j values: {[j for j, _ in orthonormal_basis]}")
    
    # Example 3: All different spins
    print("Example 3: Different spins (0.5, 1, 1.5, 2)")
    j_values = [0.5, 1, 1.5, 2]
    dim = intertwiner_dimension(*j_values)
    print(f"Intertwiner dimension: {dim}")
    
    basis = get_intertwiner_basis(*j_values)
    orthonormal_basis = orthonormalize_basis(basis)
    print(f"Basis states correspond to intermediate j values: {[j for j, _ in orthonormal_basis]}")
    
    # Collect data into a list of rows
    j_values = [0.5,1.0]
    data = []
    for j_1, j_2, j_3, j_4 in sorted(product(j_values, j_values, j_values, j_values)):
        dimension = intertwiner_dimension(j_1, j_2, j_3, j_4)
        data.append([j_1, j_2, j_3, j_4, dimension])

    # Define headers for the table
    headers = ["j1", "j2", "j3", "j4", "Intertwiner Dimension"]

    # Print the table
    print(tabulate(data, headers=headers, tablefmt="grid"))
        
    print(intertwiner_dimension(1, 0.5, 0.5, 1))
    print(intertwiner_dimension(1,1,0.5,0.5))
    
    # Demonstrate the order dependence issue
    print("Demonstrating Order Dependence Issue:")
    print("Case 1: intertwiner_dimension(1, 0.5, 0.5, 1) =", intertwiner_dimension(1, 0.5, 0.5, 1))
    print("Case 2: intertwiner_dimension(1, 1, 0.5, 0.5) =", intertwiner_dimension(1, 1, 0.5, 0.5))
    
    # Visualize intertwiner dimensions
    # print("Generating visualizations of intertwiner dimensions...")
    # visualize_intertwiner_dimension(max_j=3)
    # visualize_3d_intertwiner_dimension(max_j=2)

def permutation_invariant_intertwiner_dimension(j1, j2, j3, j4):
    """
    Calculate the dimension of the intertwiner space for a 4-valent node
    with edges labeled j1, j2, j3, j4, invariant under permutation of the spins.
    
    This function ensures the same result regardless of how the spins are ordered
    by sorting them before calculation.
    """
    # Sort the spins to ensure permutation invariance
    spins = sorted([float(j1), float(j2), float(j3), float(j4)])
    
    # We can use any consistent ordering once we've sorted them
    # Using first two spins and last two spins for coupling
    j1, j2, j3, j4 = spins
    
    # Get allowed intermediate spins
    j12_values = allowed_intermediate_spins(j1, j2)
    j34_values = allowed_intermediate_spins(j3, j4)
    
    # Count overlapping values that can couple to j=0
    dimension = 0
    for j in j12_values:
        if any(abs(j - j_val) < 1e-10 for j_val in j34_values):
            dimension += 1
    
    return dimension

def max_intertwiner_dimension(j1, j2, j3, j4):
    """
    Calculate the maximum possible dimension of the intertwiner space for a 4-valent node
    by considering all possible recoupling schemes (pairings of the 4 spins).
    
    This is useful if you want to know the maximum number of basis states possible
    when considering all recoupling schemes.
    """
    # Convert inputs to float for calculation
    spins = [float(j1), float(j2), float(j3), float(j4)]
    
    # Check all three possible pairings
    # (j1,j2)(j3,j4)
    dim1 = intertwiner_dimension(spins[0], spins[1], spins[2], spins[3])
    
    # (j1,j3)(j2,j4)
    dim2 = intertwiner_dimension(spins[0], spins[2], spins[1], spins[3])
    
    # (j1,j4)(j2,j3)
    dim3 = intertwiner_dimension(spins[0], spins[3], spins[1], spins[2])
    
    return max(dim1, dim2, dim3)

def all_recoupling_dimensions(j1, j2, j3, j4):
    """
    Return the intertwiner dimensions for all possible recoupling schemes.
    This helps understand how different recoupling schemes affect the dimension.
    """
    # Convert inputs to float for calculation
    spins = [float(j1), float(j2), float(j3), float(j4)]
    
    # Calculate dimensions for all three possible pairings
    results = {
        "(j1,j2)(j3,j4)": intertwiner_dimension(spins[0], spins[1], spins[2], spins[3]),
        "(j1,j3)(j2,j4)": intertwiner_dimension(spins[0], spins[2], spins[1], spins[3]),
        "(j1,j4)(j2,j3)": intertwiner_dimension(spins[0], spins[3], spins[1], spins[2])
    }
    
    return results

# Example of using the permutation-invariant functions
if __name__ == "__main__":
    print("Using permutation-invariant functions:")
    print("permutation_invariant_intertwiner_dimension(1, 0.5, 0.5, 1) =", 
          permutation_invariant_intertwiner_dimension(1, 0.5, 0.5, 1))
    print("permutation_invariant_intertwiner_dimension(1, 1, 0.5, 0.5) =", 
          permutation_invariant_intertwiner_dimension(1, 1, 0.5, 0.5))
    
    print("Max dimension across all recoupling schemes:")
    print("max_intertwiner_dimension(1, 0.5, 0.5, 1) =", max_intertwiner_dimension(1, 0.5, 0.5, 1))
    
    print("All recoupling scheme dimensions for (1, 0.5, 0.5, 1):")
    all_dims = all_recoupling_dimensions(1, 0.5, 0.5, 1)
    for scheme, dim in all_dims.items():
        print(f"  {scheme}: {dim}")