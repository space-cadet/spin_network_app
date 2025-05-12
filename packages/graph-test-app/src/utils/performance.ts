/**
 * Performance measurement utilities
 */

export interface PerformanceMetrics {
  operationTime: number;
  memoryUsage: number;
  frameRate: number;
}

export const measureOperation = async (operation: () => Promise<void>): Promise<number> => {
  const start = performance.now();
  await operation();
  return performance.now() - start;
};

export const getMemoryUsage = (): number => {
  if (performance.memory) {
    return Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
  }
  return 0;
};

export const measureFrameRate = (durationMs: number = 1000): Promise<number> => {
  return new Promise((resolve) => {
    let frames = 0;
    let start = performance.now();

    const count = () => {
      frames++;
      if (performance.now() - start < durationMs) {
        requestAnimationFrame(count);
      } else {
        resolve(Math.round((frames * 1000) / durationMs));
      }
    };

    requestAnimationFrame(count);
  });
};