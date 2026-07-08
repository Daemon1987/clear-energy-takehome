import { useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  ApiError, EmptyView, ErrorView, LoadingView, OrderCard,
  createApiClient, pendingActionToCard, colors, type PendingAction,
} from '@clear-energy/shared';
import { API_URL } from '../config';

const ADMIN_ID = 'a-201';

// Most urgent first: breached SLAs, then priority, then oldest.
const PRIORITY_RANK: Record<PendingAction['priority'], number> = {
  breached: 0, high: 1, med: 2, low: 3,
};

export function PendingActionsScreen() {
  const api = useMemo(() => createApiClient({ baseUrl: API_URL, userId: ADMIN_ID }), []);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['pending-actions', ADMIN_ID],
    queryFn: ({ signal }) => api.getPendingActions(ADMIN_ID, { signal }),
    select: (items) =>
      [...items].sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.ageMinutes - a.ageMinutes,
      ),
  });

  if (isPending) return <LoadingView label="Loading your queue…" />;
  if (isError) {
    return (
      <ErrorView
        message={error instanceof ApiError ? error.userMessage : 'Unexpected error.'}
        onRetry={() => refetch()}
      />
    );
  }
  if (data.length === 0) {
    return <EmptyView title="Inbox zero 🎉" hint="Nothing pending your action right now." />;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => <OrderCard {...pendingActionToCard(item)} />}
      contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />
      }
    />
  );
}
