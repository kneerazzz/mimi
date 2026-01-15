// src/components/ui/Container.tsx
'use client'
import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div className={`max-w-7xl px-2 sm:px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
