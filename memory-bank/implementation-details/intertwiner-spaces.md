# Intertwiner Spaces in Spin Networks

## Table of Contents
1. [Basic Concepts](#1-basic-concepts)
2. [Four-Valent Nodes and Intertwiner Dimension](#2-four-valent-nodes-and-intertwiner-dimension)
3. [Order Dependence in Intertwiner Space Calculations](#3-order-dependence-in-intertwiner-space-calculations)
4. [Recoupling Schemes and Physical Meaning](#4-recoupling-schemes-and-physical-meaning)
5. [Permutation Invariance and Implementation Strategies](#5-permutation-invariance-and-implementation-strategies)
6. [Common Examples and Special Cases](#6-common-examples-and-special-cases)
7. [Computing Intertwiner Basis States](#7-computing-intertwiner-basis-states)
8. [Implementation in Code](#8-implementation-in-code)
9. [General Algorithm for Arbitrary Intertwiners](#9-general-algorithm-for-arbitrary-intertwiners)

## 1. Basic Concepts

In a spin network, each edge is labeled by a spin value $j$ (typically $\frac{1}{2}$, 1, $\frac{3}{2}$, etc.). When representing this as a quantum state, each edge is assigned a Hilbert space of dimension $2j+1$.

At each node where multiple edges meet, we need an *intertwiner* - an SU(2)-invariant tensor that maps between the tensor product of the edge Hilbert spaces. The space of all possible intertwiners at a node is called the intertwiner space.

An intertwiner ensures that the total angular momentum at a node is conserved, maintaining gauge invariance under SU(2) transformations. In physical terms, intertwiners represent the "glue" that connects angular momentum carriers (edges) in a consistent quantum mechanical way.

## 2. Four-Valent Nodes and Intertwiner Dimension

For a node with four edges labeled $j_1$, $j_2$, $j_3$, $j_4$, the intertwiner space dimension equals the number of independent ways to couple these four representations to obtain a scalar (j=0) representation.

### Dimension Calculation

The dimension is given by:

$$\dim(\text{Inv}(j_1 \otimes j_2 \otimes j_3 \otimes j_4)) = \sum_j N_{j_1,j_2}^j \cdot N_{j_3,j_4}^j$$

Where $N_{a,b}^c$ counts how many times spin $c$ appears in the tensor product of spins $a$ and $b$.

In practical terms, this dimension can be calculated by:
1. Finding allowed intermediate spins when coupling $j_1$ and $j_2$ (yielding $j_{12}$ values)
2. Finding allowed intermediate spins when coupling $j_3$ and $j_4$ (yielding $j_{34}$ values)
3. Counting overlapping values between these two sets

### When Is the Intertwiner Space Two-Dimensional?

For a 4-valent node with spins $j_1$, $j_2$, $j_3$, $j_4$, the intertwiner space is two-dimensional precisely when:

- The intermediate coupling $j$ (when coupling $j_1$ with $j_2$, and $j_3$ with $j_4$) can take exactly two values
- These values must satisfy all triangle inequalities:
  - $|j_1-j_2| \leq j \leq (j_1+j_2)$
  - $|j_3-j_4| \leq j \leq (j_3+j_4)$
- The allowed ranges for $j$ must overlap in exactly two values

The dimension increases when these ranges overlap in more than two values, and decreases when they overlap in fewer than two values or when some triangle inequalities cannot be satisfied.

## 3. Order Dependence in Intertwiner Space Calculations

An important subtlety in intertwiner calculations is that the dimension can depend on the specific recoupling scheme used, which means that different orderings of the same set of spins can yield different results. This is not an error but reflects the physical meaning of the calculation.

For example:
- $\dim(\text{Intertwiner}(1, 0.5, 0.5, 1)) = 3$
- $\dim(\text{Intertwiner}(1, 1, 0.5, 0.5)) = 2$

Despite both cases involving the same set of spins (two spin-1/2 and two spin-1), the dimensions differ because they represent different recoupling schemes.

### Mathematical Explanation

Let's examine why this happens in our examples:

**Case 1: $(1, 0.5, 0.5, 1)$**
- $j_1=1, j_2=0.5 \Rightarrow j_{12} \in \{0.5, 1.5\}$
- $j_3=0.5, j_4=1 \Rightarrow j_{34} \in \{0.5, 1.5\}$
- Overlapping values: 0.5, 1.5 → dimension = 2

**Case 2: $(1, 1, 0.5, 0.5)$**
- $j_1=1, j_2=1 \Rightarrow j_{12} \in \{0, 1, 2\}$
- $j_3=0.5, j_4=0.5 \Rightarrow j_{34} \in \{0, 1\}$
- Overlapping values: 0, 1 → dimension = 2

**Case 3: $(1, 0.5, 1, 0.5)$**
- $j_1=1, j_2=0.5 \Rightarrow j_{12} \in \{0.5, 1.5\}$
- $j_3=1, j_4=0.5 \Rightarrow j_{34} \in \{0.5, 1.5\}$
- Overlapping values: 0.5, 1.5 → dimension = 2

This demonstrates that the recoupling scheme (the order of the spins) affects the calculated dimension of the intertwiner space.

## 4. Recoupling Schemes and Physical Meaning

The dependence of intertwiner dimensions on the recoupling scheme has a profound physical meaning in quantum angular momentum theory.

### Recoupling Scheme Formalism

The standard approach to calculating intertwiner dimensions involves:

1. Coupling $j_1$ with $j_2$ to produce intermediate spins $j_{12}$
2. Coupling $j_3$ with $j_4$ to produce intermediate spins $j_{34}$
3. Requiring $j_{12} = j_{34}$ to achieve total angular momentum zero

This scheme can be written as:
$$ (j_1 \otimes j_2) \otimes (j_3 \otimes j_4) \rightarrow j = 0 $$

But we could equally well have chosen different pairings:
$$ (j_1 \otimes j_3) \otimes (j_2 \otimes j_4) \rightarrow j = 0 $$
$$ (j_1 \otimes j_4) \otimes (j_2 \otimes j_3) \rightarrow j = 0 $$

Each of these represents a different recoupling scheme.

### Basis States vs. Vector Space

While different recoupling schemes can yield different dimensions, they are all describing the same physical space of 4-valent intertwiners. What's happening is that each recoupling scheme provides a different basis for this space, and some bases may not be complete.

In quantum mechanics, we express states in terms of a chosen basis. The recoupling scheme determines which basis we use:

$$|\psi\rangle = \sum_i c_i |i\rangle$$

Where $|i\rangle$ represents basis states determined by our recoupling scheme.

### Coupling History and Quantum States

The recoupling scheme captures the "coupling history" - it tells us which angular momenta were combined first. In quantum mechanics, different coupling histories can lead to different intermediate states, even when the final state is the same.

For instance, when we write $(j_1 \otimes j_2) \otimes (j_3 \otimes j_4)$, we're specifying:
1. First couple $j_1$ with $j_2$ to get intermediate states $j_{12}$
2. Then couple $j_3$ with $j_4$ to get intermediate states $j_{34}$
3. Finally, couple $j_{12}$ with $j_{34}$ to get the final state

This history affects the basis we use to represent our states.

### Recoupling Theory and 6j Symbols

The relationship between different coupling schemes is governed by recoupling theory, which uses mathematical objects called 6j symbols:

$$\begin{Bmatrix} j_1 & j_2 & j_{12} \\ j_3 & j_4 & j_{34} \end{Bmatrix}$$

These symbols give the transformation coefficients between different coupling schemes.

### Complete Basis and Maximum Dimension

If we want a complete basis for the intertwiner space, we should use the coupling scheme that yields the maximum dimension. This ensures we capture all possible independent states.

The maximum dimension can be calculated by:

$$\dim(\text{Intertwiner}) = \max_{\text{schemes}} \dim(\text{scheme})$$

In practical terms, we can compare the dimensions for all three possible pairings and take the maximum.

## 5. Permutation Invariance and Implementation Strategies

### Permutation Groups and Invariance

From a mathematical perspective, there are 24 possible permutations of four spins (the symmetric group $S_4$). However, for intertwiner calculations, we're concerned with permutations that change the recoupling scheme.

For a specific scheme $(j_1, j_2)(j_3, j_4)$, the following permutations leave the calculation invariant:
- Swapping $j_1 \leftrightarrow j_2$
- Swapping $j_3 \leftrightarrow j_4$
- Swapping $(j_1, j_2) \leftrightarrow (j_3, j_4)$

This gives us the group $S_2 \times S_2 \times S_2$ with 8 elements, meaning there are $24/8 = 3$ distinct equivalence classes of permutations that can affect the dimension calculation.

### Implementation Strategies

If you need a consistent result regardless of spin ordering, you have several options:

1. **Standard Convention Approach**: Always use the same recoupling scheme
   - Choose a specific ordering convention
   - Reorder input spins to match this convention
   - Apply the standard calculation method

2. **Permutation-Invariant Approach**: Ensure consistent results regardless of input order
   - Sort spins before calculation
   - Use a consistent coupling scheme on the sorted spins

3. **Maximum Dimension Approach**: Calculate all possible dimensions and take the maximum
   - Compute dimensions for all distinct recoupling schemes
   - Use the maximum value as the "true" dimension
   - This ensures a complete basis but may obscure the physical interpretation

4. **Analysis Approach**: Calculate dimensions for all possible recoupling schemes
   - Return a dictionary with dimensions for each scheme
   - This provides the most comprehensive understanding of the space

### Practical Recommendation

Unless you specifically need permutation invariance, it's best to preserve the physical meaning by keeping the calculation order-dependent. Just be explicit about which recoupling scheme you're using when reporting results.

If you need consistent results across different spin orderings, choose one of the permutation-invariant approaches and document your convention clearly.

## 6. Common Examples and Special Cases

### Four Spin-1/2 Edges (j=1/2, 1/2, 1/2, 1/2)

- Decomposition: $\frac{1}{2} \otimes \frac{1}{2} \otimes \frac{1}{2} \otimes \frac{1}{2} = 0 \oplus 0 \oplus 1 \oplus 1 \oplus 1 \oplus 2$
- The intertwiner space is 2-dimensional (two j=0 representations)
- Basis vectors can be constructed by pairing edges in different ways:
  $$|\Psi_1\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{12} \otimes \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{34}$$
  $$|\Psi_2\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{13} \otimes \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{24}$$

### Three Spin-1/2 and One Spin-1 (j=1/2, 1/2, 1/2, 1)

- The intertwiner space is 2-dimensional
- Basis vectors involve more complex coupling schemes using Clebsch-Gordan coefficients

### Two Spin-1/2 and Two Spin-1 (j=1/2, 1/2, 1, 1)

- The intertwiner space dimension depends on the recoupling scheme:
  - With scheme $(j_1, j_2)(j_3, j_4) = (1/2, 1/2)(1, 1)$: Dimension = 2
  - With scheme $(j_1, j_2)(j_3, j_4) = (1, 1/2)(1/2, 1)$: Dimension = 2
  - With scheme $(j_1, j_2)(j_3, j_4) = (1, 1)(1/2, 1/2)$: Dimension = 2
- One basis vector couples the two spin-1/2 edges to a singlet and the two spin-1 edges to another singlet:
  $$|\Psi_1\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{12} \otimes \frac{1}{\sqrt{3}}(|1,-1\rangle - |0,0\rangle + |-1,1\rangle)_{34}$$
- The second basis vector uses intermediate couplings through Clebsch-Gordan coefficients

### Special Case: Spin Pairs

Visualizing the intertwiner dimensions for various spin combinations reveals an interesting pattern:

When the four spins come in matching pairs (j₁=j₃ and j₂=j₄), the intertwiner space is consistently two-dimensional if any two of the spins are j=1/2. This occurs because when two edges have spin-1/2, they can couple to either j=0 or j=1, and with symmetric pairings, these intermediate couplings typically yield exactly two paths to a j=0 total state.

## 7. Computing Intertwiner Basis States

Here we present a detailed tutorial for explicitly calculating the intertwiner basis states for a 4-valent node with all edges labeled j=1/2:

### Step 1: Analyze Possible Recoupling Schemes

For four spin-1/2 particles, we first need to identify how to couple them to get a total j=0 state:

1. First coupling: Combine spins 1 & 2 → intermediate angular momentum j₁₂
   - Possibilities: $j_{12} = 0$ (singlet) or $j_{12} = 1$ (triplet)

2. Second coupling: Combine spins 3 & 4 → intermediate angular momentum j₃₄
   - Possibilities: $j_{34} = 0$ (singlet) or $j_{34} = 1$ (triplet)

3. Final coupling: Combine $j_{12}$ with $j_{34}$ → this must equal 0
   - Only possible when $j_{12} = j_{34}$ (either both 0 or both 1)

### Step 2: Identify Basis States

This gives us exactly two possible paths to j=0:
1. First basis state: $(j_{12}=0) \otimes (j_{34}=0)$ (both pairs form singlets)
2. Second basis state: $(j_{12}=1) \otimes (j_{34}=1)$ (both pairs form triplets, which couple to j=0)

### Step 3: Construct Explicit State Vectors

Using the standard basis $|\uparrow\rangle$ and $|\downarrow\rangle$ for each spin-1/2:

1. First basis state (pairing 1-2 and 3-4):

$$|\Psi_1\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{12} \otimes \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{34}$$

Expanded in the tensor product basis:

$$|\Psi_1\rangle = \frac{1}{2}(|\uparrow\downarrow\uparrow\downarrow\rangle - |\uparrow\downarrow\downarrow\uparrow\rangle - |\downarrow\uparrow\uparrow\downarrow\rangle + |\downarrow\uparrow\downarrow\uparrow\rangle)$$

2. Second basis state (using triplet coupling):

$$|\Psi_2\rangle = \frac{1}{\sqrt{3}}(|\uparrow\uparrow\downarrow\downarrow\rangle + |\downarrow\downarrow\uparrow\uparrow\rangle - \frac{1}{2}(|\uparrow\downarrow\uparrow\downarrow\rangle + |\uparrow\downarrow\downarrow\uparrow\rangle + |\downarrow\uparrow\uparrow\downarrow\rangle + |\downarrow\uparrow\downarrow\uparrow\rangle))$$

### Step 4: Verify Orthogonality and Normalization

You can verify these states are orthogonal:

$$\langle\Psi_1|\Psi_2\rangle = 0$$

And each is properly normalized:

$$\langle\Psi_1|\Psi_1\rangle = \langle\Psi_2|\Psi_2\rangle = 1$$

### Step 5: Verify SU(2) Invariance

Both states should be eigenstates of the total angular momentum operators with eigenvalue j=0:

$$\hat{J}^2|\Psi_i\rangle = 0$$
$$\hat{J}_z|\Psi_i\rangle = 0$$

Where $\hat{J} = \hat{J}_1 + \hat{J}_2 + \hat{J}_3 + \hat{J}_4$ is the total angular momentum operator.

This confirms we have constructed a proper basis for the two-dimensional intertwiner space.

## 8. Implementation in Code

We provide several functions to handle the permutation-invariance issue:

1. **Standard Intertwiner Dimension**: The standard calculation based on a specific recoupling scheme
   ```python
   def intertwiner_dimension(j1, j2, j3, j4):
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
   ```

2. **Permutation-Invariant Dimension**: Always sorts spins before calculation
   ```python
   def permutation_invariant_intertwiner_dimension(j1, j2, j3, j4):
       spins = sorted([float(j1), float(j2), float(j3), float(j4)])
       return intertwiner_dimension(*spins)
   ```

3. **Maximum Dimension**: Returns the maximum dimension across all recoupling schemes
   ```python
   def max_intertwiner_dimension(j1, j2, j3, j4):
       # Check all three possible pairings
       dim1 = intertwiner_dimension(j1, j2, j3, j4)
       dim2 = intertwiner_dimension(j1, j3, j2, j4)
       dim3 = intertwiner_dimension(j1, j4, j2, j3)
       return max(dim1, dim2, dim3)
   ```

4. **All Recoupling Schemes**: Returns dimensions for all possible recoupling schemes
   ```python
   def all_recoupling_dimensions(j1, j2, j3, j4):
       return {
           "(j1,j2)(j3,j4)": intertwiner_dimension(j1, j2, j3, j4),
           "(j1,j3)(j2,j4)": intertwiner_dimension(j1, j3, j2, j4),
           "(j1,j4)(j2,j3)": intertwiner_dimension(j1, j4, j2, j3)
       }
   ```

## 9. General Algorithm for Arbitrary Intertwiners

To determine the dimension and basis of an intertwiner space for arbitrary edge labels:

1. **Calculate dimension**:
   - Decompose the tensor product of all edge representations
   - Count the multiplicity of the trivial (j=0) representation
   
   For a 4-valent node:
   - Find allowed intermediate spins for the chosen recoupling scheme
   - Count overlapping values that satisfy all constraints

2. **Construct basis vectors**:
   - Identify independent recoupling schemes that yield j=0
   - For each scheme, compute appropriate products of Clebsch-Gordan coefficients
   - Form linear combinations of tensor product basis states according to these coefficients

3. **Orthonormalize** the resulting basis if needed using the Gram-Schmidt process

4. **Verify invariance** by checking that the basis states are eigenstates of the total angular momentum operators with eigenvalue j=0
