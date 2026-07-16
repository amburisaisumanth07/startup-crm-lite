import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 6 KPI Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-bg-surface border border-border-subtle rounded-2xl h-28 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-border-subtle rounded-md" />
              <div className="w-8 h-8 bg-border-subtle rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-5 bg-border-subtle rounded-md" />
              <div className="w-12 h-2.5 bg-bg-surface-hover rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 2 Column Large Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-bg-surface border border-border-subtle rounded-2xl h-80 space-y-6"
          >
            <div className="space-y-2">
              <div className="w-32 h-4 bg-border-subtle rounded-md" />
              <div className="w-48 h-3 bg-bg-surface-hover rounded-md" />
            </div>
            <div className="w-full h-48 bg-border-subtle rounded-xl" />
          </div>
        ))}
      </div>

      {/* Row 3: 2 Column Medium Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-bg-surface border border-border-subtle rounded-2xl h-80 space-y-6"
          >
            <div className="space-y-2">
              <div className="w-40 h-4 bg-border-subtle rounded-md" />
              <div className="w-56 h-3 bg-bg-surface-hover rounded-md" />
            </div>
            <div className="w-full h-48 bg-border-subtle rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(LoadingSkeleton);
