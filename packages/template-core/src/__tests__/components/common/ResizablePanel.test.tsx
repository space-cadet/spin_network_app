import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ResizablePanel } from '../../../components';

describe('ResizablePanel', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Reset document body styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully with minimal props', () => {
    const { getByText } = render(
      <ResizablePanel direction="horizontal" defaultSize={200}>
        <div>Content</div>
      </ResizablePanel>
    );

    expect(getByText('Content')).toBeInTheDocument();
  });

  it('initializes with correct default size', () => {
    const { container } = render(
      <ResizablePanel direction="horizontal" defaultSize={200}>
        <div>Content</div>
      </ResizablePanel>
    );

    const panel = container.querySelector('.resizable-panel');
    expect(panel).toHaveStyle({ width: '200px' });
  });

  it('respects direction prop for vertical layout', () => {
    const { container } = render(
      <ResizablePanel direction="vertical" defaultSize={200}>
        <div>Content</div>
      </ResizablePanel>
    );

    const panel = container.querySelector('.resizable-panel');
    expect(panel).toHaveStyle({ height: '200px' });
  });

  it('loads size from localStorage when persist is enabled', () => {
    mockLocalStorage.getItem.mockReturnValue('300');

    const { container } = render(
      <ResizablePanel
        direction="horizontal"
        defaultSize={200}
        persist={true}
        storageKey="test-panel"
      >
        <div>Content</div>
      </ResizablePanel>
    );

    const panel = container.querySelector('.resizable-panel');
    expect(panel).toHaveStyle({ width: '300px' });
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-panel');
  });

  it('saves size to localStorage when changed and persist is enabled', () => {
    const { container } = render(
      <ResizablePanel
        direction="horizontal"
        defaultSize={200}
        persist={true}
        storageKey="test-panel"
      >
        <div>Content</div>
      </ResizablePanel>
    );

    const handle = container.querySelector('.resizer-handle') as HTMLElement;
    
    // Simulate resize
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 300 });
    fireEvent.mouseUp(document);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-panel', expect.any(String));
  });

  it('calls onResize callback when resizing', () => {
    const onResize = vi.fn();
    const { container } = render(
      <ResizablePanel
        direction="horizontal"
        defaultSize={200}
        onResize={onResize}
      >
        <div>Content</div>
      </ResizablePanel>
    );

    const handle = container.querySelector('.resizer-handle') as HTMLElement;
    
    // Simulate resize
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 300 });
    fireEvent.mouseUp(document);

    expect(onResize).toHaveBeenCalled();
  });

  it('applies custom class names correctly', () => {
    const { container } = render(
      <ResizablePanel
        direction="horizontal"
        defaultSize={200}
        className="custom-panel"
        handleClassName="custom-handle"
      >
        <div>Content</div>
      </ResizablePanel>
    );

    expect(container.querySelector('.custom-panel')).toBeInTheDocument();
    expect(container.querySelector('.custom-handle')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    const { container } = render(
      <ResizablePanel
        direction="horizontal"
        defaultSize={200}
        disabled={true}
      >
        <div>Content</div>
      </ResizablePanel>
    );

    // Resizer handle should not be present when disabled
    expect(container.querySelector('.resizer-handle')).not.toBeInTheDocument();
  });

  it('updates cursor style during resize', () => {
    const { container } = render(
      <ResizablePanel direction="horizontal" defaultSize={200}>
        <div>Content</div>
      </ResizablePanel>
    );

    const handle = container.querySelector('.resizer-handle') as HTMLElement;
    
    // Start resize
    fireEvent.mouseDown(handle, { clientX: 200 });
    expect(document.body.style.cursor).toBe('ew-resize');

    // End resize
    fireEvent.mouseUp(document);
    expect(document.body.style.cursor).toBe('');
  });
});