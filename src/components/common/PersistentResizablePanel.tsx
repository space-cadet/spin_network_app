import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSidebarSize } from '../../store/slices/uiSlice';
import { selectSidebarSizes } from '../../store/selectors';
import ResizablePanel from './ResizablePanel';

interface PersistentResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  sidebarKey: 'left' | 'right' | 'bottom';
  minSize?: number;
  maxSize?: number;
  className?: string;
  handleClassName?: string;
  handlePosition?: 'start' | 'end';
}

/**
 * A wrapper around ResizablePanel that persists its size in Redux
 */
const PersistentResizablePanel: React.FC<PersistentResizablePanelProps> = ({
  children,
  direction,
  sidebarKey,
  minSize = 150,
  maxSize = 600,
  className = '',
  handleClassName = '',
  handlePosition = 'end',
}) => {
  const dispatch = useAppDispatch();
  const sidebarSizes = useAppSelector(selectSidebarSizes);
  const storedSize = sidebarSizes[sidebarKey];
  const [size, setSize] = useState(storedSize);
  
  // Keep local state and Redux in sync
  useEffect(() => {
    setSize(storedSize);
  }, [storedSize]);
  
  // Custom resize handler that updates Redux
  const handleResize = (newSize: number) => {
    // Update local state immediately for a responsive feel
    setSize(newSize);
    
    // Debounce the Redux update to avoid too many state changes during resize
    const timeoutId = setTimeout(() => {
      dispatch(setSidebarSize({ sidebar: sidebarKey, size: newSize }));
    }, 100);
    
    return () => clearTimeout(timeoutId);
  };
  
  return (
    <ResizablePanel
      direction={direction}
      defaultSize={size}
      minSize={minSize}
      maxSize={maxSize}
      className={className}
      handleClassName={handleClassName}
      handlePosition={handlePosition}
      onResize={handleResize}
    >
      {children}
    </ResizablePanel>
  );
};

export default PersistentResizablePanel;
