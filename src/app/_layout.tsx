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
/**
 * Se importa peso a peso, desde su subcarpeta, y no desde la raíz del paquete.
 *
 * El `index.js` de `@expo-google-fonts/*` lleva un `require()` estático por
 * cada peso que trae la familia, así que importar de la raíz mete los 16
 * pesos de Nunito y los 5 de Fredoka en el bundle: 21 ficheros y 2,28 MB para
 * usar cuatro. Con la ruta completa entran solo los cuatro (~430 KB).
 *
 * Medido con `npx expo export`, que es lo que corre `eas build` por dentro.
 */
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular'
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold'
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold'
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StripeProvider } from '@stripe/stripe-react-native'
import { setupSessionBridge } from '@/api/sessionBridge'
import { useResetCacheOnAccountChange } from '@/hooks/auth/useResetCacheOnAccountChange'
import { usePushRegistration } from '@/hooks/push/usePushRegistration'
import { BottomTabBar } from '@/components/organisms/BottomTabBar'
import { LoadingOverlay } from '@/components/organisms/LoadingOverlay'
import {
  useHasHydrated,
  useIsAuthenticated,
  useMustChangePassword,
} from '@/stores/useAuthStore'
import { useIsLoading, useLoadingMessage } from '@/stores/useLoadingStore'

/**
 * Vigila el cambio de cuenta y tira lo cacheado.
 *
 * Es un componente y no una llamada dentro de `RootLayout` porque el hook
 * necesita el `QueryClient` del proveedor, y el proveedor se monta dentro del
 * propio `RootLayout`.
 */
function CacheGuard() {
  useResetCacheOnAccountChange()
  return null
}

// Mantener el splash nativo visible hasta que todo esté listo
SplashScreen.preventAutoHideAsync()

// Conecta el store de sesión con el cliente HTTP (renovación automática de tokens)
setupSessionBridge()

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

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
  /*
   * Los nombres de estas claves son los que `theme.typography.fonts` pone en
   * `fontFamily`: si dejan de coincidir, el texto cae a la fuente del sistema
   * sin avisar de nada.
   */
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Fredoka_600SemiBold,
  })
  const isAuthenticated = useIsAuthenticated()
  const mustChangePassword = useMustChangePassword()

  /**
   * Registra este móvil para los avisos en cuanto hay sesión. Va en la raíz
   * porque no es de ninguna pantalla: el token se renueva solo y hay que
   * mandarlo cada vez que se abre la app.
   */
  usePushRegistration()
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
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="lughly">
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

            {/*
              Quien entró con la contraseña que le puso su empleador no pasa de
              aquí. No es un aviso que se pueda cerrar: mientras esa contraseña
              siga viva, el empleador puede entrar como él, y entonces nada de
              lo que haga esa cuenta prueba quién lo hizo. Al retirar las tabs
              del navegador tampoco vale entrar por un enlace directo.
            */}
            <Stack.Protected guard={isAuthenticated && mustChangePassword}>
              <Stack.Screen name="cambiar-contrasena" />
            </Stack.Protected>

            <Stack.Protected guard={isAuthenticated && !mustChangePassword}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="empleados" />
              <Stack.Screen name="oficios" />
              <Stack.Screen name="mis-fotos" />
              <Stack.Screen name="horario-urgencias" />
              <Stack.Screen name="encargos" />
              <Stack.Screen name="encargar" />
              <Stack.Screen name="como-funciona" />
              <Stack.Screen name="mis-documentos" />
              {/*
                La voluntaria, desde Mi cuenta. No comparte ruta con
                `cambiar-contrasena`, que es la obligatoria y vive tras el
                guardián de arriba: allí dentro, a un usuario normal no se le
                abriría nunca.
              */}
              <Stack.Screen name="contrasena" />
              <Stack.Screen name="mi-horario" />
              <Stack.Screen name="mi-zona" />
              <Stack.Screen name="mis-ausencias" />
              <Stack.Screen name="mis-recargos" />
              <Stack.Screen name="mis-festivos" />
              <Stack.Screen name="trabajo/[id]" />
              {/*
                A quién llamar para una urgencia. Va declarada como las demás:
                `Stack.Protected` retira del navegador lo que no está en la
                lista, y una pantalla sin declarar se pinta pero luego no hay
                cómo salir de ella —la flecha de atrás dejaba la app colgada.
              */}
              <Stack.Screen name="urgencia/[id]" />
              <Stack.Screen name="mis-datos" />
              <Stack.Screen name="mis-favoritos" />
              <Stack.Screen name="revisar-documentos" />
              <Stack.Screen name="pro/[id]" />
              <Stack.Screen name="mis-pagos" />
              <Stack.Screen name="contratar-carta" />
              {/*
                El chat, igual que `urgencia/[id]`: sin declarar aquí, el
                navegador no sabe que tiene que retirarla al cerrar sesión.
                Quien cerraba sesión desde dentro de una conversación se
                quedaba con la pantalla montada y sin sesión con la que
                seguir pidiendo mensajes: la app se bloqueaba.
              */}
              <Stack.Screen name="mensajes" />
              <Stack.Screen name="mensajes/soporte" />
              <Stack.Screen name="mensajes/trabajo/[id]" />
            </Stack.Protected>

            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="login" />
              <Stack.Screen name="recuperar" />
            </Stack.Protected>
          </Stack>

          {/*
            La barra va fuera del Stack, no dentro del navegador de pestañas:
            así también sale en las pantallas de pila —el perfil de un
            profesional, el alta de trabajadores— y no aparece y desaparece
            según dónde esté el usuario. Ella misma se esconde en las pantallas
            de antes de entrar.
          */}
          {isAuthenticated && !mustChangePassword && <BottomTabBar />}

          {/*
            Vacía la caché al cambiar de cuenta. Va dentro del proveedor porque
            necesita su cliente, y sin renderizar nada: solo vigila.
          */}
          <CacheGuard />

          {/* Se monta una sola vez y lo controla useLoadingStore desde donde sea */}
          <LoadingOverlay
            visible={isLoading}
            message={loadingMessage ?? undefined}
            testID="loading-overlay"
          />
        </QueryClientProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  )
}
