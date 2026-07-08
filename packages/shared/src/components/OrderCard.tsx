import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, toneStyles, type Tone } from './theme';
import { formatPaise } from '../utils/money';

export interface ChipProps {
  label: string;
  tone: Tone;
}

/**
 * ONE card, three rendering modes — driven by generic, context-free props.
 * Apps never pass "customer/driver/admin" flags in here; instead the shared
 * adapters (adapters/cards.ts) map each API shape onto this neutral interface.
 *
 *  - customer-view: title=customer, statusChip=order status, amountPaise set
 *  - driver-view:   leading=seq bubble, subtitle=address, accessoryChip=ETA
 *  - admin-view:    statusChip=priority, accessoryChip=action affordance
 */
export interface OrderCardProps {
  /** Primary line (customer name / summary). */
  title: string;
  /** Secondary line (SKU / address). Truncated to two lines. */
  subtitle?: string;
  /** Small muted line under subtitle (order id · date, category · SLA age). */
  meta?: string;
  /** Right-aligned amount, formatted from integer paise. */
  amountPaise?: number;
  /** Status chip (order status / stop status / priority). */
  statusChip?: ChipProps;
  /** Secondary chip (ETA badge / action affordance). */
  accessoryChip?: ChipProps;
  /** Optional slot rendered before the text block (e.g. stop-sequence bubble). */
  leading?: ReactNode;
  /** Optional slot rendered below everything (composability escape hatch). */
  footer?: ReactNode;
  /** Visual emphasis for the "current" item (e.g. active trip stop). */
  highlighted?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function Chip({ label, tone }: ChipProps) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.chipText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function OrderCard(props: OrderCardProps) {
  const {
    title, subtitle, meta, amountPaise, statusChip, accessoryChip,
    leading, footer, highlighted, onPress, testID,
  } = props;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.row}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {amountPaise !== undefined ? (
              <Text style={styles.amount}>{formatPaise(amountPaise)}</Text>
            ) : null}
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
          {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}
          {(statusChip || accessoryChip) && (
            <View style={styles.chipRow}>
              {statusChip ? <Chip {...statusChip} /> : null}
              {accessoryChip ? <Chip {...accessoryChip} /> : null}
            </View>
          )}
        </View>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
  },
  cardHighlighted: { borderColor: colors.brand, borderWidth: 2 },
  cardPressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  leading: { marginRight: spacing.md },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, marginRight: spacing.sm },
  amount: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  meta: { marginTop: 4, fontSize: 12, color: colors.textMuted },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  chipText: { fontSize: 12, fontWeight: '600' },
  footer: { marginTop: spacing.md },
});
