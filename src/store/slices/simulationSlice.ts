import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SimulationParameters, 
  DEFAULT_SIMULATION_PARAMETERS 
} from '../../simulation';

export interface GeometricState {
  totalVolume: number;
  totalArea: number;
  effectiveDimension: number;
  volumeEntropy: number;
}

export interface StatisticsState {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
}

export interface ConservationState {
  totalProbability: number;
  positivity: boolean;
  normVariation: number;
}

export interface SimulationState {
  // Core simulation status
  isRunning: boolean;
  currentTime: number;
  hasHistory: boolean;
  
  // Results data
  geometricData: GeometricState;
  statisticsData: StatisticsState;
  conservationData: ConservationState;
  
  // Configuration
  parameters: SimulationParameters;
  
  // UI state
  activeTab: 'parameters' | 'analysis';
  isPanelExpanded: boolean;
  
  // Internal tracking
  lastUpdated: number;
}

const initialState: SimulationState = {
  isRunning: false,
  currentTime: 0,
  hasHistory: false,
  
  geometricData: {
    totalVolume: 0,
    totalArea: 0,
    effectiveDimension: 0,
    volumeEntropy: 0
  },
  
  statisticsData: {
    mean: 0,
    variance: 0,
    skewness: 0,
    kurtosis: 0
  },
  
  conservationData: {
    totalProbability: 0,
    positivity: false,
    normVariation: 0
  },
  
  parameters: DEFAULT_SIMULATION_PARAMETERS,
  
  activeTab: 'parameters',
  isPanelExpanded: true,
  
  lastUpdated: Date.now()
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    // Core simulation status updates
    setSimulationRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setHasHistory: (state, action: PayloadAction<boolean>) => {
      state.hasHistory = action.payload;
      state.lastUpdated = Date.now();
    },
    
    // Result data updates
    updateGeometricData: (state, action: PayloadAction<Partial<GeometricState>>) => {
      state.geometricData = {
        ...state.geometricData,
        ...action.payload
      };
      state.lastUpdated = Date.now();
    },
    
    updateStatisticsData: (state, action: PayloadAction<Partial<StatisticsState>>) => {
      state.statisticsData = {
        ...state.statisticsData,
        ...action.payload
      };
      state.lastUpdated = Date.now();
    },
    
    updateConservationData: (state, action: PayloadAction<Partial<ConservationState>>) => {
      state.conservationData = {
        ...state.conservationData,
        ...action.payload
      };
      state.lastUpdated = Date.now();
    },
    
    // Parameter updates
    updateParameters: (state, action: PayloadAction<Partial<SimulationParameters>>) => {
      state.parameters = {
        ...state.parameters,
        ...action.payload
      };
      state.lastUpdated = Date.now();
    },
    
    updateInitialStateParams: (state, action: PayloadAction<Record<string, any>>) => {
      state.parameters = {
        ...state.parameters,
        initialStateParams: {
          ...state.parameters.initialStateParams,
          ...action.payload
        }
      };
      state.lastUpdated = Date.now();
    },
    
    // UI state updates
    setActiveTab: (state, action: PayloadAction<'parameters' | 'analysis'>) => {
      state.activeTab = action.payload;
    },
    
    setIsPanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.isPanelExpanded = action.payload;
    },
    
    // Complete reset (for starting fresh simulations)
    resetSimulationState: (state) => {
      return {
        ...initialState,
        // Preserve parameters when resetting
        parameters: state.parameters,
        // Preserve UI state
        activeTab: state.activeTab,
        isPanelExpanded: state.isPanelExpanded,
        lastUpdated: Date.now()
      };
    }
  }
});

export const {
  setSimulationRunning,
  setCurrentTime,
  setHasHistory,
  updateGeometricData,
  updateStatisticsData,
  updateConservationData,
  updateParameters,
  updateInitialStateParams,
  setActiveTab,
  setIsPanelExpanded,
  resetSimulationState
} = simulationSlice.actions;

export default simulationSlice.reducer;
