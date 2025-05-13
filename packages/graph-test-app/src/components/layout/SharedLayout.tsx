import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, FlaskConical, Home } from 'lucide-react';
import { AppLayout } from '@spin-network/template-core';
import { useTheme } from '@spin-network/template-core/state';

interface SharedLayoutProps {
  children: React.ReactNode;
  title: string;
  titleIcon: React.ReactNode;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({
  children,
  title,
  titleIcon,
}) => {
  const [theme] = useTheme();

  return (
    <AppLayout
      title={title}
      titleIcon={titleIcon}
      version="v0.1.0"
      className={theme === 'dark' ? 'dark' : ''}
      headerClassName="bg-primary text-white shadow-md"
      navItems={[
        { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
        { path: '/graph', label: 'Graph Test', icon: <Activity className="w-4 h-4" /> },
        { path: '/quantum', label: 'Quantum Demo', icon: <FlaskConical className="w-4 h-4" /> }
      ]}
    >
      {children}
    </AppLayout>
  );
};