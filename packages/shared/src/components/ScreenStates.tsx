import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from './theme';

/** Shared loading / empty / error views so all three apps present the
 *  four standard states identically. */

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} testID="state-loading">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyView({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.center} testID="state-empty">
      <Text style={styles.emoji}>🗒️</Text>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.muted}>{hint}</Text> : null}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center} testID="state-error">
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emoji: { fontSize: 40 },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' },
  muted: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  button: {
    marginTop: spacing.md, backgroundColor: colors.brand, borderRadius: 10,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
