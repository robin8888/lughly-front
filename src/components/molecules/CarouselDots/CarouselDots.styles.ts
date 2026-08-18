/**
 * CarouselDots styles
 * HOME_MOBILE.md §1: row, centrado, gap 6, marginTop -14
 */

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  /**
   * `marginTop` negativo para subirlos dentro del carrusel, y `marginBottom`
   * para que no queden pegados al borde de la foto de fondo.
   *
   * El de abajo hace falta porque el fondo cubre la sección entera: los puntos
   * son el último hijo en flujo, así que sin este margen la sección termina
   * justo donde terminan ellos y quedan cortados contra el canto de la imagen.
   * Subir solo el `marginTop` no valdría —encogería la sección con ellos y
   * seguirían igual de pegados al borde—.
   */
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: -26,
    marginBottom: 18,
  },
})
