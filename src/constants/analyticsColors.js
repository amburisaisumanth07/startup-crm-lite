/**
 * @fileoverview Analytics color palette for Startup CRM Lite.
 * Centralises all chart colours — Luxury Black & Gold brand palette.
 */

/** Maps each lead status to its brand colour. */
export const STATUS_COLORS = {
  New:                '#8A8578',   // muted warm grey — neutral entry
  Contacted:          '#C6A85B',   // brand gold — active engagement
  'Meeting Scheduled': '#D4A04A',  // warm amber-gold — advancing
  'Proposal Sent':    '#B07D2B',   // deep gold — proposal stage
  Won:                '#2D7A4F',   // success green — closed
  Lost:               '#B03535',   // danger red — dropped
};

/** Maps each lead source to a distinct accent colour. */
export const SOURCE_COLORS = {
  Website:          '#C6A85B',   // brand gold
  Referral:         '#2D7A4F',   // success green
  LinkedIn:         '#8A8578',   // muted warm
  'Cold Call':      '#D4A04A',   // amber-gold
  'Email Campaign': '#B07D2B',   // deep gold
  Other:            '#C0BAB0',   // neutral border tone
};

/** Ordered palette for generic multi-series charts. */
export const CHART_COLORS = [
  '#C6A85B',   // brand gold
  '#2D7A4F',   // success green
  '#D4A04A',   // amber-gold
  '#B07D2B',   // deep gold
  '#B03535',   // danger red
  '#8A8578',   // warm muted
  '#E7C977',   // light gold
  '#5C5750',   // text-muted dark
];

/** Gradient definitions reused across area / bar charts. */
export const GRADIENT_COLORS = {
  revenue: { start: '#C6A85B', end: 'rgba(198, 168, 91, 0)' },
  leads:   { start: '#D4A04A', end: 'rgba(212, 160, 74, 0)' },
  funnel:  { start: '#B07D2B', end: 'rgba(176, 125, 43, 0)' },
};

/** Heatmap intensity scale — gold opacity gradient. */
export const HEATMAP_SCALE = [
  'transparent',
  'rgba(198, 168, 91, 0.15)',
  'rgba(198, 168, 91, 0.35)',
  'rgba(198, 168, 91, 0.60)',
  'rgba(198, 168, 91, 0.85)',
  '#C6A85B',
];

