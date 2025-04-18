# Intertwiner Spaces in Spin Networks

## Basic Concept

In a spin network, each edge is labeled by a spin value j (typically 1/2, 1, 3/2, etc.). When representing this as a quantum state, each edge is assigned a Hilbert space of dimension 2j+1.

At each node where multiple edges meet, we need an *intertwiner* - an SU(2)-invariant tensor that maps between the tensor product of the edge spaces. The space of all possible intertwiners at a node is called the intertwiner space.

## Four-Valent Nodes

For a node with four edges labeled j₁, j₂, j₃, j₄, the intertwiner space dimension equals the number of ways to couple these four representations to obtain a scalar (j=0) representation.

### Dimension Calculation

The dimension is given by:

$$\dim(\text{Inv}(j_1 \otimes j_2 \otimes j_3 \otimes j_4)) = \sum_j N_{j_1,j_2}^j \cdot N_{j,j_3}^{j_4}$$

Where $N_{a,b}^c$ counts how many times spin $c$ appears in the tensor product of spins $a$ and $b$.

### Common Examples

1. **Four spin-1/2 edges (j=1/2, 1/2, 1/2, 1/2)**:
   - Decomposition: $\frac{1}{2} \otimes \frac{1}{2} \otimes \frac{1}{2} \otimes \frac{1}{2} = 0 \oplus 0 \oplus 1 \oplus 1 \oplus 1 \oplus 2$
   - The intertwiner space is 2-dimensional (two j=0 representations)
   - Basis vectors can be constructed by pairing edges in different ways:
     $$|\Psi_1\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{12} \otimes \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{34}$$
     $$|\Psi_2\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{13} \otimes \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{24}$$

2. **Three spin-1/2 and one spin-1 (j=1/2, 1/2, 1/2, 1)**:
   - The intertwiner space is 2-dimensional
   - Basis vectors involve more complex coupling schemes using Clebsch-Gordan coefficients

3. **Two spin-1/2 and two spin-1 (j=1/2, 1/2, 1, 1)**:
   - The intertwiner space is 2-dimensional
   - One basis vector couples the two spin-1/2 edges to a singlet and the two spin-1 edges to another singlet:
     $$|\Psi_1\rangle = \frac{1}{\sqrt{2}}(|\uparrow\downarrow\rangle - |\downarrow\uparrow\rangle)_{12} \otimes \frac{1}{\sqrt{3}}(|1,-1\rangle - |0,0\rangle + |-1,1\rangle)_{34}$$
   - The second basis vector uses intermediate couplings through Clebsch-Gordan coefficients

## General Algorithm for Intertwiner Spaces

To determine the dimension and basis of an intertwiner space for arbitrary edge labels:

1. **Calculate dimension**:
   - Decompose the tensor product of all edge representations
   - Count the multiplicity of the trivial (j=0) representation

2. **Construct basis vectors**:
   - Identify independent recoupling schemes that yield j=0
   - For each scheme, compute appropriate products of Clebsch-Gordan coefficients
   - Form linear combinations of tensor product basis states according to these coefficients

3. **Orthonormalize** the resulting basis if needed

## When Is the Intertwiner Space Two-Dimensional?

For a 4-valent node with spins j₁, j₂, j₃, j₄, the intertwiner space is two-dimensional precisely when:

- The intermediate coupling j (when coupling j₁ with j₂, and j₃ with j₄) can take exactly two values
- These values must satisfy all triangle inequalities:
  - $|j_1-j_2| \leq j \leq (j_1+j_2)$
  - $|j_3-j_4| \leq j \leq (j_3+j_4)$
- The allowed ranges for j must overlap in exactly two values

The dimension increases when these ranges overlap in more than two values, and decreases when they overlap in fewer than two values or when some triangle inequalities cannot be satisfied.

### Special Case: Spin Pairs

Visualizing the intertwiner dimensions for various spin combinations reveals an interesting pattern:

When the four spins come in matching pairs (j₁=j₃ and j₂=j₄), the intertwiner space is consistently two-dimensional if any two of the spins are j=1/2. This occurs because when two edges have spin-1/2, they can couple to either j=0 or j=1, and with symmetric pairings, these intermediate couplings typically yield exactly two paths to a j=0 total state.

## Step-by-Step Tutorial: Computing Intertwiner Basis for Four Spin-1/2 Edges

Here's a detailed tutorial for explicitly calculating the intertwiner basis states for a 4-valent node with all edges labeled j=1/2:

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
