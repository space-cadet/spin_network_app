import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '../../../components';

const mockProps = {
  title: 'Test App',
  navItems: [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ],
  version: '1.0.0',
  copyright: '© 2025 Test App',
};

describe('AppLayout', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
  };

  it('renders successfully with minimal props', () => {
    renderWithRouter(
      <AppLayout title={mockProps.title} navItems={mockProps.navItems}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders navigation items correctly', () => {
    renderWithRouter(
      <AppLayout {...mockProps}>
        <div>Content</div>
      </AppLayout>
    );

    mockProps.navItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('shows version and copyright in footer', () => {
    renderWithRouter(
      <AppLayout {...mockProps}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText(mockProps.version)).toBeInTheDocument();
    expect(screen.getByText(mockProps.copyright)).toBeInTheDocument();
  });

  it('renders custom right content', () => {
    const rightContent = <div>Right Content</div>;
    renderWithRouter(
      <AppLayout {...mockProps} rightContent={rightContent}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('renders custom footer content', () => {
    const footerContent = <div>Custom Footer</div>;
    renderWithRouter(
      <AppLayout {...mockProps} footerContent={footerContent}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
  });

  it('applies custom class names correctly', () => {
    const customClasses = {
      className: 'custom-container',
      headerClassName: 'custom-header',
      contentClassName: 'custom-content',
      footerClassName: 'custom-footer',
    };

    const { container } = renderWithRouter(
      <AppLayout {...mockProps} {...customClasses}>
        <div>Content</div>
      </AppLayout>
    );

    expect(container.querySelector('.custom-container')).toBeInTheDocument();
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const titleIcon = <span data-testid="custom-icon">📱</span>;
    renderWithRouter(
      <AppLayout {...mockProps} titleIcon={titleIcon}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});