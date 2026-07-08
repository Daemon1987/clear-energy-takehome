import { useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  ApiError, EmptyView, ErrorView, LoadingView, OrderCard,
  createApiClient, orderToCard, colors,
} from '@clear-energy/shared';
import { API_URL } from '../config';

// Auth is out of scope per the brief — hardcoded customer id.
const CUSTOMER_ID = 'c-001';

export function TodaysOrdersScreen() {
  const api = useMemo(() => createApiClient({ baseUrl: API_URL, userId: CUSTOMER_ID }), []);

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['orders', CUSTOMER_ID],
    // React Query passes an AbortSignal — in-flight requests are cancelled on unmount.
    queryFn: ({ signal }) => api.getOrders(CUSTOMER_ID, { signal }),
  });

  if (isPending) return <LoadingView label="Fetching your orders…" />;
  if (isError) {
    return (
      <ErrorView
        message={error instanceof ApiError ? error.userMessage : 'Unexpected error.'}
        onRetry={() => refetch()}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EmptyView
        title="No orders yet"
        hint="When you book a cylinder, it will show up here with live status."
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => <OrderCard {...orderToCard(item)} />}
      contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />
      }
    />
  );
}
