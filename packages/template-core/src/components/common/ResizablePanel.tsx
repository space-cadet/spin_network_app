import React, { useState, useEffect, useRef } from 'react';

export interface ResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  handleClassName?: string;
  handlePosition?: 'start' | 'end';
  onResize?: (newSize: number) => void;
  disabled?: boolean;
  persist?: boolean;
  storageKey?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  defaultSize,
  minSize = 150,
  maxSize = 600,
  className = '',
  handleClassName = '',
  handlePosition = 'end',
  onResize,
  disabled = false,
  persist = false,
  storageKey,
}) => {
  // Initialize size from storage if persist is enabled
  const initialSize = persist && storageKey 
    ? parseInt(localStorage.getItem(storageKey) || String(defaultSize), 10)
    : defaultSize;

  const [size, setSize] = useState(initialSize);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  // Save size to storage when it changes if persist is enabled
  useEffect(() => {
    if (persist && storageKey) {
      localStorage.setItem(storageKey, String(size));
    }
  }, [size, persist, storageKey]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    isDragging.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize.current = size;
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      
      let newSize;
      
      if (direction === 'horizontal') {
        newSize = handlePosition === 'start'
          ? startSize.current - delta  // Handle on left - moving right decreases size
          : startSize.current + delta; // Handle on right - moving right increases size
      } else {
        newSize = handlePosition === 'start'
          ? startSize.current - delta  // Handle on top - moving down decreases size
          : startSize.current + delta; // Handle on bottom - moving down increases size
      }

      // Clamp the size
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction, minSize, maxSize, handlePosition, disabled, onResize]);

  const style = {
    ...(direction === 'horizontal' 
      ? { width: `${size}px` } 
      : { height: `${size}px` }),
    position: 'relative' as const,
    flexShrink: 0,
  };

  const handleStyle = {
    position: 'absolute' as const,
    ...(direction === 'horizontal' 
      ? {
          width: '10px',
          height: '100%',
          cursor: disabled ? 'default' : 'ew-resize',
          [handlePosition === 'start' ? 'left' : 'right']: '-5px',
          top: 0,
        } 
      : {
          height: '10px',
          width: '100%',
          cursor: disabled ? 'default' : 'ns-resize',
          [handlePosition === 'start' ? 'top' : 'bottom']: '-5px',
          left: 0,
        }),
    zIndex: 10,
  };

  return (
    <div ref={panelRef} style={style} className={`resizable-panel ${className}`}>
      {children}
      {!disabled && (
        <div
          className={`resizer-handle ${handleClassName} ${
            direction === 'horizontal' ? 'horizontal-handle' : 'vertical-handle'
          } ${handlePosition === 'start' ? 'handle-start' : 'handle-end'}`}
          style={handleStyle}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

export default ResizablePanel;