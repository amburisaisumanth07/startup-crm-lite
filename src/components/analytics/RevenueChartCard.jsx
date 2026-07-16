import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';
import { formatCurrency } from '../../utils/analyticsHelpers';

export function RevenueChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor, isDarkMode } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, revenue } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month} Revenue</p>
          <p className="text-primary font-semibold">{formatCurrency(revenue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Revenue Analytics</h3>
        <p className="text-xs text-text-muted">Total won revenue trends calculated month over month.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6A85B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C6A85B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(val) => formatCurrency(val)}
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
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C6A85B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGreenGradient)"
              animationDuration={800}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#C6A85B' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(RevenueChartCard);
