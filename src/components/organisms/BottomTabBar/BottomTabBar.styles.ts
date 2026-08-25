/**
 * BottomTabBar styles
 * Valores literales de BOTTOM_NAV_MOBILE.md §1 y §2.
 *
 * El ancho lo pone la animación (useCompactNav), no este fichero.
 */

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 80,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    /* Sobre material claro un filo blanco no dibuja: se pasa a oscuro tenue */
    borderColor: 'rgba(29, 45, 61, 0.12)',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    shadowColor: 'rgba(4, 7, 15, 1)',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
})
