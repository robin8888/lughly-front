/**
 * BottomTabBar styles
 * Valores literales de BOTTOM_NAV_MOBILE.md §1 y §2.
 *
 * El ancho lo pone la animación (useCompactNav), no este fichero.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 80,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    /*
      El filo, invertido con el velo: la barra pasó de material claro a cristal
      navy, y sobre navy un contorno oscuro no dibuja. Es la misma línea que
      lleva el bocadillo de la home, por lo mismo y con el mismo valor.
    */
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    shadowColor: 'rgba(4, 7, 15, 1)',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  /**
   * El velo azul, encima del desenfoque.
   *
   * `navyGlass` y no un valor propio: es el mismo cristal que el bocadillo de
   * la home, y con dos números parecidos se verían como dos materiales
   * distintos en la misma pantalla. Ahí están los cálculos de contraste que
   * fijan ese 0,78.
   */
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.navyGlass,
  },
})
