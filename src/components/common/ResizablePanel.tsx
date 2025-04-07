import React, { useState, useEffect, useRef } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  handleClassName?: string;
  handlePosition?: 'start' | 'end';
  onResize?: (newSize: number) => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  defaultSize,
  minSize = 150,
  maxSize = 600,
  className = '',
  handleClassName = '',
  handlePosition = 'end',
  onResize,
}) => {
  const [size, setSize] = useState(defaultSize);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize.current = size;
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      
      let newSize;
      
      if (direction === 'horizontal') {
        // For horizontal panels
        if (handlePosition === 'start') {
          // Handle on left - moving right decreases size
          newSize = startSize.current - delta;
        } else {
          // Handle on right - moving right increases size
          newSize = startSize.current + delta;
        }
      } else {
        // For vertical panels
        if (handlePosition === 'start') {
          // Handle on top - moving down decreases size
          newSize = startSize.current - delta;
        } else {
          // Handle on bottom - moving down increases size
          newSize = startSize.current + delta;
        }
      }

      // Clamp the size
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      
      setSize(newSize);
      
      // Call onResize callback if provided
      if (onResize) {
        onResize(newSize);
      }
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
  }, [direction, minSize, maxSize, handlePosition]);

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
          cursor: 'ew-resize',
          [handlePosition === 'start' ? 'left' : 'right']: '-5px',
          top: 0,
        } 
      : {
          height: '10px',
          width: '100%',
          cursor: 'ns-resize',
          [handlePosition === 'start' ? 'top' : 'bottom']: '-5px',
          left: 0,
        }),
    zIndex: 10,
  };

  return (
    <div ref={panelRef} style={style} className={`resizable-panel ${className}`}>
      {children}
      <div
        className={`resizer-handle ${handleClassName} ${direction === 'horizontal' ? 'horizontal-handle' : 'vertical-handle'} ${handlePosition === 'start' ? 'handle-start' : 'handle-end'}`}
        style={handleStyle}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ResizablePanel;
