import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  isCompact?: boolean;
  header?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  isCompact = false,
  header,
  action,
}) => {
  return (
    <div
      className={`bg-[#0d131f] border border-slate-800/80 rounded-xl shadow-sm text-slate-200 transition-all ${
        isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
      } ${className}`}
    >
      {(header || action) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
          <div>{header}</div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
