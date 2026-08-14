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
    borderColor: 'rgba(255, 255, 255, 0.22)',
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: 'rgba(4, 7, 15, 1)',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  /** Velo de acento POR ENCIMA del desenfoque, nunca opaco del todo */
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(89, 128, 166, 0.72)',
  },
})
