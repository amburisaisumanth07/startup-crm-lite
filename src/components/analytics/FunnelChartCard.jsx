import React from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Cell, LabelList, Tooltip } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function FunnelChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, isDarkMode } = useChartTheme();

  // Map funnel data for Recharts
  // recharts expects shape: { value: number, name: string, fill: string }
  const chartData = data.map((item) => ({
    value: item.count,
    name: item.stage,
    fill: item.fill,
    convRate: item.convRate,
    dropOff: item.dropOff,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1.5">{d.name}</p>
          <div className="space-y-1 opacity-80">
            <p>Leads Count: <span className="font-semibold opacity-100">{d.value}</span></p>
            <p>Conversion from Prev: <span className="font-semibold text-success">{d.convRate}%</span></p>
            {d.name !== 'New' && (
              <p>Drop-off Rate: <span className="font-semibold text-danger">{d.dropOff}%</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Pipeline Funnel Efficiency</h3>
        <p className="text-xs text-text-muted">Full funnel drop-offs and stage conversions.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 mt-6">
        {/* Recharts Funnel Container */}
        <div className="w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1B1B1B' : '#F2EFE8',
                    color: isDarkMode ? '#FAFAF7' : '#151515',
                    border: isDarkMode ? '1px solid #2C2C2C' : '1px solid #D8D2C8'
                  }}
              />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
                labelKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                  />
                ))}
                <LabelList
                  position="right"
                  fill="currentColor"
                  className="fill-text-muted text-[10px] font-bold"
                  dataKey="name"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Funnel Stages Details — with hover states */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2">
          {data.map((item, idx) => {
            return (
              <div
                key={item.stage}
                className={
                  'flex items-center justify-between p-2.5 rounded-xl border ' +
                  'border-border-subtle ' +
                  'bg-bg-base ' +
                  'transition-all duration-200 ease-out cursor-default ' +
                  'hover:bg-bg-surface-hover ' +
                  'hover:border-border-strong ' +
                  'hover:shadow-subtle ' +
                  'hover:scale-[1.01]'
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-6 rounded-md shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-main">
                      {item.stage}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {item.count} Active Leads
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-success">
                      {item.convRate}%
                    </span>
                    <span className="text-[9px] text-text-muted uppercase tracking-wider">
                      Conversion
                    </span>
                  </div>
                  {idx > 0 && (
                    <div className="flex flex-col border-l border-border-subtle pl-3">
                      <span className="text-xs font-bold text-danger">
                        {item.dropOff}%
                      </span>
                      <span className="text-[9px] text-text-muted uppercase tracking-wider">
                        Drop-off
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FunnelChartCard);
