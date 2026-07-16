import { useTheme } from '../context/ThemeContext';

/**
 * useChartTheme — returns Recharts-compatible style objects and class strings
 * that are always in sync with the active light / dark theme.
 *
 * Usage:
 *   const { tooltipStyle, tooltipWrapperClass, cardClass } = useChartTheme();
 */
export function useChartTheme() {
  const { isDarkMode } = useTheme();

  /**
   * Inline style passed directly to Recharts <Tooltip contentStyle={…} />.
   * This overrides Recharts' own tooltip background so it matches the page surface.
   */
  const tooltipStyle = isDarkMode
    ? {
        backgroundColor: '#1B1B1B',   // brand dark surface
        border: '1px solid #2C2C2C',  // brand dark border-subtle
        borderRadius: '12px',
        color: '#FAFAF7',             // brand dark text-main
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.70), 0 0 0 1px rgba(231,201,119,0.08)',
        fontSize: '12px',
        padding: '10px 14px',
      }
    : {
        backgroundColor: '#F2EFE8',   // brand light surface
        border: '1px solid #D8D2C8',  // brand light border-subtle
        borderRadius: '12px',
        color: '#151515',             // brand light text-main
        boxShadow: '0 4px 6px -1px rgba(21,21,21,0.08), 0 10px 15px -3px rgba(21,21,21,0.05)',
        fontSize: '12px',
        padding: '10px 14px',
      };

  /**
   * Tailwind classes for the custom tooltip JSX wrapper used in all charts.
   */
  const tooltipWrapperClass = isDarkMode
    ? 'p-3 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-main shadow-premium'
    : 'p-3 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-main shadow-premium';

  /**
   * Tailwind classes for the outer card wrapper of every chart card.
   * Adds subtle scale-lift + stronger shadow on hover, with a smooth transition.
   */
  const cardClass =
    'flex flex-col bg-bg-surface border border-border-subtle ' +
    'rounded-2xl p-6 shadow-subtle ' +
    'transition-all duration-200 ease-out ' +
    'hover:shadow-premium hover:scale-[1.01] ' +
    'hover:border-border-strong';

  /** Muted axis tick colour – used for Recharts XAxis/YAxis tick fill */
  const tickColor = isDarkMode ? '#8A8578' : '#5C5750';

  /** Grid stroke colour */
  const gridColor = isDarkMode ? '#2C2C2C' : '#D8D2C8';

  return { tooltipStyle, tooltipWrapperClass, cardClass, tickColor, gridColor, isDarkMode };
}
