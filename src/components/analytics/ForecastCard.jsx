import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';
import { useChartTheme } from '../../hooks/useChartTheme';

export function ForecastCard({ forecast }) {
  const isPositiveGrowth = forecast.growth >= 0;
  const { cardClass } = useChartTheme();

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-main">Revenue Forecast</h3>
          <p className="text-xs text-text-muted">Predictive growth models based on past monthly revenue.</p>
        </div>
        <div className="p-2 bg-success-light dark:bg-success/15 text-success rounded-xl">
          <Target className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Predicted Revenue Next Month
          </p>
          <div className="text-3xl font-black tracking-tight text-text-main mt-1">
            {formatCurrency(forecast.predicted)}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                isPositiveGrowth
                  ? 'text-success bg-success-light dark:bg-success/15'
                  : 'text-danger bg-danger-light dark:bg-danger/15'
              }`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositiveGrowth ? '+' : ''}
              {forecast.growth}%
            </span>
            <span className="text-xs text-text-muted">projected growth</span>
          </div>
        </div>

        {/* Confidence score indicator */}
        <div className="pt-4 border-t border-border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted">Model Confidence</span>
            <span className="font-bold text-text-main">{forecast.confidence}%</span>
          </div>
          <div className="w-full bg-bg-surface-hover h-2 rounded-full overflow-hidden">
            <div
              className="bg-success h-full rounded-full transition-all duration-1000"
              style={{ width: `${forecast.confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted leading-normal">
            Confidence score scales up based on historical data volume and consistent monthly conversions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ForecastCard);
