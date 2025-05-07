export interface UiState {
  collapsedSections: Record<string, boolean>;
  panels: Record<string, {
    isOpen: boolean;
    size: number;
  }>;
}

export interface SettingsState {
  theme: 'light' | 'dark';
  persistLayout: boolean;
  persistTheme: boolean;
}

export interface RootState {
  ui: UiState;
  settings: SettingsState;
}