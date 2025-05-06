import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ResizablePanel } from '../common/ResizablePanel';

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  titleIcon?: React.ReactNode;
  navItems: NavItem[];
  rightContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  version?: string;
  copyright?: string;
  footerSize?: number;
  minFooterSize?: number;
  maxFooterSize?: number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  titleIcon,
  navItems,
  rightContent,
  footerContent,
  version,
  copyright,
  footerSize = 30,
  minFooterSize = 25,
  maxFooterSize = 120,
  className = '',
  headerClassName = 'bg-primary text-white',
  contentClassName = '',
  footerClassName = 'bg-gray-100 border-t border-gray-200',
}) => {
  const location = useLocation();

  return (
    <div className={`flex flex-col h-screen ${className}`}>
      {/* Header */}
      <header className={`py-2 px-4 shadow-md z-10 ${headerClassName}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {titleIcon}
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          
          <nav className="flex justify-between items-center">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.path} className="flex items-center">
                  <Link 
                    to={item.path} 
                    className={`flex items-center hover:text-primary-100 
                      ${location.pathname === item.path ? 'border-b-2 border-current' : ''}`}
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {rightContent && (
              <div className="ml-6">
                {rightContent}
              </div>
            )}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <div className={`flex-1 overflow-hidden ${contentClassName}`}>
        {children}
      </div>
      
      {/* Footer - Resizable */}
      <ResizablePanel 
        direction="vertical" 
        defaultSize={footerSize} 
        minSize={minFooterSize} 
        maxSize={maxFooterSize}
        className={`z-10 ${footerClassName}`}
        handlePosition="start"
      >
        <div className="px-4 h-full flex items-center">
          {footerContent || (
            <div className="container mx-auto text-sm text-gray-500 flex justify-between">
              {version && <div>{version}</div>}
              {copyright && <div>{copyright}</div>}
            </div>
          )}
        </div>
      </ResizablePanel>
    </div>
  );
};

export default AppLayout;