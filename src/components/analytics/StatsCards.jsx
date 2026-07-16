import React from 'react';
import { Users, Target, Briefcase, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

export function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-primary bg-primary-light dark:bg-primary/15',
      trend: { value: '14.2%', isPositive: true },
      borderColor: 'border-border-subtle',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Target,
      color: 'text-success bg-success-light dark:bg-success/15',
      trend: { value: '2.4%', isPositive: true },
      borderColor: 'border-border-subtle',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(stats.pipelineValue),
      icon: Briefcase,
      color: 'text-warning bg-warning-light dark:bg-warning/15',
      trend: { value: '8.1%', isPositive: true },
      borderColor: 'border-border-subtle',
    },
    {
      title: 'Won Revenue',
      value: formatCurrency(stats.wonRevenue),
      icon: TrendingUp,
      color: 'text-success bg-success-light dark:bg-success/15',
      trend: { value: '18.7%', isPositive: true },
      borderColor: 'border-border-subtle',
    },
    {
      title: 'Average Sales Cycle',
      value: `${stats.averageSalesCycle} Days`,
      icon: Calendar,
      color: 'text-primary bg-primary-light dark:bg-primary/15',
      trend: { value: '4 days faster', isPositive: true },
      borderColor: 'border-border-subtle',
    },
    {
      title: 'Lost Rate',
      value: `${stats.lostRate}%`,
      icon: AlertCircle,
      color: 'text-danger bg-danger-light dark:bg-danger/15',
      trend: { value: '1.2%', isPositive: false },
      borderColor: 'border-border-subtle',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            style={{ animationDelay: `${i * 75}ms` }}
            className={`
              flex flex-col justify-between p-5
              bg-bg-surface border rounded-2xl shadow-subtle
              transition-all duration-200 ease-out animate-fadeIn
              hover:shadow-premium
              hover:scale-[1.03]
              hover:border-border-strong
              cursor-default
              ${card.borderColor}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-muted">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-xl lg:text-2xl font-bold tracking-tight text-text-main">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    card.trend.isPositive
                      ? 'text-success bg-success-light dark:bg-success/15'
                      : 'text-danger bg-danger-light dark:bg-danger/15'
                  }`}
                >
                  {card.trend.isPositive ? '↑' : '↓'} {card.trend.value}
                </span>
                <span className="text-[10px] text-text-muted">
                  vs prev period
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(StatsCards);
