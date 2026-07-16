import React from 'react';
import { Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';
import { useChartTheme } from '../../hooks/useChartTheme';

export function SalesVelocityCard({ velocity }) {
  const { cardClass } = useChartTheme();
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-main">Sales Velocity</h3>
          <p className="text-xs text-text-muted">The rate at which deals move through your pipeline.</p>
        </div>
        <div className="p-2 bg-primary-light dark:bg-primary/15 text-primary rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="text-3xl font-black tracking-tight text-text-main flex items-baseline gap-1">
            {formatCurrency(velocity)}
            <span className="text-sm font-medium text-text-muted">/day</span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-success bg-success-light dark:bg-success/15 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4%
            </span>
            <span className="text-xs text-text-muted">vs last month</span>
          </div>
        </div>

        {/* Formula breakdown explainer */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-border-strong" /> Pipeline Acceleration Formula
          </p>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Calculated as: <span className="font-semibold text-text-main">(Opportunities × Win Rate × Avg Deal Value) ÷ Average Sales Cycle Length</span>. Optimise any input parameter to increase velocity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SalesVelocityCard);
