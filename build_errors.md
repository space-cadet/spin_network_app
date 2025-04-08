
> spin-network-app@0.1.0 build /Users/deepak/code/spin_network_app
> tsc && vite build

src/components/common/FileOperations.tsx(1,35): error TS6133: 'useEffect' is declared but its value is never read.
src/components/common/FileOperations.tsx(32,40): error TS2339: Property 'id' does not exist on type 'NetworkMetadata'.
src/components/common/FileOperations.tsx(215,33): error TS2339: Property 'id' does not exist on type 'NetworkMetadata'.
src/components/common/PersistenceStatus.tsx(14,18): error TS2503: Cannot find namespace 'NodeJS'.
src/components/common/PersistenceStatus.tsx(17,22): error TS2571: Object is of type 'unknown'.
src/components/settings/SettingsDropdown.tsx(5,3): error TS6133: 'FaCog' is declared but its value is never read.
src/components/settings/types/NodeTypeForm.tsx(2,25): error TS6133: 'FaInfoCircle' is declared but its value is never read.
src/components/settings/types/NodeTypeManager.tsx(13,3): error TS6133: 'selectNodeTypeUsageById' is declared but its value is never read.
src/components/tools/NetworkTools.tsx(2,56): error TS6133: 'FaSave' is declared but its value is never read.
src/components/tools/NetworkTools.tsx(2,64): error TS6133: 'FaFileUpload' is declared but its value is never read.
src/components/workspace/Workspace.tsx(53,7): error TS2322: Type '({ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; })[]' is not assignable to type 'StylesheetJson | Promise<StylesheetJson> | undefined'.
  Type '({ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; })[]' is not assignable to type 'StylesheetJson'.
    Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; }' is not assignable to type 'StylesheetJsonBlock'.
      Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; }' is not assignable to type 'StylesheetJsonBlock'.
        Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; }' is not assignable to type 'StylesheetStyle'.
          Types of property 'style' are incompatible.
            Type '{ 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; 'font-size': string; 'border-width'?: undefined; ... 11 more ...; 'source-arrow-shape'?: undefined; }' is not assignable to type 'Node | Edge | Core'.
              Type '{ 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; 'font-size': string; 'border-width'?: undefined; ... 11 more ...; 'source-arrow-shape'?: undefined; }' is not assignable to type 'Node'.
                Types of property '"text-valign"' are incompatible.
                  Type 'string' is not assignable to type 'PropertyValue<NodeSingular, "top" | "bottom" | "center"> | undefined'.
src/components/workspace/Workspace.tsx(115,20): error TS2339: Property 'resize' does not exist on type 'never'.
src/components/workspace/Workspace.tsx(150,14): error TS2345: Argument of type '({ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; })[]' is not assignable to parameter of type 'string | StylesheetJsonBlock | StylesheetJsonBlock[] | undefined'.
  Type '({ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; })[]' is not assignable to type 'StylesheetJsonBlock[]'.
    Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; } | ... 4 more ... | { ...; }' is not assignable to type 'StylesheetJsonBlock'.
      Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; }' is not assignable to type 'StylesheetJsonBlock'.
        Type '{ selector: string; style: { 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; ... 13 more ...; 'source-arrow-shape'?: undefined; }; }' is not assignable to type 'StylesheetStyle'.
          Types of property 'style' are incompatible.
            Type '{ 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; 'font-size': string; 'border-width'?: undefined; ... 11 more ...; 'source-arrow-shape'?: undefined; }' is not assignable to type 'Node | Edge | Core'.
              Type '{ 'background-color': string; label: string; color: string; 'text-outline-color': string; 'text-outline-width': number; 'text-valign': string; width: number; height: number; 'font-size': string; 'border-width'?: undefined; ... 11 more ...; 'source-arrow-shape'?: undefined; }' is not assignable to type 'Node'.
                Types of property '"text-valign"' are incompatible.
                  Type 'string' is not assignable to type 'PropertyValue<NodeSingular, "top" | "bottom" | "center"> | undefined'.
src/components/workspace/ZoomControls.tsx(2,27): error TS6133: 'FaExpand' is declared but its value is never read.
src/main.tsx(10,17): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
src/store/index.ts(12,1): error TS6133: 'combineReducers' is declared but its value is never read.
src/store/slices/recentNetworksSlice.ts(32,27): error TS2339: Property 'id' does not exist on type 'NetworkMetadata'.
src/utils/migrations.ts(35,81): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
src/utils/networkStorage.ts(104,58): error TS6133: 'key' is declared but its value is never read.
src/utils/testPersistence.ts(7,25): error TS6133: 'createCircular' is declared but its value is never read.
 ELIFECYCLE  Command failed with exit code 2.
