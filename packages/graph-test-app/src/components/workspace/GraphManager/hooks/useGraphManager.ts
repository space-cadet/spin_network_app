import { useRef } from 'react';

export const useGraphManager = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return {
    containerRef
  };
};