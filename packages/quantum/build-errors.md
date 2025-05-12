
> @spin-network/quantum@0.1.0 build /Users/deepak/code/spin_network_app/packages/quantum
> tsc && vite build

src/index.ts(8,1): error TS2308: Module './core/types' has already exported a member named 'StateVector'. Consider explicitly re-exporting to resolve the ambiguity.
src/operators/algebra.ts(38,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(64,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(69,21): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(70,21): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(74,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(76,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(77,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(82,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(84,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(85,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(91,7): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(120,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(125,21): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(126,21): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(130,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(132,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(133,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(138,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(140,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(141,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(147,7): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/algebra.ts(232,52): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(239,46): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(240,46): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(265,11): error TS2365: Operator '>' cannot be applied to types 'Complex' and 'number'.
src/operators/algebra.ts(343,35): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/algebra.ts(361,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(10,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(10,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(11,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(11,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(16,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(16,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(17,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(17,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(22,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(22,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(23,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(23,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(28,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(28,55): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(29,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(29,55): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(34,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(34,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(34,73): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(34,104): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(35,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(35,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(35,73): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(35,104): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(36,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(36,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(36,73): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(36,104): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(37,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(37,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(37,73): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/gates.ts(37,104): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(139,56): error TS18046: 'e' is of type 'unknown'.
src/operators/hamiltonian.ts(149,37): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: HamiltonianTerm, currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => HamiltonianTerm, initialValue: HamiltonianTerm): HamiltonianTerm', gave the following error.
    Argument of type '(acc: (Complex & MathCollection)[][], term: HamiltonianTerm) => Complex[][]' is not assignable to parameter of type '(previousValue: HamiltonianTerm, currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => HamiltonianTerm'.
      Types of parameters 'acc' and 'previousValue' are incompatible.
        Type 'HamiltonianTerm' is missing the following properties from type '(Complex & MathCollection)[][]': length, pop, push, concat, and 35 more.
  Overload 2 of 3, '(callbackfn: (previousValue: (Complex & MathCollection)[][], currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => (Complex & MathCollection)[][], initialValue: (Complex & MathCollection)[][]): (Complex & MathCollection)[][]', gave the following error.
    Argument of type '(acc: (Complex & MathCollection)[][], term: HamiltonianTerm) => Complex[][]' is not assignable to parameter of type '(previousValue: (Complex & MathCollection)[][], currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => (Complex & MathCollection)[][]'.
      Type 'Complex[][]' is not assignable to type '(Complex & MathCollection)[][]'.
        Type 'Complex[]' is not assignable to type '(Complex & MathCollection)[]'.
          Type 'Complex' is not assignable to type 'Complex & MathCollection'.
            Type 'Complex' is not assignable to type 'Complex & Matrix'.
              Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/hamiltonian.ts(156,54): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(159,26): error TS2345: Argument of type 'HamiltonianTerm' is not assignable to parameter of type 'ComplexMatrix'.
  Type 'HamiltonianTerm' is missing the following properties from type 'Complex[][]': length, pop, push, concat, and 35 more.
src/operators/hamiltonian.ts(163,59): error TS18046: 'e' is of type 'unknown'.
src/operators/hamiltonian.ts(168,33): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: HamiltonianTerm, currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => HamiltonianTerm, initialValue: HamiltonianTerm): HamiltonianTerm', gave the following error.
    Argument of type '(acc: (Complex & MathCollection)[][], term: HamiltonianTerm) => Complex[][]' is not assignable to parameter of type '(previousValue: HamiltonianTerm, currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => HamiltonianTerm'.
      Types of parameters 'acc' and 'previousValue' are incompatible.
        Type 'HamiltonianTerm' is missing the following properties from type '(Complex & MathCollection)[][]': length, pop, push, concat, and 35 more.
  Overload 2 of 3, '(callbackfn: (previousValue: (Complex & MathCollection)[][], currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => (Complex & MathCollection)[][], initialValue: (Complex & MathCollection)[][]): (Complex & MathCollection)[][]', gave the following error.
    Argument of type '(acc: (Complex & MathCollection)[][], term: HamiltonianTerm) => Complex[][]' is not assignable to parameter of type '(previousValue: (Complex & MathCollection)[][], currentValue: HamiltonianTerm, currentIndex: number, array: HamiltonianTerm[]) => (Complex & MathCollection)[][]'.
      Type 'Complex[][]' is not assignable to type '(Complex & MathCollection)[][]'.
        Type 'Complex[]' is not assignable to type '(Complex & MathCollection)[]'.
          Type 'Complex' is not assignable to type 'Complex & MathCollection'.
            Type 'Complex' is not assignable to type 'Complex & Matrix'.
              Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/hamiltonian.ts(175,50): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(179,11): error TS2345: Argument of type 'HamiltonianTerm' is not assignable to parameter of type 'ComplexMatrix'.
  Type 'HamiltonianTerm' is missing the following properties from type 'Complex[][]': length, pop, push, concat, and 35 more.
src/operators/hamiltonian.ts(223,44): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(236,40): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(346,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(350,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(354,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(400,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/hamiltonian.ts(424,60): error TS18046: 'e' is of type 'unknown'.
src/operators/hamiltonian.ts(427,31): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/measurement.ts(12,14): error TS2420: Class 'ProjectionOperator' incorrectly implements interface 'Operator'.
  Type 'ProjectionOperator' is missing the following properties from type 'Operator': scale, add, eigenDecompose
src/operators/measurement.ts(20,15): error TS2322: Type '{ re: number; im: number; }[][]' is not assignable to type 'Complex[][]'.
  Type '{ re: number; im: number; }[]' is not assignable to type 'Complex[]'.
    Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
src/operators/measurement.ts(58,33): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/measurement.ts(65,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/measurement.ts(66,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/measurement.ts(68,21): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/measurement.ts(78,9): error TS2322: Type 'this' is not assignable to type 'Operator'.
  Type 'ProjectionOperator' is missing the following properties from type 'Operator': scale, add, eigenDecompose
src/operators/measurement.ts(99,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/measurement.ts(103,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/measurement.ts(127,15): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/operators/measurement.ts(135,11): error TS2740: Type '{ dimension: number; amplitudes: Complex[]; basis: string | undefined; }' is missing the following properties from type 'StateVector': setState, getState, innerProduct, norm, and 4 more.
src/operators/operator.ts(20,17): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(26,17): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: any; im: any; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: any; im: any; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(84,45): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(84,77): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(102,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(108,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/operator.ts(154,25): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(159,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(163,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(164,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(166,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/operator.ts(194,25): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(201,36): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(327,39): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(327,71): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(338,25): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(363,16): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(364,16): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(393,25): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/operators/operator.ts(417,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/operators/operator.ts(436,29): error TS18048: 'vectors' is possibly 'undefined'.
src/operators/operator.ts(440,60): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(79,5): error TS2740: Type 'Complex[]' is missing the following properties from type 'Complex': re, im, clone, equals, and 6 more.
src/states/densityMatrix.ts(80,7): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: Complex[], currentValue: Complex[], currentIndex: number, array: Complex[][]) => Complex[], initialValue: Complex[]): Complex[]', gave the following error.
    Type 'Complex' is missing the following properties from type 'Complex[]': length, pop, push, concat, and 35 more.
  Overload 2 of 3, '(callbackfn: (previousValue: Complex & MathCollection, currentValue: Complex[], currentIndex: number, array: Complex[][]) => Complex & MathCollection, initialValue: Complex & MathCollection): Complex & MathCollection', gave the following error.
    Type 'Complex' is not assignable to type 'Complex & MathCollection'.
      Type 'Complex' is not assignable to type 'Complex & Matrix'.
        Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/states/densityMatrix.ts(81,12): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(94,22): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(96,7): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/states/densityMatrix.ts(160,44): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(166,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/states/densityMatrix.ts(195,44): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(209,18): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(211,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/states/densityMatrix.ts(260,44): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(271,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/states/densityMatrix.ts(380,23): error TS2365: Operator '<' cannot be applied to types 'Complex' and 'number'.
src/states/densityMatrix.ts(387,22): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(387,54): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/densityMatrix.ts(395,48): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(23,28): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(39,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(52,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(53,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(56,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(57,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(60,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(61,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(64,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(65,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(84,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(85,38): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(100,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(116,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(127,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/states.ts(128,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(23,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(55,23): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(59,7): error TS2322: Type 'MathType' is not assignable to type 'Complex & MathCollection'.
  Type 'number' is not assignable to type 'Complex & MathCollection'.
src/states/stateVector.ts(69,22): error TS2345: Argument of type 'Complex' is not assignable to parameter of type 'number'.
src/states/stateVector.ts(82,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(85,44): error TS2345: Argument of type 'MathType[]' is not assignable to parameter of type 'Complex[]'.
  Type 'MathType' is not assignable to type 'Complex'.
    Type 'number' is not assignable to type 'Complex'.
src/states/stateVector.ts(117,41): error TS2365: Operator '<' cannot be applied to types 'Complex' and 'number'.
src/states/stateVector.ts(133,13): error TS2365: Operator '<' cannot be applied to types 'Complex' and 'number'.
src/states/stateVector.ts(153,41): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(153,73): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/states/stateVector.ts(184,30): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(56,43): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(89,20): error TS18048: 'vectors' is possibly 'undefined'.
src/utils/information.ts(104,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(113,15): error TS18048: 'vectors' is possibly 'undefined'.
src/utils/information.ts(115,62): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(121,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/utils/information.ts(127,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(274,25): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(274,70): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(279,52): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(285,37): error TS18048: 'sigmaEigenvectors' is possibly 'undefined'.
src/utils/information.ts(285,72): error TS18048: 'sigmaEigenvectors' is possibly 'undefined'.
src/utils/information.ts(287,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/utils/information.ts(426,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(426,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(427,11): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(427,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(432,40): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(441,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/utils/information.ts(498,50): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/information.ts(510,11): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/utils/math.ts(20,22): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(20,53): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(27,22): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(27,53): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(34,5): error TS2322: Type '{ re: number; im: number; }[][]' is not assignable to type '(Complex & MathCollection)[][]'.
  Type '{ re: number; im: number; }[]' is not assignable to type '(Complex & MathCollection)[]'.
    Type '{ re: number; im: number; }' is not assignable to type 'Complex & MathCollection'.
      Type '{ re: number; im: number; }' is not assignable to type 'Complex & Matrix'.
        Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
src/utils/math.ts(44,9): error TS2322: Type '{ re: number; im: number; }' is not assignable to type 'Complex & MathCollection'.
  Type '{ re: number; im: number; }' is not assignable to type 'Complex & Matrix'.
    Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
src/utils/math.ts(61,42): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(68,9): error TS2322: Type 'Complex' is not assignable to type 'Complex & MathCollection'.
  Type 'Complex' is not assignable to type 'Complex & Matrix'.
    Type 'Complex' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 12 more.
src/utils/math.ts(96,51): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(119,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(119,55): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(125,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/math.ts(125,55): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/matrixFunctions.ts(46,40): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/matrixFunctions.ts(54,29): error TS2345: Argument of type 'ComplexMatrix | undefined' is not assignable to parameter of type 'ComplexMatrix'.
  Type 'undefined' is not assignable to type 'Complex[][]'.
src/utils/matrixFunctions.ts(57,35): error TS2345: Argument of type 'ComplexMatrix | undefined' is not assignable to parameter of type 'ComplexMatrix'.
  Type 'undefined' is not assignable to type 'Complex[][]'.
src/utils/matrixFunctions.ts(79,17): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/matrixFunctions.ts(113,31): error TS18046: 'e' is of type 'unknown'.
src/utils/matrixFunctions.ts(133,17): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/matrixOperations.ts(167,27): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/matrixOperations.ts(412,34): error TS2352: Conversion of type 'MathArray' to type '{ value: number; vector: Matrix; }[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'MathNumericType[][]' is not comparable to type '{ value: number; vector: Matrix; }[]'.
    Type 'MathNumericType[]' is missing the following properties from type '{ value: number; vector: Matrix; }': value, vector
src/utils/matrixOperations.ts(412,35): error TS2352: Conversion of type '{ value: number | BigNumber; vector: MathCollection; }[]' to type 'Matrix' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ value: number | BigNumber; vector: MathCollection; }[]' is missing the following properties from type 'Matrix': type, storage, datatype, create, and 13 more.
src/utils/matrixOperations.ts(419,78): error TS2339: Property 're' does not exist on type 'never'.
src/utils/matrixOperations.ts(420,78): error TS2339: Property 're' does not exist on type 'never'.
src/utils/matrixOperations.ts(439,62): error TS18046: 'error' is of type 'unknown'.
src/utils/matrixOperations.ts(449,55): error TS18046: 'error' is of type 'unknown'.
src/utils/matrixOperations.ts(474,26): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/matrixOperations.ts(474,32): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/matrixOperations.ts(530,41): error TS2554: Expected 1 arguments, but got 2.
src/utils/matrixOperations.ts(531,41): error TS2554: Expected 1 arguments, but got 2.
src/utils/matrixOperations.ts(852,20): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(16,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(20,33): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(33,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(37,33): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(50,43): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(50,75): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(65,38): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(78,45): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(79,39): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/oscillator.ts(90,66): error TS2769: No overload matches this call.
  Overload 1 of 3, '(arg?: string | MathNumericType | PolarCoordinates | undefined): Complex', gave the following error.
    Argument of type '{ re: number; im: number; }' is not assignable to parameter of type 'string | MathNumericType | PolarCoordinates | undefined'.
      Type '{ re: number; im: number; }' is missing the following properties from type 'Complex': clone, equals, format, fromJSON, and 4 more.
  Overload 2 of 3, '(arg?: MathCollection | undefined): MathCollection', gave the following error.
    Object literal may only specify known properties, and 're' does not exist in type 'MathCollection'.
src/utils/validation.ts(9,25): error TS2307: Cannot find module '../types' or its corresponding type declarations.
 ELIFECYCLE  Command failed with exit code 2.
