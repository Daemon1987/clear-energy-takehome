import { Platform } from 'react-native';

/**
 * Mock backend URL. Android emulators cannot see the host's localhost —
 * 10.0.2.2 is the emulator's alias for it. Override with EXPO_PUBLIC_API_URL
 * (e.g. your LAN IP when testing on a physical device).
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' });
