import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';
import { SOURCE_COLORS } from '../../constants/analyticsColors';

export function LeadSourceChart({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, isDarkMode } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, count, percentage } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{name}</p>
          <div className="space-y-0.5 opacity-80">
            <p>Leads Count: <span className="font-semibold opacity-100">{count}</span></p>
            <p>Percentage: <span className="font-semibold text-primary">{percentage}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Lead Source Distribution</h3>
        <p className="text-xs text-text-muted">Analysis of the acquisition channels driving signups.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 4 }}
              contentStyle={{
                backgroundColor: isDarkMode ? '#1B1B1B' : '#F2EFE8',
                color: isDarkMode ? '#FAFAF7' : '#151515',
                border: isDarkMode ? '1px solid #2C2C2C' : '1px solid #D8D2C8',
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14} animationDuration={800}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={SOURCE_COLORS[entry.name] || '#6366F1'}
                  className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(LeadSourceChart);
