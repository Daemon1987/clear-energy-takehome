/** Shared design tokens — one source of design language for all three apps. */
export const colors = {
  brand: '#0F766E',
  brandDark: '#115E59',
  bg: '#F4F6F5',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  success: '#047857',
  successBg: '#D1FAE5',
  info: '#1D4ED8',
  infoBg: '#DBEAFE',
  neutral: '#374151',
  neutralBg: '#F3F4F6',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const toneStyles: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: colors.neutral, bg: colors.neutralBg },
  info: { fg: colors.info, bg: colors.infoBg },
  success: { fg: colors.success, bg: colors.successBg },
  warning: { fg: colors.warning, bg: colors.warningBg },
  danger: { fg: colors.danger, bg: colors.dangerBg },
};
