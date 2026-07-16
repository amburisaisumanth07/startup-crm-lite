import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function LineChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor, isDarkMode } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, rate } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month}</p>
          <p className="text-primary font-semibold">{rate}% Conversion</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Monthly Conversion Trend</h3>
        <p className="text-xs text-text-muted">Ratio of won deals over total monthly leads.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: isDarkMode ? '#1B1B1B' : '#F2EFE8',
                color: isDarkMode ? '#FAFAF7' : '#151515',
                border: isDarkMode ? '1px solid #2C2C2C' : '1px solid #D8D2C8',
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#D4A04A"
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#D4A04A' }}
              dot={{ r: 4, strokeWidth: 2, stroke: '#D4A04A', fill: 'transparent' }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(LineChartCard);
