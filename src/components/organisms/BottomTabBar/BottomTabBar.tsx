/**
 * BottomTabBar Organism
 * Píldora flotante translúcida, estilo Instagram (BOTTOM_NAV_MOBILE.md).
 *
 * No es la barra por defecto de expo-router con `tabBarStyle`: esa no se
 * puede convertir de forma fiable en píldora flotante con desenfoque.
 *
 * Tampoco se monta como `tabBar` del navegador de pestañas, aunque sea lo
 * natural: así solo saldría en las nueve rutas de `(tabs)` y desaparecería
 * en el detalle de un profesional o en la pantalla de trabajadores, que son
 * pantallas de pila. La barra se monta una sola vez en el layout raíz, por
 * encima de todo, y se orienta con la ruta actual en vez de con el estado
 * del navegador. Una barra que va y viene según la pantalla se siente como
 * dos aplicaciones distintas.
 */

import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useRouter, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavItem } from '@/components/molecules/NavItem'
import type { IconName } from '@/components/atoms/Icon'
import {
  compactNav,
  resetCompactNav,
  NAV_WIDTH_COMPACT,
  NAV_WIDTH_NORMAL,
} from '@/hooks/ui/useCompactNav'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { styles } from './BottomTabBar.styles'

/**
 * Pantallas sin barra. Son las de antes de estar dentro: la de entrada, el
 * alta y la recuperación. El registro deja una sesión momentánea abierta
 * para poder subir los documentos, así que no basta con mirar si hay sesión.
 */
export const HIDDEN_PATHS = ['/', '/login', '/registro', '/recuperar']

/**
 * Y una conversación (`/mensajes/trabajo/[id]`, `/mensajes/soporte`): lleva
 * su propia caja de escribir pegada abajo, con el teclado encima. No hay
 * ningún otro sitio en la app con un control fijo ahí, y la píldora flotando
 * sobre el teclado o encima de la caja de escribir no tiene hueco limpio
 * donde ir. La lista de hilos (`/mensajes`, sin nada detrás) sí la conserva,
 * como cualquier otra lista.
 */
function isThreadPath(pathname: string): boolean {
  return pathname.startsWith('/mensajes/')
}

interface TabDefinition {
  /**
   * Ruta completa, no el nombre del fichero: la barra ya no vive dentro del
   * navegador de pestañas, así que navega con el router como cualquier otro
   * sitio de la app. Con el tipo de expo-router, una ruta que no exista es
   * un error de compilación y no un toque que no hace nada.
   */
  path: TabPath
  label: string
  icon: IconName
  danger?: boolean
}

type TabPath =
  | '/inicio'
  | '/pros'
  | '/urgent'
  | '/jobs'
  | '/schedule'
  | '/wallet'
  | '/account'

export const CLIENT_TABS: TabDefinition[] = [
  { path: '/inicio', label: 'Inicio', icon: 'home' },
  { path: '/pros', label: 'Pros', icon: 'users' },
  { path: '/urgent', label: 'Urgente', icon: 'alert', danger: true },
  { path: '/jobs', label: 'Trabajos', icon: 'briefcase' },
  { path: '/account', label: 'Cuenta', icon: 'user-circle' },
]

/**
 * El README describe 5 pestañas de profesional. Urgencias se añadió el 15
 * Agosto 2026 y Ofertas —la bandeja de subastas— se retiró el 22 Agosto al
 * quitar la subasta entera (v3 §0), así que se queda en 5 con distinta
 * composición: Urgencias sigue porque una urgencia se pierde en minutos, y
 * es además donde más cobra, por el recargo de salir corriendo.
 */
export const PRO_TABS: TabDefinition[] = [
  { path: '/inicio', label: 'Inicio', icon: 'home' },
  { path: '/urgent', label: 'Urgencias', icon: 'alert', danger: true },
  { path: '/schedule', label: 'Agenda', icon: 'calendar' },
  { path: '/wallet', label: 'Cartera', icon: 'wallet' },
  { path: '/account', label: 'Cuenta', icon: 'user-circle' },
]

/**
 * Lo que solo ve quien contrata y factura. Un trabajador por cuenta ajena
 * ejecuta el trabajo, pero el dinero no es suyo.
 */
const EMPLOYER_ONLY_TABS: TabPath[] = ['/wallet']

export function BottomTabBar() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const pathname = usePathname()
  const role = useEffectiveRole()
  const isEmployee = useIsEmployee()

  /**
   * Al empleado se le quita Cartera: el dinero del trabajo es de quien lo
   * contrata y factura, que es su empleador, no suyo.
   */
  const tabs =
    role === 'pro'
      ? isEmployee
        ? PRO_TABS.filter((tab) => !EMPLOYER_ONLY_TABS.includes(tab.path))
        : PRO_TABS
      : CLIENT_TABS

  /**
   * Al cambiar de pantalla vuelve a su tamaño normal. Sin esto, salir de una
   * pantalla con el scroll bajado dejaría la barra encogida en la siguiente,
   * que empieza arriba del todo: se vería estrecha sin motivo hasta que el
   * usuario hiciera scroll allí.
   */
  useEffect(() => {
    resetCompactNav()
  }, [pathname])

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      compactNav.value,
      [0, 1],
      [NAV_WIDTH_NORMAL, NAV_WIDTH_COMPACT],
    ),
    opacity: interpolate(compactNav.value, [0, 1], [1, 0.95]),
  }))

  if (HIDDEN_PATHS.includes(pathname) || isThreadPath(pathname)) return null

  return (
    <Animated.View
      style={[styles.navBar, { bottom: 12 + insets.bottom }, animatedStyle]}
      testID="bottom-tab-bar"
    >
      <BlurView
          /*
           * Sin `blurMethod`, en Android `BlurView` no desenfoca: dibuja
           * una vista semitransparente. `...Sdk31Plus` usa el desenfoque
           * real en Android 12 o superior y en versiones anteriores no
           * dibuja nada, que es mejor que un velo mal puesto.
           */
          blurMethod="dimezisBlurViewSdk31Plus"
          /*
           * `systemUltraThinMaterialLight` (25 Agosto 2026). Dos descartes
           * por el camino: `dark` no esmerila —oscurece lo que hay detrás, y
           * sobre las pantallas blancas daba una barra gris— y
           * `systemChromeMaterial` es el más OPACO de la familia, pensado
           * para tapar. El ultrafino es el más transparente de los
           * materiales de Apple: deja ver el contenido difuminado por
           * detrás, que es lo que se busca.
           *
           * La variante `...Light` en vez de `systemChromeMaterial` a secas
           * porque esa se adapta al modo del sistema y en oscuro volvería la
           * barra negra, dejando ilegibles unos iconos que aquí son oscuros.
           * El tema de la app es claro y único; la barra también.
           *
           * En Android los materiales de Apple no existen: el desenfoque real
           * lo pone `blurMethod`, y el matiz cae en el que haya por defecto.
           *
           * El azul **vuelve** (26 Agosto 2026), pero en el navy de
           * `navyGlass` y no en el acento de entonces: aquel dejaba el blanco
           * encima en 2,6:1, y ahora los iconos son blancos.
           */
          intensity={40} tint="systemUltraThinMaterialLight" style={StyleSheet.absoluteFill}
        />

      {/*
        Y encima el velo. Va aparte del `BlurView` y no como fondo de la barra:
        con el color en la barra, el desenfoque quedaría por delante y acabaría
        difuminando su propio velo en vez de la pantalla de detrás.
      */}
      <View style={styles.veil} pointerEvents="none" />

      {tabs.map((tab) => (
        <NavItem
          key={tab.path}
          label={tab.label}
          icon={tab.icon}
          danger={tab.danger}
          /**
           * En una pantalla de pila —el perfil de un profesional, el alta de
           * trabajadores— no se enciende ninguna: el usuario no está "en"
           * ninguna pestaña, y encender la última visitada sería mentir.
           */
          active={tab.path === pathname}
          /**
           * `navigate` y no `push`: reutiliza la pestaña que ya existe en
           * vez de apilar otra copia encima.
           */
          onPress={() => router.navigate(tab.path)}
          testID={`nav-${tab.path.slice(1)}`}
        />
      ))}
    </Animated.View>
  )
}
