/**
 * Hook for initializing and managing a Cytoscape instance
 */
import { useEffect, useState, useRef } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape, configureCytoscapeEvents, removeCytoscapeEvents } from '../utils/cytoscapeSetup';
import { safeFit, zoomIn, zoomOut, getViewport, Viewport } from '../utils/viewportUtils';

export interface CytoscapeHookOptions {
  onSelect?: (elementId: string, elementType: string) => void;
  onUnselect?: () => void;
  onTap?: (event: cytoscape.EventObject) => void;
  onZoomChange?: (zoom: number) => void;
  onViewportChange?: (viewport: Viewport) => void;
}

/**
 * Hook for managing a Cytoscape instance lifecycle
 */
export const useCytoscapeInstance = (
  containerRef: React.RefObject<HTMLElement>,
  styles: cytoscape.StylesheetCSS[],
  options?: CytoscapeHookOptions
) => {
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Create Cytoscape instance
    const cyInstance = initializeCytoscape(containerRef.current, styles);

    // Configure event listeners
    configureCytoscapeEvents(cyInstance, {
      onSelect: (element) => {
        if (options?.onSelect) {
          options.onSelect(element.id(), element.isNode() ? 'node' : 'edge');
        }
      },
      onUnselect: () => {
        if (options?.onUnselect) {
          options.onUnselect();
        }
      },
      onZoom: (zoom) => {
        setZoomLevel(zoom);
        if (options?.onZoomChange) {
          options.onZoomChange(zoom);
        }
        if (options?.onViewportChange) {
          const viewport = getViewport(cyInstance);
          if (viewport) {
            options.onViewportChange(viewport);
          }
        }
      },
      onTap: (event) => {
        if (options?.onTap) {
          options.onTap(event);
        }
      }
    });

    // Set initial zoom level
    setZoomLevel(cyInstance.zoom());

    // Create resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (cyInstance) {
        (cyInstance as any).resize();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    // Set Cytoscape instance
    setCy(cyInstance);

    // Cleanup function
    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
      if (cyInstance) {
        removeCytoscapeEvents(cyInstance);
        cyInstance.destroy();
      }
    };
  }, [containerRef]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cy) {
        (cy as any).resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cy]);

  // Helper functions that utilize our utilities
  const handleZoomIn = () => {
    if (cy) {
      const newZoom = zoomIn(cy);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (cy) {
      const newZoom = zoomOut(cy);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomFit = () => {
    if (cy) {
      safeFit(cy);
      setZoomLevel(cy.zoom());
    }
  };

  return {
    cy,
    zoomLevel,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomFit: handleZoomFit
  };
};
