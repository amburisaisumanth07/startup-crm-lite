import React from 'react';

const FILTER_OPTIONS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

export function AnalyticsFilters({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-bg-surface-hover rounded-xl w-fit border border-border-subtle">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-bg-surface text-primary shadow-subtle ring-1 ring-border-strong'
                : 'text-text-muted hover:text-text-main hover:bg-bg-base'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default React.memo(AnalyticsFilters);

