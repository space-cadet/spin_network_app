import React from 'react';

export interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'stretch';
  wrap?: boolean;
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  className = '',
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
}) => {
  const classes = [
    'flex',
    direction === 'col' ? 'flex-col' : 'flex-row',
    {
      'justify-start': justify === 'start',
      'justify-end': justify === 'end',
      'justify-center': justify === 'center',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
    }[justify],
    {
      'items-start': align === 'start',
      'items-end': align === 'end',
      'items-center': align === 'center',
      'items-stretch': align === 'stretch',
    }[align],
    wrap ? 'flex-wrap' : 'flex-nowrap',
    {
      'gap-1': gap === 1,
      'gap-2': gap === 2,
      'gap-3': gap === 3,
      'gap-4': gap === 4,
      'gap-6': gap === 6,
      'gap-8': gap === 8,
    }[gap],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Flex;