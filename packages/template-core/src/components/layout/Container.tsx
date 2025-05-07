import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  fluid = false,
}) => {
  return (
    <div 
      className={`mx-auto px-4 ${fluid ? 'w-full' : 'max-w-7xl'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;