import React from 'react';
import { LucideIcon } from 'lucide-react';
import { getMetricColorClass } from '../../constants/colors';

export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number;
  icon?: LucideIcon;
  iconColor?: string;
  isCompact?: boolean;
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  iconColor = 'text-slate-400',
  isCompact = false,
  tooltip,
}) => {
  return (
    <div
      title={tooltip}
      className={`bg-[#0d131f] border border-slate-800/80 rounded-xl relative overflow-hidden flex flex-col justify-between ${
        isCompact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-medium truncate">{title}</span>
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />}
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono-numbers font-bold text-white tracking-tight ${
            isCompact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {value}
        </span>
        {change !== undefined && (
          <span className={`text-xs font-mono-numbers font-semibold ${getMetricColorClass(change)}`}>
            {change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
          </span>
        )}
      </div>

      {subValue && (
        <div className="text-[11px] text-slate-400 mt-1 truncate font-mono-numbers">
          {subValue}
        </div>
      )}
    </div>
  );
};
