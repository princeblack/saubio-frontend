'use client';

import { Skeleton } from '@saubio/ui';

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function SkeletonList({ count = 3, className, itemClassName, rounded = 'lg' }: SkeletonListProps) {
  return (
    <div className={className ?? 'space-y-3'}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} rounded={rounded} className={itemClassName ?? 'h-16'} />
      ))}
    </div>
  );
}
