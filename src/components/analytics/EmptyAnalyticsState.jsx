import React from 'react';
import { BarChart3 } from 'lucide-react';

export function EmptyAnalyticsState({ onAddLead }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border-subtle rounded-3xl p-16 text-center bg-bg-surface shadow-sm animate-fadeIn max-w-lg mx-auto mt-12">
      <div className="p-4 bg-bg-surface-hover text-text-muted rounded-2xl mb-6">
        <BarChart3 className="w-10 h-10" strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-bold text-text-main mb-2">
        Not enough data yet
      </h3>
      <p className="text-xs text-text-muted max-w-sm mb-8 leading-relaxed">
        Add your first lead to start tracking business performance, pipeline valuations, conversion trends, and insights.
      </p>

      <button
        onClick={onAddLead}
        className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
      >
        Add Lead
      </button>
    </div>
  );
}

export default React.memo(EmptyAnalyticsState);
