/**
 * Layout de las pestañas.
 *
 * Sin barra propia: la píldora flotante (BOTTOM_NAV_MOBILE.md §7) la monta
 * el layout raíz por encima de toda la app, para que también salga en las
 * pantallas de pila —el perfil de un profesional, el alta de trabajadores—,
 * que no viven aquí dentro. Aquí solo se declara que no se pinte la de
 * serie: dos barras a la vez, una encima de otra.
 *
 * Todas las rutas existen siempre —expo-router registra el directorio
 * completo—; qué pestañas se ven lo decide `BottomTabBar` según el rol.
 */

import { Tabs } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'inicio',
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => null}
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
