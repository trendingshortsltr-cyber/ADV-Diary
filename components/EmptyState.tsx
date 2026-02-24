'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  imageSrc?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  imageSrc,
}: EmptyStateProps) {
  return (
    <Card className="w-full p-12 text-center border-dashed border-2 border-border">
      <div className="max-w-md mx-auto">
        {imageSrc && (
          <div className="mb-6 rounded-lg overflow-hidden h-48">
            <img
              src={imageSrc}
              alt="Empty state"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        )}
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </Card>
  );
}
