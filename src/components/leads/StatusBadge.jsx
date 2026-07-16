

/**
 * @typedef {Object} StatusBadgeProps
 * @property {string} status - The status of the lead (e.g. 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost')
 */

/**
 * StatusBadge renders a pill-shaped colored badge reflecting the lead's current stage.
 * Matches theme styling with support for dark mode.
 *
 * @param {StatusBadgeProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered status badge
 */
export default function StatusBadge({ status }) {
  // Status style maps matching requirements
  const badgeStyles = {
    New: 'bg-bg-surface-hover text-text-muted border-border-subtle',
    Contacted: 'bg-primary-light text-primary border-primary/30',
    'Meeting Scheduled': 'bg-warning-light text-warning border-warning/30',
    'Proposal Sent': 'bg-primary-light text-primary border-primary/30',
    Won: 'bg-success-light text-success border-success/30',
    Lost: 'bg-danger-light text-danger border-danger/30',
  };

  const currentStyle = badgeStyles[status] || 'bg-bg-surface-hover text-text-muted border-border-subtle';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${currentStyle}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
