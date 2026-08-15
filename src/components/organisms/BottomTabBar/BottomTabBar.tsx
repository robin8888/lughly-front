/**
 * BottomTabBar Organism
 * Píldora flotante translúcida, estilo Instagram (BOTTOM_NAV_MOBILE.md).
 *
 * No es la barra por defecto de expo-router con `tabBarStyle`: esa no se
 * puede convertir de forma fiable en píldora flotante con desenfoque. Se
 * monta como `tabBar` personalizado en el layout de Tabs.
 */

import { View, StyleSheet } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
/**
 * El tipo sale de la copia de bottom-tabs que trae expo-router. Se importa
 * de ahí para no añadir @react-navigation/bottom-tabs como dependencia
 * (sería una segunda copia, con riesgo de versiones distintas).
 */
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs'
import { NavItem } from '@/components/molecules/NavItem'
import type { IconName } from '@/components/atoms/Icon'
import {
  compactNav,
  NAV_WIDTH_COMPACT,
  NAV_WIDTH_NORMAL,
} from '@/hooks/ui/useCompactNav'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { styles } from './BottomTabBar.styles'

/** Pantallas sin sesión: ahí no hay barra */
export const HIDDEN_ROUTES = ['index', 'login', 'registro', 'recuperar']

interface TabDefinition {
  /** Nombre del fichero de ruta dentro de (tabs) */
  name: string
  label: string
  icon: IconName
  danger?: boolean
}

export const CLIENT_TABS: TabDefinition[] = [
  { name: 'inicio', label: 'Inicio', icon: 'home' },
  { name: 'pros', label: 'Pros', icon: 'users' },
  { name: 'publish', label: 'Publicar', icon: 'plus' },
  { name: 'urgent', label: 'Urgente', icon: 'alert', danger: true },
  { name: 'jobs', label: 'Trabajos', icon: 'briefcase' },
  { name: 'account', label: 'Cuenta', icon: 'user-circle' },
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
  { name: 'inicio', label: 'Inicio', icon: 'home' },
  { name: 'urgent', label: 'Urgencias', icon: 'alert', danger: true },
  { name: 'offers', label: 'Ofertas', icon: 'gavel' },
  { name: 'schedule', label: 'Agenda', icon: 'calendar' },
  { name: 'wallet', label: 'Cartera', icon: 'wallet' },
  { name: 'account', label: 'Cuenta', icon: 'user-circle' },
]

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const role = useEffectiveRole()
  const tabs = role === 'pro' ? PRO_TABS : CLIENT_TABS

  const currentRoute = state.routes[state.index]?.name ?? ''

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      compactNav.value,
      [0, 1],
      [NAV_WIDTH_NORMAL, NAV_WIDTH_COMPACT],
    ),
    opacity: interpolate(compactNav.value, [0, 1], [1, 0.95]),
  }))

  if (HIDDEN_ROUTES.includes(currentRoute)) return null

  /**
   * En una pantalla de pila (perfil, detalle, chat) no se marca ninguna
   * pestaña: el usuario no está "en" ninguna de ellas.
   */
  const isOnStackScreen = !tabs.some((tab) => tab.name === currentRoute)

  return (
    <Animated.View
      style={[styles.navBar, { bottom: 12 + insets.bottom }, animatedStyle]}
      testID="bottom-tab-bar"
    >
      <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />

      {tabs.map((tab) => (
        <NavItem
          key={tab.name}
          label={tab.label}
          icon={tab.icon}
          danger={tab.danger}
          active={!isOnStackScreen && currentRoute === tab.name}
          onPress={() => navigation.navigate(tab.name)}
          testID={`nav-${tab.name}`}
        />
      ))}
    </Animated.View>
  )
}
