import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from '../Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>test content</Container>);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('applies fluid class when fluid prop is true', () => {
    const { container } = render(<Container fluid>content</Container>);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('applies max width class when fluid prop is false', () => {
    const { container } = render(<Container>content</Container>);
    expect(container.firstChild).toHaveClass('max-w-7xl');
  });

  it('applies custom className', () => {
    const { container } = render(<Container className="test-class">content</Container>);
    expect(container.firstChild).toHaveClass('test-class');
  });
});