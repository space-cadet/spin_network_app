/**
 * Utilities for controlling simulation animation
 */

/**
 * Animation controller interface
 */
export interface AnimationController {
  isRunning: boolean;
  currentFrame: number;
  totalFrames: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setFrame: (frame: number) => void;
  nextFrame: () => void;
  previousFrame: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

/**
 * Create an animation controller that manages state and callback timing
 */
export const createAnimationController = (
  options: {
    frames: number;
    onFrame: (frame: number) => void;
    fps?: number;
  }
): AnimationController => {
  let running = false;
  let currentFrame = 0;
  let animationId: number | null = null;
  let lastFrameTime = 0;
  let playbackSpeed = 1.0;
  const frameDuration = 1000 / (options.fps || 30);
  
  // Animation loop function
  const animate = (timestamp: number) => {
    if (!running) return;
    
    // Calculate time since last frame
    const elapsed = timestamp - lastFrameTime;
    
    // Check if enough time has passed for next frame (adjusted by playback speed)
    if (elapsed >= frameDuration / playbackSpeed) {
      // Update frame
      currentFrame = (currentFrame + 1) % options.frames;
      options.onFrame(currentFrame);
      lastFrameTime = timestamp;
    }
    
    // Request next frame
    animationId = requestAnimationFrame(animate);
  };
  
  // Start animation
  const play = () => {
    if (running) return;
    running = true;
    lastFrameTime = performance.now();
    animationId = requestAnimationFrame(animate);
  };
  
  // Pause animation
  const pause = () => {
    if (!running) return;
    running = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
  
  // Stop animation and reset to first frame
  const stop = () => {
    pause();
    currentFrame = 0;
    options.onFrame(currentFrame);
  };
  
  // Set specific frame
  const setFrame = (frame: number) => {
    if (frame < 0 || frame >= options.frames) return;
    currentFrame = frame;
    options.onFrame(currentFrame);
  };
  
  // Go to next frame without animation
  const nextFrame = () => {
    currentFrame = (currentFrame + 1) % options.frames;
    options.onFrame(currentFrame);
  };
  
  // Go to previous frame without animation
  const previousFrame = () => {
    currentFrame = (currentFrame - 1 + options.frames) % options.frames;
    options.onFrame(currentFrame);
  };
  
  // Set playback speed (e.g., 0.5 = half speed, 2.0 = double speed)
  const setPlaybackSpeed = (speed: number) => {
    if (speed <= 0) return;
    playbackSpeed = speed;
  };
  
  return {
    get isRunning() { return running; },
    get currentFrame() { return currentFrame; },
    get totalFrames() { return options.frames; },
    play,
    pause,
    stop,
    setFrame,
    nextFrame,
    previousFrame,
    setPlaybackSpeed
  };
};
