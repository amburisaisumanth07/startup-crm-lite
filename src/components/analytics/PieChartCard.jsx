import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector, Tooltip } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';
import { useChartTheme } from '../../hooks/useChartTheme';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percentage,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 16) * cos;
  const my = cy + (outerRadius + 16) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Active Sector — expanded + subtle outer ring glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-xs font-bold fill-current"
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        dy={14}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-[10px] fill-current opacity-60"
      >
        {`${value} Leads (${percentage}%)`}
      </text>
    </g>
  );
};

export function PieChartCard({ data, totalLeads }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { cardClass, tooltipWrapperClass, isDarkMode } = useChartTheme();

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, percentage } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{name}</p>
          <div className="space-y-0.5 opacity-80">
            <p>Leads Count: <span className="font-semibold opacity-100">{value}</span></p>
            <p>Percentage: <span className="font-semibold text-blue-500 dark:text-blue-400">{percentage}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-text-main">Value Allocation By Stage</h3>
        <p className="text-xs text-text-muted">Current stages across all qualified leads.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
        {/* Doughnut container */}
        <div className="relative w-full md:w-1/2 h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1B1B1B' : '#F2EFE8',
                  color: isDarkMode ? '#FAFAF7' : '#151515',
                  border: isDarkMode ? '1px solid #2C2C2C' : '1px solid #D8D2C8',
                }}
              />
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={600}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                    className="stroke-bg-surface stroke-2 outline-none transition-all duration-200 hover:brightness-110 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Label */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-text-main">
              {totalLeads}
            </span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Total Leads
            </span>
          </div>
        </div>

        {/* Custom Interactive Legend — stronger hover states */}
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          {data.map((entry, idx) => {
            const color = STATUS_COLORS[entry.name] || '#94A3B8';
            const isActive = activeIndex === idx;
            return (
              <div
                key={entry.name}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl border
                  transition-all duration-200 ease-out cursor-pointer
                  ${isActive
                    ? 'border-border-subtle bg-bg-surface-hover shadow-subtle'
                    : 'border-transparent hover:bg-bg-surface-hover hover:border-border-subtle hover:shadow-subtle hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: color,
                      boxShadow: isActive ? `0 0 0 3px ${color}28` : 'none',
                    }}
                  />
                  <span className="text-xs font-semibold text-text-muted">
                    {entry.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-text-main">
                  {entry.value}{' '}
                  <span className="text-text-muted font-medium">
                    ({entry.percentage}%)
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PieChartCard);
