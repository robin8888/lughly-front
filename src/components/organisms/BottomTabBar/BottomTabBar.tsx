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
import { View, StyleSheet } from 'react-native'
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
  | '/publish'
  | '/urgent'
  | '/jobs'
  | '/offers'
  | '/schedule'
  | '/wallet'
  | '/account'

export const CLIENT_TABS: TabDefinition[] = [
  { path: '/inicio', label: 'Inicio', icon: 'home' },
  { path: '/pros', label: 'Pros', icon: 'users' },
  { path: '/publish', label: 'Publicar', icon: 'plus' },
  { path: '/urgent', label: 'Urgente', icon: 'alert', danger: true },
  { path: '/jobs', label: 'Trabajos', icon: 'briefcase' },
  { path: '/account', label: 'Cuenta', icon: 'user-circle' },
]

/**
 * El README describe 5 pestañas de profesional. Son 6 desde el 15 Agosto
 * 2026, con Urgencias.
 *
 * El motivo: una urgencia se pierde en minutos. Si el profesional tiene que
 * pasar por Inicio para verla, llega tarde, y llegar tarde a una urgencia es
 * lo único que esta función no puede permitirse. Es además donde más cobra,
 * por el recargo de salir corriendo.
 */
export const PRO_TABS: TabDefinition[] = [
  { path: '/inicio', label: 'Inicio', icon: 'home' },
  { path: '/urgent', label: 'Urgencias', icon: 'alert', danger: true },
  { path: '/offers', label: 'Ofertas', icon: 'gavel' },
  { path: '/schedule', label: 'Agenda', icon: 'calendar' },
  { path: '/wallet', label: 'Cartera', icon: 'wallet' },
  { path: '/account', label: 'Cuenta', icon: 'user-circle' },
]

/**
 * Lo que solo ve quien contrata y factura. Un trabajador por cuenta ajena
 * ejecuta el trabajo, pero ni puja por él ni cobra por él.
 */
const EMPLOYER_ONLY_TABS: TabPath[] = ['/offers', '/wallet']

export function BottomTabBar() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const pathname = usePathname()
  const role = useEffectiveRole()
  const isEmployee = useIsEmployee()

  /**
   * Al empleado se le quitan Ofertas y Cartera: el dinero del trabajo es de
   * quien lo contrata y factura, que es su empleador. La lista de subastas
   * además lleva presupuestos e importes de pujas, así que enseñársela y
   * luego negarle el botón sería peor que no enseñársela.
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

  if (HIDDEN_PATHS.includes(pathname)) return null

  return (
    <Animated.View
      style={[styles.navBar, { bottom: 12 + insets.bottom }, animatedStyle]}
      testID="bottom-tab-bar"
    >
      <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />

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
