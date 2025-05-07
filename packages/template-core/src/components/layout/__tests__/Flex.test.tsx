import React from 'react';
import { render, screen } from '@testing-library/react';
import { Flex } from '../Flex';

describe('Flex', () => {
  it('renders children', () => {
    render(<Flex>test content</Flex>);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('applies direction classes correctly', () => {
    const { container: row } = render(<Flex direction="row">content</Flex>);
    expect(row.firstChild).toHaveClass('flex-row');

    const { container: col } = render(<Flex direction="col">content</Flex>);
    expect(col.firstChild).toHaveClass('flex-col');
  });

  it('applies justify classes correctly', () => {
    const { container } = render(<Flex justify="between">content</Flex>);
    expect(container.firstChild).toHaveClass('justify-between');
  });

  it('applies align classes correctly', () => {
    const { container } = render(<Flex align="center">content</Flex>);
    expect(container.firstChild).toHaveClass('items-center');
  });

  it('applies wrap class when wrap is true', () => {
    const { container } = render(<Flex wrap>content</Flex>);
    expect(container.firstChild).toHaveClass('flex-wrap');
  });

  it('applies gap class correctly', () => {
    const { container } = render(<Flex gap={2}>content</Flex>);
    expect(container.firstChild).toHaveClass('gap-2');
  });

  it('applies custom className', () => {
    const { container } = render(<Flex className="test-class">content</Flex>);
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('uses default values when props are not provided', () => {
    const { container } = render(<Flex>content</Flex>);
    expect(container.firstChild).toHaveClass('flex-row');
    expect(container.firstChild).toHaveClass('justify-start');
    expect(container.firstChild).toHaveClass('items-start');
    expect(container.firstChild).toHaveClass('flex-nowrap');
    expect(container.firstChild).toHaveClass('gap-4');
  });
});