import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  ApiError, EmptyView, ErrorView, LoadingView, OrderCard,
  createApiClient, tripStopToCard, colors, spacing, type TripStop,
} from '@clear-energy/shared';
import { API_URL } from '../config';

const DRIVER_ID = 'd-101';

/** Stop-sequence bubble, passed to OrderCard via its `leading` slot. */
function SeqBubble({ stop }: { stop: TripStop }) {
  const done = stop.status === 'done';
  return (
    <View style={[styles.bubble, done && styles.bubbleDone, stop.status === 'active' && styles.bubbleActive]}>
      <Text style={[styles.bubbleText, (done || stop.status === 'active') && styles.bubbleTextLight]}>
        {done ? '✓' : stop.seq}
      </Text>
    </View>
  );
}

export function TodaysTripScreen() {
  const api = useMemo(() => createApiClient({ baseUrl: API_URL, userId: DRIVER_ID }), []);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['trips', DRIVER_ID],
    queryFn: ({ signal }) => api.getTripStops(DRIVER_ID, { signal }),
    select: (stops) => [...stops].sort((a, b) => a.seq - b.seq),
  });

  if (isPending) return <LoadingView label="Loading today's route…" />;
  if (isError) {
    return (
      <ErrorView
        message={error instanceof ApiError ? error.userMessage : 'Unexpected error.'}
        onRetry={() => refetch()}
      />
    );
  }
  if (data.length === 0) {
    return <EmptyView title="No trip assigned" hint="Check back once dispatch assigns your route." />;
  }

  const doneCount = data.filter((s) => s.status === 'done').length;

  return (
    <FlatList
      data={data}
      keyExtractor={(s) => `${s.seq}-${s.orderId}`}
      ListHeaderComponent={
        <Text style={styles.summary}>
          {doneCount} of {data.length} stops done · {data.reduce((km, s) => km + s.distanceKm, 0).toFixed(1)} km total
        </Text>
      }
      renderItem={({ item }) => (
        <OrderCard {...tripStopToCard(item)} leading={<SeqBubble stop={item} />} />
      )}
      contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />
      }
    />
  );
}

const styles = StyleSheet.create({
  summary: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    fontSize: 13, fontWeight: '600', color: colors.textMuted,
  },
  bubble: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutralBg, borderWidth: 1, borderColor: colors.border,
  },
  bubbleDone: { backgroundColor: colors.success, borderColor: colors.success },
  bubbleActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  bubbleText: { fontSize: 13, fontWeight: '700', color: colors.neutral },
  bubbleTextLight: { color: '#fff' },
});
