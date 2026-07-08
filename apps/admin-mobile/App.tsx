import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { colors, ApiError } from '@clear-energy/shared';
import { PendingActionsScreen } from './src/screens/PendingActionsScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't burn retries on 4xx — only network/5xx are worth retrying.
      retry: (failureCount, error) =>
        failureCount < 2 &&
        !(error instanceof ApiError && error.kind === 'http' && (error.status ?? 500) < 500),
      staleTime: 30_000,
    },
  },
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.brand },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Pending Actions" component={PendingActionsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
