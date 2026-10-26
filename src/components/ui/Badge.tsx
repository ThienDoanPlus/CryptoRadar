import React from 'react';
import { getBadgeToneClasses } from '../../constants/colors';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'bullish' | 'bearish' | 'warning' | 'neutral' | 'whale' | 'etf';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'neutral',
  className = '',
  size = 'sm',
}) => {
  const toneClasses = getBadgeToneClasses(tone);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded border uppercase tracking-wider ${sizeClasses} ${toneClasses} ${className}`}
    >
      {children}
    </span>
  );
};
