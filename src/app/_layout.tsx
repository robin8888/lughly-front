/**
 * Root layout para expo-router
 * Configura providers globales (fuentes, TanStack Query) y protege las rutas.
 *
 * Patrón de autenticación según la documentación de Expo Router:
 * `Stack.Protected` retira del navegador las pantallas que no corresponden al
 * estado de sesión. No es solo cosmético: impide también entrar por deep link.
 */

import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import {
  Barlow_400Regular,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow'
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { setupSessionBridge } from '@/api/sessionBridge'
import { LoadingOverlay } from '@/components/organisms/LoadingOverlay'
import { useHasHydrated, useIsAuthenticated } from '@/stores/useAuthStore'
import { useIsLoading, useLoadingMessage } from '@/stores/useLoadingStore'

// Mantener el splash nativo visible hasta que todo esté listo
SplashScreen.preventAutoHideAsync()

// Conecta el store de sesión con el cliente HTTP (renovación automática de tokens)
setupSessionBridge()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 10, // 10 min
    },
  },
})

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Barlow_400Regular,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_600SemiBold,
  })
  const isAuthenticated = useIsAuthenticated()
  const hasHydrated = useHasHydrated()
  const isLoading = useIsLoading()
  const loadingMessage = useLoadingMessage()

  // Se espera también a la sesión: así un usuario con sesión guardada no ve
  // el splash de entrada parpadear antes de entrar a las tabs.
  const isReady = (fontsLoaded || fontError !== null) && hasHydrated

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync()
    }
  }, [isReady])

  if (!isReady) {
    return null
  }

  return (
    // Sin este contenedor en la raíz, los gestos (arrastrar el carrusel)
    // no llegan a los componentes.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
        {/* Punto de entrada: decide entre splash y tabs */}
        <Stack.Screen name="index" />

        {/*
          Registro sin proteger a propósito: durante el alta hay una sesión
          activa momentánea para poder subir los documentos. Si estuviera
          protegido con `!isAuthenticated`, la pantalla se desmontaría en
          mitad de las subidas. Al terminar, la sesión se cierra y el
          usuario entra por el login.
        */}
        <Stack.Screen name="registro" />

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="login" />
            <Stack.Screen name="recuperar" />
          </Stack.Protected>
        </Stack>

        {/* Se monta una sola vez y lo controla useLoadingStore desde donde sea */}
        <LoadingOverlay
          visible={isLoading}
          message={loadingMessage ?? undefined}
          testID="loading-overlay"
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
