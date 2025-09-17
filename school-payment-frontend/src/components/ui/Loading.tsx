import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ className, size = 'md' }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "loading-spinner",
          {
            'h-4 w-4': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          }
        )}
      />
    </div>
  );
};

export default Loading;
