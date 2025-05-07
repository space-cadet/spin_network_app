import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from '../Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid>test content</Grid>);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('applies correct columns class', () => {
    const { container } = render(<Grid cols={3}>content</Grid>);
    expect(container.firstChild).toHaveClass('grid-cols-3');
  });

  it('applies correct gap class', () => {
    const { container } = render(<Grid gap={2}>content</Grid>);
    expect(container.firstChild).toHaveClass('gap-2');
  });

  it('applies custom className', () => {
    const { container } = render(<Grid className="test-class">content</Grid>);
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('uses default values when props are not provided', () => {
    const { container } = render(<Grid>content</Grid>);
    expect(container.firstChild).toHaveClass('grid-cols-12');
    expect(container.firstChild).toHaveClass('gap-4');
  });
});