import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function BarChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor, isDarkMode } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, leads } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month}</p>
          <p className="text-primary font-semibold">{leads} Leads</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Monthly Leads Trend</h3>
        <p className="text-xs text-text-muted">Total number of inbound leads ingested over last 6 months.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A04A" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D4A04A" stopOpacity={0.15} />
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
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(198,168,91,0.06)', radius: 6 }}
              contentStyle={{
                backgroundColor: isDarkMode ? '#1B1B1B' : '#F2EFE8',
                color: isDarkMode ? '#FAFAF7' : '#151515',
                border: isDarkMode ? '1px solid #2C2C2C' : '1px solid #D8D2C8',
              }}
            />
            <Bar
              dataKey="leads"
              fill="url(#leadsBlueGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
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

export default React.memo(BarChartCard);
