import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../src/stores/authStore';
import { registerForPushNotifications } from '../src/services/push';

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// Prevent splash screen from hiding
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Custom theme
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E53935',
    secondary: '#FF5722',
    tertiary: '#FFC107',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#E53935',
    secondary: '#FF5722',
    tertiary: '#FFC107',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;
  const { loadToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        await loadToken();
        if (isAuthenticated) {
          await registerForPushNotifications();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Ürün Detay' }} />
          <Stack.Screen name="collection/[id]" options={{ title: 'Koleksiyon' }} />
          <Stack.Screen name="trade/[id]" options={{ title: 'Takas Detay' }} />
          <Stack.Screen name="messages/[id]" options={{ title: 'Mesajlar' }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
