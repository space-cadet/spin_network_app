import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { AppDispatch } from '../store/configureStore';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// UI hooks
export const useCollapsedState = (sectionId: string) => 
  useAppSelector((state) => state.ui.collapsedSections[sectionId]);

export const usePanelState = (panelId: string) =>
  useAppSelector((state) => state.ui.panels[panelId]);

// Settings hooks
export const useTheme = () =>
  useAppSelector((state) => state.settings.theme);

export const usePersistenceSettings = () =>
  useAppSelector((state) => ({
    persistLayout: state.settings.persistLayout,
    persistTheme: state.settings.persistTheme,
  }));