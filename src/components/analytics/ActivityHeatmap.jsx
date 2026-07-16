import React from 'react';
import { useChartTheme } from '../../hooks/useChartTheme';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ActivityHeatmap({ data }) {
  const { cardClass, isDarkMode } = useChartTheme();

  // Gold intensity scale based on lead count — maps to both light and dark
  const getCellColor = (count) => {
    if (count === 0)  return isDarkMode ? 'bg-border-subtle' : 'bg-bg-surface-hover';
    if (count <= 1)   return isDarkMode ? 'bg-primary/20' : 'bg-primary/20';
    if (count <= 2)   return isDarkMode ? 'bg-primary/40' : 'bg-primary/35';
    if (count <= 4)   return 'bg-primary/70 text-bg-surface';
    return 'bg-primary text-text-inverse';
  };

  // Theme-aware tooltip class using brand tokens
  const hoverTipClass =
    'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 pointer-events-none ' +
    'bg-bg-surface border border-border-subtle text-text-main text-[10px] font-medium py-1.5 px-2.5 rounded-md whitespace-nowrap shadow-premium';

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Deal Ingestion Activity</h3>
        <p className="text-xs text-text-muted">Heatmap tracking incoming lead volume over the past 52 weeks.</p>
      </div>

      <div className="mt-6 overflow-x-auto select-none">
        <div className="min-w-[760px] flex flex-col gap-2">
          
          {/* Month Headers */}
          <div className="flex text-[10px] font-semibold text-text-muted h-4 relative">
            <div className="w-8 shrink-0" /> {/* Spacer for days column */}
            <div className="flex-1 flex justify-between pr-4">
              {MONTHS_SHORT.map((m, idx) => (
                <span key={`${m}-${idx}`} className="w-12 text-center">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div className="flex gap-2">
            
            {/* Days column */}
            <div className="flex flex-col justify-between text-[10px] font-semibold text-text-muted py-1.5 w-8 shrink-0">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex-1 flex gap-1">
              {data.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1 flex-1">
                  {week.map((day) => {
                    const formattedDate = new Date(day.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={day.date}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 relative group cursor-pointer ${getCellColor(day.count)}`}
                      >
                        {/* Theme-aware tooltip */}
                        <div className={hoverTipClass}>
                          <span className="font-bold">{day.count} Leads</span> on {formattedDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-text-muted mt-2">
            <span>Less</span>
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-border-subtle' : 'bg-bg-surface-hover'}`} />
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-primary/20' : 'bg-primary/20'}`} />
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-primary/40' : 'bg-primary/35'}`} />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span>More</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default React.memo(ActivityHeatmap);
