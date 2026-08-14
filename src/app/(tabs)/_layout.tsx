/**
 * Layout de las pestañas.
 *
 * La barra es un `tabBar` personalizado (BOTTOM_NAV_MOBILE.md §7): píldora
 * flotante con desenfoque. La de serie no se puede convertir en eso con
 * `tabBarStyle`, así que se sustituye entera.
 *
 * Todas las rutas existen siempre —expo-router registra el directorio
 * completo—; qué pestañas se ven lo decide `BottomTabBar` según el rol.
 */

import { Tabs } from 'expo-router'
import { BottomTabBar } from '@/components/organisms/BottomTabBar'

export const unstable_settings = {
  initialRouteName: 'inicio',
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="pros" />
      <Tabs.Screen name="publish" />
      <Tabs.Screen name="urgent" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="offers" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="account" />
    </Tabs>
  )
}
